import httpx
from fastapi import Response

from app import app
from config import MARZBAN_SERVERS


@app.get("/{node}/sub/{token}")
async def subscriptions(node, token):
    the_node = next(filter(lambda n: node in n, MARZBAN_SERVERS.keys()), None)
    if not the_node:
        return Response({"detail": f"wrong node name. '{node}' is not provided."}, status_code=401)

    async with httpx.AsyncClient(timeout=10) as client:
        client: httpx.AsyncClient
        try:
            response = await client.get(f"{the_node}/sub/{token}")
            if response.status_code != 200 or not isinstance(response.content, bytes):
                return Response(status_code=404)

            data = response.content.decode("utf-8")
            return Response(data)
        except httpx.ConnectError as e:
            print('httpx.ConnectError', e)

        return Response(status_code=404)
