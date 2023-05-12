import asyncio
import json
import re
from functools import partial, reduce
from json import JSONDecodeError
from typing import Awaitable, Literal
from uuid import uuid4

import httpx
from fastapi import status, Response, Header
from fastapi.responses import JSONResponse

from app import app
from app.models.user import User
from app.utils.cache import async_cache
from app.utils.func import node_sum, get_empty_node
from app.utils.time import HOUR
from config import MARZBAN_SERVERS, redis_connection


@async_cache(timeout=8 * HOUR)
async def get_token(marzban_url: str) -> str | None:
    credentials = MARZBAN_SERVERS.get(marzban_url)
    if not credentials or not credentials.get('username') or not credentials.get('password'):
        raise Exception(f"This Marzban server with domain {marzban_url} is not registered in "
                        "MarzBoard; you should fill `nodes.json` file to do so.")

    async with httpx.AsyncClient(timeout=20) as client:
        client: httpx.AsyncClient
        try:
            response = await client.post(f"{marzban_url}/api/admin/token", data={
                "username": credentials.get('username'),
                "password": credentials.get('password'),
            })
            access_token = response.json().get('access_token')
            return access_token
        except httpx.ConnectError as e:
            print('httpx.ConnectError', e)
            return None


async def http_get_user_from(url: str, user: User):
    async with httpx.AsyncClient(timeout=20) as client:
        client: httpx.AsyncClient
        try:
            access_token = await get_token(url)
            response = await client.get(f"{url}/api/user/{user.username}", headers={
                "Authorization": f"Bearer {access_token}"
            })
        except httpx.ConnectError as e:
            print(f'httpx.ConnectError {url}:', e)
            return False

        try:
            if response.is_success:
                proxies = response.json().get('proxies', {})
                valid_passwords = []
                if vless := proxies.get('vless'):
                    valid_passwords.append(vless.get('id').split('-', 1)[0])
                if vmess := proxies.get('vmess'):
                    valid_passwords.append(vmess.get('id').split('-', 1)[0])
                if trojan := proxies.get('trojan'):
                    valid_passwords.append(trojan.get('password')[:8])
                if shadowsocks := proxies.get('shadowsocks'):
                    valid_passwords.append(shadowsocks.get('password')[:8])
                if user.password in valid_passwords:
                    return response

            print(f'[BOARD ERROR] incorrect password {url} - {user.password} - {user.username}')

        except (JSONDecodeError, TypeError, IndexError):
            print(f'[BOARD ERROR] Not found user {url}:', response)

        return False


@app.post("/login/")
async def login(user: User, response: Response):
    if user.is_admin:
        token = uuid4().hex
        ok = await redis_connection.set(token, f'{user.username}:{user.password}')
        if not ok:
            print('[BOARD ERROR] Redis is not ok!')
            return JSONResponse(content={'detail': "server error"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return {
            "is_admin": True,
            "access_token": token,
        }
    responses_promise: list[Awaitable[Literal[False] | httpx.Response]] = [
        http_get_user_from(url, user) for url in MARZBAN_SERVERS
    ]
    response_list = await asyncio.gather(*responses_promise)
    res: httpx.Response | None = next(filter(bool, response_list), None)
    if res is None:
        return JSONResponse(content={'detail': "User not found"}, status_code=status.HTTP_404_NOT_FOUND)

    port = '' if not res.url.port or res.url.port in [80, 443] else f':{res.url.port}'
    user_marzbanserver = f"{res.url.scheme}://{res.url.host}{port}"
    return {
        **res.json(),
        "marzbanserver": user_marzbanserver,
        "access_token": f"{user.username}:{user.password}"
    }


@app.get("/info/")
async def info(response: Response, authorization: str | None = Header(), marzbanserver: str | None = Header()):
    if authorization is None or marzbanserver is None or ":" not in authorization:
        response.status_code = 403
        return {"detail": "permission denied"}

    if marzbanserver not in MARZBAN_SERVERS:
        response.status_code = 401
        return {"detail": "wrong marzban server"}

    username, password = authorization.split(':', 1)
    user = User.parse_obj({"username": username, "password": password, 'marzbanserver': marzbanserver})
    resp = await http_get_user_from(marzbanserver, user)
    if not resp:
        response.status_code = 403
        return {"detail": "permission denied"}

    resp_data = resp.json()
    links: list[str] = resp_data.get('links', [])
    if MARZBAN_SERVERS.get(marzbanserver, {}).get('random_sni', False):
        randomized_sni_links = []
        random_sni = uuid4().hex[:10]
        for link in links:
            if link.startswith('vless') and (searcher := re.search('sni=([^&]+)', link)):
                domain = searcher[1].split('.', 1)[1]
                randomized_sni_links.append(re.sub("sni=[^&]+", f"sni={random_sni}.{domain}", link))
            else:
                randomized_sni_links.append(link)
        links = randomized_sni_links

    return {
        **resp_data,
        "links": links,
    }


async def assure_sni(links, sni):
    corrected_links = []
    for link in links:
        if 'sni=&' not in link:
            corrected_links.append(link)
        else:
            corrected_links.append(
                link.replace('security=none', 'security=tls').replace('sni=', f"sni={sni}")
            )
    return corrected_links


async def find_sni(links):
    has_sni_pattern = '.*sni=([^&]+)&.*'
    matcher = next(
        filter(
            bool,
            map(
                partial(re.search, has_sni_pattern),
                links
            )
        ),
        None
    )
    return matcher


async def http_get_all_users_from(url: str):
    async with httpx.AsyncClient(timeout=20) as client:
        client: httpx.AsyncClient
        try:
            access_token = await get_token(url)
            response = await client.get(f"{url}/api/users", headers={
                "Authorization": f"Bearer {access_token}"
            })
            return response
        except httpx.ConnectError as e:
            print('[BOARD ERROR] httpx.ConnectError', e)
        except json.JSONDecodeError as e:
            print('[BOARD ERROR] json decode error', e)

        return None


@app.get("/admin/")
async def admin(response: Response, authorization: str | None = Header()):
    creds = await redis_connection.get(authorization)
    if not creds or ":" not in creds:
        return JSONResponse(content={'detail': "permission denied"}, status_code=status.HTTP_403_FORBIDDEN)
    username, password = creds.split(':')
    user = User.parse_obj({"username": username, "password": password})
    if not user.is_admin:
        return JSONResponse(content={'detail': "permission denied"}, status_code=status.HTTP_403_FORBIDDEN)

    responses_promise: list[Awaitable[Literal[None] | httpx.Response]] = [
        http_get_all_users_from(url) for url in MARZBAN_SERVERS
    ]
    response_list = await asyncio.gather(*responses_promise)
    results: list[httpx.Response] = list(filter(bool, response_list))
    if not results:
        return JSONResponse(content={'detail': "no users available"}, status_code=status.HTTP_404_NOT_FOUND)

    data = {
        "nodes": {
            r.url.host: {
                "users": r.json()
            } for r in results
        }
    }

    data['nodes']['all'] = reduce(node_sum, list(data['nodes'].values()), get_empty_node())
    return data
