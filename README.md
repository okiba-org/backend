# Okiba

A simple and minimal pastebin written in Node.JS.

## Usage

Before starting the server, we populate the database by creating a table for endpoints and providing the words to be used. The server will be populated from `words.txt` file from project root.
https://github.com/dwyl/english-words/blob/master/words_alpha.txt

### Environment Variables

Create a `.env` file at the project root and add the following variables according to the database.

```shell
PORT = 8080
PGUSER = alok-pg
PGHOST = localhost
PGDATABASE = okiba
PGPORT = 5432
PGPASSWORD = postgres_user_password
```

### Start scripts

```shell
// Development Server
$ pnpm run dev

// Build
$ pnpm build

// Production
$ pnpm start
```
