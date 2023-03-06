import json
from typing import TypedDict

import redis.asyncio as redis
from decouple import config
from dotenv import load_dotenv

load_dotenv()

rc = redis.Redis(host='redis', decode_responses=True)
redis_connection: redis.Redis = config('redis_connection', default=rc)


class Credentials(TypedDict):
    username: str
    password: str


default_marzban_servers = {}
try:
    with open('nodes.json', 'r') as f:
        default_marzban_servers = json.loads(f.read())
except FileNotFoundError:
    print('[BOARD WARNING] please fill the `nodes.json` file')
except json.JSONDecodeError:
    print('[BOARD WARNING] `nodes.json` is not a valid json file')
MARZBAN_SERVERS: dict[str, Credentials] = config("MARZBAN_SERVERS", default=default_marzban_servers)

default_admins = []
try:
    with open('admins.json', 'r') as f:
        default_admins = json.loads(f.read())
except FileNotFoundError:
    print('[BOARD INFO] no admin users is provided')
except json.JSONDecodeError:
    print('[BOARD WARNING] `admins.json` is not a valid json file')
ADMINS: list[Credentials] = config("ADMINS", default=default_admins)
