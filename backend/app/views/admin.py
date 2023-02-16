import asyncio
import re
from functools import partial
from json import JSONDecodeError
from typing import Awaitable, Literal

import httpx
from fastapi import status, Response, Header
from fastapi.responses import JSONResponse

from app import app
from app.models.user import User
from app.utils.cache import async_cache
from app.utils.time import MINUTE
from config import MARZBAN_SERVERS


@async_cache(timeout=15 * MINUTE)
async def get_token(marzban_url: str) -> str | None:
    credentials = MARZBAN_SERVERS.get(marzban_url)
    if not credentials or not credentials.get('username') or not credentials.get('password'):
        raise Exception(f"This Marzban server with domain {marzban_url} is not registered in "
                        "MarzBoard; you should fill `marzban_servers.json` file to do so.")

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

            print(f'incorrect password {url} - {user.password} - {user.username}')
            return False
        except (JSONDecodeError, TypeError, IndexError):
            print(f'Not found user {url}:', response)
            return False


@app.post("/login/")
async def login(user: User, response: Response):
    responses_promise: list[Awaitable[Literal[False] | httpx.Response]] = [
        http_get_user_from(url, user) for url in MARZBAN_SERVERS
    ]
    response_list = await asyncio.gather(*responses_promise)
    res: httpx.Response | None = next(filter(bool, response_list), None)
    if res is None:
        return JSONResponse(content={'detail': "User not found"}, status_code=status.HTTP_404_NOT_FOUND)

    user_marzbanserver = f"{res.url.scheme}://{res.url.host}"
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
    links = resp_data.get('links', [])

    matcher = await find_sni(links)
    if not matcher:
        return JSONResponse(content={'detail': "No correct sni found"}, status_code=status.HTTP_501_NOT_IMPLEMENTED)
    sni = matcher.groups()[0]

    corrected_links = await assure_sni(links, sni)

    return {
        **resp_data,
        "links": corrected_links,
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
