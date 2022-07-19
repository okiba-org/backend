# Okiba
A simple paste bin written in nodejs with postgresql.  

## Usage
Before starting the server, we populate the database by creating a table for endpoints and providing the words to be used. The server will be populated from `words.txt` file from project root.

### Environment Variables
Create a `.env` file at the project root and add the following variables according to the database. 
```shell
PORT = 8080 
PGUSER = alok-pg
PGHOST = localhost
PGDATABASE = okiba
PGPORT = 5432
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