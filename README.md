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
3. Edit the `nodes.json` file and add all your Marzban servers like the example.

The addresses should be exactly like the example.
- The keys are the marzban node's domain. It is highly recommended using another domain than your VPN service; so if your VPN service's domain is censored in the future, the censorship does not affect on your api domain.
- The `node_domain` value is the service's domain which is currently being used by users VPN clients
- If your `node_domain` and the keys are the same, it's ok!
- No trailing slashes in the key paths
- Keys should contain the URI schema (`https`/`http`)
- Including each node's `username` and `password` in the values

--------
4. You **should** use TLS to run this project; so assure that your domain is prepared and run the `tls.sh` script:
```shell
bash tls.sh
```
--------
5. *OPTIONAL:* If you want to log in as an admin in marzboard, you can create a file named `admins.json` like the following:
```shell
cp admins.sample.json admins.json
```

Edit the contents of the `admins.json` file. The username & passwords in this file is not depended on anything; put anything you desire as your credentials for the admin panel. Be careful about them and choose a strong password.

--------
6. Pull docker images and run the project:
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

## Admin Page
If you log in with any of the credentials in `admins.json` file, you will see the admin panel which is under development and will have more features in future.