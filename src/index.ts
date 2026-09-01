// class Book {
//   id: number;
//   title: string;
//   authors: string;
//   price: number;
//   stock: number;

//   constructor(
//     idInput: number,
//     titleInput: string,
//     authorInput: string,
//     priceInput: number,
//     stockInput: number,
//   ) {
//     this.id = idInput;
//     this.title = titleInput;
//     this.authors = authorInput;
//     this.price = priceInput;
//     this.stock = stockInput;
//   }
// }

// type BookArgType = [
//   title: string,
//   authors: string,
//   price: number,
//   stock: number,
// ];

// interface CommandConfig {
//   roles: string[];
//   args: { name: string; clean: (text: string) => any }[];
//   run: (cleanData: BookArgType) => void;
// }

// function app() {
//   const [userCommand, ...rawUserArgs] = process.argv.slice(2);

//   const db = new JsonDatabase();
//   const booksMap = db.loadBooksIndex();

//   const cmds: Record<string, CommandConfig> = {
//     create: {
//       roles: ["admin"],
//       args: [
//         { name: "title", clean: (text: string) => text },
//         { name: "authors", clean: (text: string) => text },
//         { name: "price", clean: (text: string) => parseFloat(text) },
//         { name: "stock", clean: (text: string) => parseInt(text, 10) },
//       ],

//       run: (cleanData: BookArgType) => {
     
//         const nextId = booksMap.size > 0 ? Math.max(...booksMap.keys()) + 1 : 1;

        
//         const newBook = new Book(
//           nextId, // idInput
//           cleanData[0], // titleInput
//           cleanData[1], // authorInput
//           cleanData[2], // priceInput
//           cleanData[3], // stockInput
//         );

//         booksMap.set(nextId, newBook);

//         db.saveBooksIndex(booksMap);

//         console.log(`created book ID: [${nextId}]:`, newBook);
//       },
//     },
//   };

//   const matchedCommand = cmds[userCommand];
//   if (!matchedCommand) {
//     console.error("Unknown command!");
//     return;
//   }

//   const cleanData = matchedCommand.args.map((argConfig: any, index: number) => {
//     return argConfig.clean(rawUserArgs[index] || "");
//   }) as BookArgType;

//   matchedCommand.run(cleanData);
// }