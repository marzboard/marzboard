from functools import wraps
from time import time


def async_cache(timeout=600):

    def decorator(func):
        cache = {}

        @wraps(func)
        async def wrapper(*args, no_cache=False, **kwargs):
            if no_cache:
                return await func(*args, **kwargs)

            key_base = "_".join(str(x) for x in args)
            key_end = "_".join(f"{k}:{v}" for k, v in kwargs.items())
            key = f"{key_base}-{key_end}"
            now = int(time())

            if key in cache and now - cache[key]['cached_at'] <= timeout:
                return cache[key]['value']

            res = await func(*args, **kwargs)
            cache[key] = {
                'value': res,
                'cached_at': now
            }

            return res

        return wrapper

    return decorator
