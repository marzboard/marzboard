# MarzBoard
Marzban Node Manager and Users Dashboard for multiple nodes.

## Features
- Connect to multiple Marzban nodes
- Dashboard for users to see their usages and copy their configs
- Correct gRPC configs (until Marzban fix it!) 

# Getting Started
1. Clone the repository on your server
```shell
git clone https://github.com/marzboard/marzboard.git && cd marzboard 
```
--------
2. create `nodes.json` file
```shell
cp nodes.sample.json nodes.json
```
--------
3. Edit the `nodes.json` file and add all your Marzban servers like the following example:
```shell
{
  "https://subdomain1.host.com": {
    "username": "admin",
    "password": "admin"
  },
  "https://subdomain2.host.com": {
    "username": "admin",
    "password": "admin"
  },
  "https://subdomain3.host.com": {
    "username": "admin",
    "password": "admin"
  }
}
```

The addresses should be exactly like the example. 
- No trailing slashes
- Containing the URI schema (`https`/`http`)
- Including each node's `username` and `password`

--------
4. Pull docker images and run the project:
```shell
docker compose up -d
```
