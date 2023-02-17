import json

from decouple import config
from dotenv import load_dotenv

load_dotenv()

try:
    with open('nodes.json', 'r') as f:
        MARZBAN_SERVERS = config("MARZBAN_SERVERS", default=json.loads(f.read()))
except FileNotFoundError:
    print('please fill the `nodes.json` file')

DATABASE_URL = config("DATABASE_URL", default="sqlite:///db.sqlite3")
