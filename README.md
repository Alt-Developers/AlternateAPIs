# SS APIs 💾

An APIs wrritten a typescript for SS Developers' products

## **Contents**

- [SS APIs 💾](#ss-apis-)
  - [**Contents**](#contents)
  - [**Introduction** 🖊️](#introduction-️)
  - [**Features** 📝](#features-)
  - [**Canceled / Legacy apis** 📦](#canceled--legacy-apis-)
  - [**Versions** 📜](#versions-)
  - [**Download** ⬇️](#download-️)
  - [**License** ⚖️](#license-️)

---

## **Introduction** 🖊️

Welcome to the SS APIs' Repository, SS APIs is an APIs used across all our products.

This API is used for most of our latest products, like Timetables, Central Authentication and more.

---

## **Features** 📝

**_Auth_**

- Login
- Signup
- Change password
- Change profile picture
- Change profile (Name, color, etc.)
- Get user's configurations

**_System 13_**

- All the player data for System13
- Add players
- Delete players

**_Timetables v3_**

Basically this is the new timetables is the re-written version of Timetables.

- _Timetables Key Feature_
  - Create Timetable
  - Get Timetable
    - Includes
      - Timetable Format (format)
      - Timetable Content (timetableData)
      - Current Class Indicator (indicator)
  - Get Glance (getGlance)
    - Includes
      - Current Class Code (curClass)
      - Next Class Code (nextClass)
      - Timetable Format (format)
  - Get Format
    - **If not** selected will return every format in the system.
    - **Client Can** select what school / program client want.
  - Get My Class
    - Return user's primary class and a list of classes user have starred.
- _Adding Or Remove Class From User_
  - Get Class From School
    - return a class that user still dont have from the school selected.
  - Register Class
  - Remove Class
    <br />

> **Notes**
>
> The timetalbe format send with every endpoints but getFormat are selected for that school and program, client just need to select the language.

---

## **Canceled / Legacy apis** 📦

**_Expenses_** (CANCELED)

**_Timetables v2_** (Legacy)

- Create timetables
- Add timetable
- Get timetables
- Get user
- Get glance
- Create class
- Get current class indicator

---

## **Versions** 📜

**_Current Version_ | 4.9** <br/>

**_Previous Versions_**

- Version 1.0
  - All basic API features.
- Version 1.1
  - Added errors handling (central error handling middleware).
- Version 1.2
  - Returned errors messages with the response for the client.
  - Remove behind the scene bugs.
- Version 2.0
  - Added validation for adding players.
- Version 3.0
  - SS Account support and polished system13's API endpoints + expenses project.
- Version 4.0
  - SS Timetables v2.0 features.
- Version 4.6 > 4.7
  - Modal from backend system
  - Re-written the API for better optimization.
- Version 4.8 > Present
  - Timetable v3.0 (or in SS APIs **new Timetable**)

## **Download** ⬇️

**After cloning the git repository**

1.) **Install all dependencies**

```zsh
> npm install

// or

> yarn install
```

2.) **Locally run the program**

```zsh
> npm start

// OR

> nodemon
```

> **Notes:**
>
> You can change the server's port in `./src/app.ts`
>
> ```ts
>   app.listen(8000)
>              ^^^^ Change This
> ```
>
> you can change it to any port you like.

## **License** ⚖️

This project is protected under

```sh
GNU General Public License v2.0
```

To read the full license [Click here](LICENSE)

GNU General Public License v2.0 © 2021-2022 Prawich Thawansakdivudhi & Jirat Chutrakul (SS Developers)
