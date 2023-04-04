def get_empty_node():
    return {"users": {"users": [], "total": 0}}


def node_sum(a, b):
    s = {
        "users": {
            "users": a['users']['users'] + b['users']['users'],
            "total": a['users']['total'] + b['users']['total'],
        }
    }
    return s
