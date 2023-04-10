import asyncio
import json
import re
from functools import partial
from json import JSONDecodeError
from typing import Awaitable, Literal
from uuid import uuid4

import httpx
from fastapi import status, Response, Header
from fastapi.responses import JSONResponse

from app import app
from app.models.user import User
from app.utils.cache import async_cache
from app.utils.time import HOUR
from config import MARZBAN_SERVERS, redis_connection


@app.get("/{node}/sub/{token}")
async def subscriptions(node, token):
    the_node = next(filter(lambda n: node in n, MARZBAN_SERVERS.keys()), None)
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
