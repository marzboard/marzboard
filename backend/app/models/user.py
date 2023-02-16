import re

from pydantic import BaseModel, validator

from config import MARZBAN_SERVERS

USERNAME_REGEXP = re.compile(r'^(?=\w{3,32}\b)[a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*$')


class User(BaseModel):
    username: str
    password: str
    marzbanserver: str | None

    @validator('username', check_fields=False)
    def validate_username(cls, value):
        if not USERNAME_REGEXP.match(value):
            raise ValueError('Username only can be '
                             '3 to 32 characters and contain a-z, '
                             '0-9, and underscores in between.')
        return value

    @validator('marzbanserver', check_fields=False)
    def validate_marzbanserver(cls, value):
        if value and value not in MARZBAN_SERVERS:
            raise ValueError('Wrong Server')
        return value
