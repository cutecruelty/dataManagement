/*
todo
auth system
finish commands


*/



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

function app() {
  const [userCommand, ...rawArgs] = process.argv.slice(2);

  const database = function parseArgs(
    rawArgs: string[],
  ): Record<string, string> {
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

  const cmds = {
    create: {
      roles: ["admin"],
      args: [
        { name: "title", clean: (text: string) => text },
        { name: "authors", clean: (text: string) => text },
        { name: "price", clean: (text: string) => parseFloat(text) },
        { name: "stock", clean: (text: string) => parseInt(text) },
      ],
      fn: () => {},
    },

    delete: {
      roles: ["admin"],
      args: [{ name: "title", clean: (text: string) => text }],
      fn: () => {},
    },
  };
}
