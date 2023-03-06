import asyncio
import json

import httpx
from fastapi import status, Header
from fastapi.responses import JSONResponse
from config import MARZBAN_SERVERS
from app import app


@app.get("/censorship-status/")
async def censorship_status(marzbanserver: str | None = Header()):
    node_domain = MARZBAN_SERVERS.get(marzbanserver, {}).get("node_domain")
    if not node_domain:
        print(f'[BOARD WARNING] NodeDomain is not provided with this marzbanserver: {marzbanserver}')
        return JSONResponse(content={'detail': "wrong marzbanserver"}, status_code=status.HTTP_403_FORBIDDEN)

    async with httpx.AsyncClient(timeout=20) as client:
        params = {'host': node_domain, 'node': [
            "ir1.node.check-host.net", "ir4.node.check-host.net", "ir3.node.check-host.net"
        ]}
        client: httpx.AsyncClient
        try:
            response = await client.get(
                f"https://check-host.net/check-dns",
                params=params,
                follow_redirects=True,
                headers={'Accept': 'application/json'}
            )
            target_link = response.json().get('permanent_link')
            await asyncio.sleep(15)
            response = await client.get(target_link, follow_redirects=True, headers={'Accept': 'application/json'})
            is_censored = b'10.10.3' in response.content
            return {
                'is_censored': is_censored
            }
        except httpx.ConnectError as e:
            print('[BOARD ERROR] httpx.ConnectError', e)
        except json.JSONDecodeError as e:
            print('[BOARD ERROR] json decode error', e)

    return JSONResponse(content={'detail': "server error"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
