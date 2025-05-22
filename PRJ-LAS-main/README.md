# Login and sign up flow

This repository contains a basic user system for a web application.
## Email set up

1. Create a new gmail for yourself (it works with any provider but some authorizations may vary)

2. Set up 2FA for your new google account

3. Create a new app password with "email" as the app name

4. Fill in your own .env with your Gmail email and it's specific app password:
    ```bash
    EMAIL = "YourEmail@gmail.com"
    ``` 
    ```bash
    EMAIL_PASSWORD = **** **** **** ****
    ```
## Installation

1. Install the dependencies:

    ```bash
    npm install
    ```

2. In your .env file will also need:
    ```bash
    JWT_SECRET = A random alphanumeric code 
    SITE_HOST = Localhost or your own provider
    PORT = The port you are hosting on
    SALT_ROUNDS = Any number, usually greater than 10
    ```
    For example
    ```bash
    JWT_SECRET = 37yhefb2dfiusd79hdjqkw 
    SITE_HOST = localhost
    PORT = 8080 
    SALT_ROUNDS = 10 
    ```
  * note that the DB (state.json) is going to be generated automatically after the first run and every time it's deleted
## How to Use the code

1. Run the server:

    ```bash
    npm run dev
    ```

2. Open your browser and search for `http://localhost:8080`.

3. Make sure to be connected to the network to be able to send emails 