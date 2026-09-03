/*
todo
auth system
finish commands


*/

import fs from "fs/promises";

class Book {
  id: number;
  title: string;
  authors: string;
  price: number;
  stock: number;

  constructor(
    idInput: number,
    titleInput: string,
    authorInput: string,
    priceInput: number,
    stockInput: number,
  ) {
    this.id = idInput;
    this.title = titleInput;
    this.authors = authorInput;
    this.price = priceInput;
    this.stock = stockInput;
  }
}

type Role = "admin" | "user";

class User {
  id: number;
  username: string;
  role: Role;

  constructor(id: number, username: string, role: Role) {
    this.id = id;
    this.username = username;
    this.role = role;
  }
}

const books = new Map<number, Book>();
const users = new Map<number, User>();

const cmds = {
  create: {
    roles: ["admin"],
    args: [
      { name: "title", clean: (text: string) => text },
      { name: "authors", clean: (text: string) => text },
      { name: "price", clean: (text: string) => parseFloat(text) },
      { name: "stock", clean: (text: string) => parseInt(text) },
    ],
    fn: (args: Record<string, string | number>) => {
      const id = books.size + 1;
      const book = new Book(
        id,
        args.title as string,
        args.authors as string,
        args.price as number,
        args.stock as number,
      );
      books.set(id, book);
      console.log(`created: ${book.title}`);
    },
  },

  delete: {
    roles: ["admin"],
    args: [{ name: "id", clean: (text: string) => parseInt(text) }],
    fn: (args: Record<string, number>) => {
      const existed = books.delete(args.id);
      console.log(
        existed ? `deleted book ${args.id}` : `no book with id ${args.id}`,
      );
    },
  },

  read: {
    roles: ["admin", "user"],
    args: [{ name: "username", clean: (text: string) => text }],
    fn: async (args: Record<string, string>) => {
      try {
        await fs.writeFile(
          "books.json",
          JSON.stringify(books, null, 2),
          "utf8",
        );

        console.log("the list of available books is in src in file books.json");
      } catch (err) {
        console.log("error writing file", err);
      }
    },
  },
};

function app() {
  const [userCommand, ...rawArgs] = process.argv.slice(2);

  const cmd = cmds[userCommand as keyof typeof cmds];
  if (!cmd) {
    console.log(`Unknown command: ${userCommand}`);
    return;
  }

  const parseArgs = function (rawArgs: string[]): Record<string, string> {
    const result: Record<string, string> = {};
    let i = 0;
    while (i < rawArgs.length) {
      if (rawArgs[i].startsWith("--")) {
        const key = rawArgs[i].slice(2);
        i++;
        const valueParts: string[] = [];
        while (i < rawArgs.length && !rawArgs[i].startsWith("--")) {
          valueParts.push(rawArgs[i]);
          i++;
        }
        result[key] = valueParts.join(" ");
      } else {
        i++;
      }
    }
    return result;
  };

  const paresed = parseArgs(rawArgs);
}
