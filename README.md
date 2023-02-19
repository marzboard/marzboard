# MarzBoard
Marzban Node Manager and Users Dashboard for multiple nodes.

## Features
- Connect to multiple Marzban nodes
- Dashboard for users to see their usages and copy their configs
- Correct gRPC configs (until Marzban fix it!) 

# Run the project

## Prerequisites
1. You need a domain/subdomain to run this project; because it uses TLS.
2. A server from any provider

## Setup
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
4. You **should** use TLS to run this project; so assure that your domain is prepared and run the `tls.sh` script:
```shell
bash tls.sh
```
--------
5. Pull docker images and run the project:
```shell
docker compose up -d
```

# What happens next?
When you run the project properly, you will have a login page in your domain for all your users in all marzban nodes which are included in the `nodes.json` file.

## The way to login into marzboard
User's username is their marzban username and their password is the **first 8 characters** of their configs.

For example, if a user has a VMESS or VLESS config:
```text
vmess://11111111-0000-0000-0000-000000000000@...
```

The _Ones_ are the password part.

It is the same for trojan configs:
```text
trojan://1111111100000000000000@...
```

So, a user in any of the marzban servers included in `nodes.json` can log into their board.

## Use Username & Password instead of copying multiple configs
From now on, you can tell the username and password to users, and they can copy configs themselves from the board.
