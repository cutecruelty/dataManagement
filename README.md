# datamanagement

a cli book inventory manager built with typescript and node

zero production dependencies everything runs on node builtins

## features

- user registration and login (passwords are hashed with scrypt)
- session persistence via a local file so you stay logged in between runs
- role based access control (admin and user roles)
- the first person to register becomes admin
- full book management for admins (create read update delete)
- regular users can only read books
- all data stored as plain json files

## setup

```
npm install
```

## usage

run with ts-node directly

```
npx ts-node src/cli.ts <command> [args]
```

all arguments use `--key value` syntax

### available commands

| command | role | args | description |
|---------|------|------|-------------|
| register | logged out | `--username` `--password` | create an account |
| login | logged out | `--username` `--password` | log in |
| logout | any | none | log out |
| whoami | any | none | show current user and role |
| create | admin | `--title` `--authors` `--price` `--stock` | add a book |
| delete | admin | `--id` | remove a book |
| update | admin | `--id` `--stock` | update book stock |
| read | any | none | list all books |

### examples

```
npx ts-node src/cli.ts register --username alice --password secret123
npx ts-node src/cli.ts login --username alice --password secret123
npx ts-node src/cli.ts create --title "dune" --authors "frank herbert" --price 12.99 --stock 50
npx ts-node src/cli.ts read
npx ts-node src/cli.ts update --id 1 --stock 45
npx ts-node src/cli.ts read
npx ts-node src/cli.ts delete --id 1
npx ts-node src/cli.ts logout
```

## how it works

users books and sessions are stored as json files in your working directory

- `users.json` user accounts (with hashed passwords and salts)
- `books.json` book records
- `.session.json` current login session

sessions are tied to a userId stored in `.session.json` and the app looks up the user on each command

## building

```
npm run build
```

compiles typescript from `src/` into `dist/`

note the `npm run dev` and `npm start` scripts in package.json point to `index.ts` which is the old commented out prototype. the working code is in `src/cli.ts` so just use the ts-node command directly for now
