# SS APIs 💾

Welcome to SS APIs Repository, SS APIs is an APIs use across all of our products

So far we use this api in system13 only but we are now migrating our code to use this api

## Features

**_System 13_**

- fetch player's codeName & Score
- fetch player's displayName & codeName
- add player (authorization required)
- delete player (authorization required)

## Versions

**_Current Version_ | v1.2.2** <br/>

- Added the errors controllers
  - errors 503 <br/>
    (Server can't handle the request because the server is down for maintenance)

**_History_**

- Version 1.0
  - All feature an basic api needed
- Version 1.1
  - added errors handling (central error handling middleware)
- Version 1.2
  - Started return errors message with the response for the client
  - Remove some bug behind the scene
- Version 2.0
  - Added validation for adding players

## License

This project is protected under

```sh
Mozilla Public License v2.0
```

MPL 2.0 © 2022 Prawich & Jirat
  
