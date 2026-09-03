import fs from "fs/promises";
import crypto from "crypto";

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
  salt: string;
  passwordHash: string;

  constructor(
    id: number,
    username: string,
    role: Role,
    salt: string,
    passwordHash: string,
  ) {
    this.id = id;
    this.username = username;
    this.role = role;
    this.salt = salt;
    this.passwordHash = passwordHash;
  }
}

const books = new Map<number, Book>();
const users = new Map<number, User>();

const BOOKS_FILE = "books.json";
const USERS_FILE = "users.json";
const SESSION_FILE = ".session.json";

async function loadBooks() {
  try {
    const data = await fs.readFile(BOOKS_FILE, "utf8");
    const arr: Book[] = JSON.parse(data);
    for (const b of arr) {
      books.set(b.id, new Book(b.id, b.title, b.authors, b.price, b.stock));
    }
  } catch {}
}

async function saveBooks() {
  const arr = Array.from(books.values());
  await fs.writeFile(BOOKS_FILE, JSON.stringify(arr, null, 2), "utf8");
}

async function loadUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, "utf8");
    const arr: User[] = JSON.parse(data);
    for (const u of arr) {
      users.set(
        u.id,
        new User(u.id, u.username, u.role, u.salt, u.passwordHash),
      );
    }
  } catch {}
}

async function saveUsers() {
  const arr = Array.from(users.values());
  await fs.writeFile(USERS_FILE, JSON.stringify(arr, null, 2), "utf8");
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function makeSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

async function getSession(): Promise<User | null> {
  try {
    const raw = await fs.readFile(SESSION_FILE, "utf8");
    const { userId } = JSON.parse(raw);
    return users.get(userId) ?? null;
  } catch {
    return null;
  }
}

async function setSession(userId: number) {
  await fs.writeFile(SESSION_FILE, JSON.stringify({ userId }), "utf8");
}

async function clearSession() {
  try {
    await fs.unlink(SESSION_FILE);
  } catch {
    // already gone, fine
  }
}

function parseArgs(rawArgs: string[]): Record<string, string> {
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
}

type ArgDef = { name: string; clean: (text: string) => string | number };
type Cmd = {
  roles: Role[] | "any" | "none";
  args: ArgDef[];
  fn: (
    args: Record<string, string | number>,
    session: User | null,
  ) => Promise<void> | void;
};

const cmds: Record<string, Cmd> = {
  register: {
    roles: "none",
    args: [
      { name: "username", clean: (t) => t },
      { name: "password", clean: (t) => t },
    ],
    fn: async (args) => {
      const username = args.username as string;
      const existing = Array.from(users.values()).find(
        (u) => u.username === username,
      );
      if (existing) {
        console.log(`username "${username}" already taken`);
        return;
      }
      const role: Role = users.size === 0 ? "admin" : "user";
      const salt = makeSalt();
      const passwordHash = hashPassword(args.password as string, salt);
      const id = users.size + 1;
      const user = new User(id, username, role, salt, passwordHash);
      users.set(id, user);
      await saveUsers();
      console.log(`registered "${username}" as ${role}`);
    },
  },

  login: {
    roles: "none",
    args: [
      { name: "username", clean: (t) => t },
      { name: "password", clean: (t) => t },
    ],
    fn: async (args) => {
      const username = args.username as string;
      const user = Array.from(users.values()).find(
        (u) => u.username === username,
      );
      if (!user) {
        console.log("no such user");
        return;
      }
      const attemptHash = hashPassword(args.password as string, user.salt);
      if (attemptHash !== user.passwordHash) {
        console.log("wrong password");
        return;
      }
      await setSession(user.id);
      console.log(`logged in as ${user.username} (${user.role})`);
    },
  },

  logout: {
    roles: "any",
    args: [],
    fn: async () => {
      await clearSession();
      console.log("logged out");
    },
  },

  whoami: {
    roles: "any",
    args: [],
    fn: async (_args, session) => {
      console.log(`${session!.username} (${session!.role})`);
    },
  },

  create: {
    roles: ["admin"],
    args: [
      { name: "title", clean: (t) => t },
      { name: "authors", clean: (t) => t },
      { name: "price", clean: (t) => parseFloat(t) },
      { name: "stock", clean: (t) => parseInt(t) },
    ],
    fn: async (args) => {
      const id = books.size + 1;
      const book = new Book(
        id,
        args.title as string,
        args.authors as string,
        args.price as number,
        args.stock as number,
      );
      books.set(id, book);
      await saveBooks();
      console.log(`created: ${book.title} (id ${id})`);
    },
  },

  delete: {
    roles: ["admin"],
    args: [{ name: "id", clean: (t) => parseInt(t) }],
    fn: async (args) => {
      const id = args.id as number;
      const existed = books.delete(id);
      if (existed) await saveBooks();
      console.log(existed ? `deleted book ${id}` : `no book with id ${id}`);
    },
  },

  update: {
    roles: ["admin"],
    args: [
      { name: "id", clean: (t) => parseInt(t) },
      { name: "stock", clean: (t) => parseInt(t) },
    ],
    fn: async (args) => {
      const id = args.id as number;
      const book = books.get(id);
      if (!book) {
        console.log(`no book with id ${id}`);
        return;
      }
      book.stock = args.stock as number;
      await saveBooks();
      console.log(`updated book ${id}: stock = ${book.stock}`);
    },
  },

  read: {
    roles: "any",
    args: [],
    fn: async () => {
      if (books.size === 0) {
        console.log("no books yet");
        return;
      }
      for (const b of books.values()) {
        console.log(
          `[${b.id}] ${b.title} — ${b.authors} — $${b.price} — stock: ${b.stock}`,
        );
      }
    },
  },
};

async function app() {
  await loadUsers();
  await loadBooks();

  const [userCommand, ...rawArgs] = process.argv.slice(2);
  const cmd = cmds[userCommand];
  if (!cmd) {
    console.log(`unknown command: ${userCommand}`);
    console.log(`available: ${Object.keys(cmds).join(", ")}`);
    return;
  }

  const session = await getSession();

  if (cmd.roles === "any" && !session) {
    console.log("you need to log in first");
    return;
  }
  if (Array.isArray(cmd.roles)) {
    if (!session) {
      console.log("you need to log in first");
      return;
    }
    if (!cmd.roles.includes(session.role)) {
      console.log(
        `command requires role: ${cmd.roles.join(" or ")}, you are: ${session.role}`,
      );
      return;
    }
  }

  const parsed = parseArgs(rawArgs);
  const cleanedArgs: Record<string, string | number> = {};
  for (const argDef of cmd.args) {
    const raw = parsed[argDef.name];
    if (raw === undefined) {
      console.log(`missing --${argDef.name}`);
      return;
    }
    cleanedArgs[argDef.name] = argDef.clean(raw);
  }

  await cmd.fn(cleanedArgs, session);
}

app();
