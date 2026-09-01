class Book {
  title: string;
  authors: string;
  price: number;
  stock: number;

  constructor(
    titleInput: string,
    authorInput: string,
    priceInput: number,
    stockInput: number,
  ) {
    this.title = titleInput;
    this.authors = authorInput;
    this.price = priceInput;
    this.stock = stockInput;
  }
}

type BookArgType = [
  title: string,
  authors: string,
  price: number,
  stock: number,
];

function app() {
  const [userCommand, ...rawUserArgs] = process.argv.slice(2);

  const cmds = {
    create: {
      args: [
        { name: "title", clean: (text: string) => text },
        { name: "authors", clean: (text: string) => text },
        { name: "price", clean: (text: string) => parseFloat(text) },
        { name: "stock", clean: (text: string) => parseInt(text, 10) },
      ],

      run: (cleanData: BookArgType) => {
        const newBook = new Book(
          cleanData[0],
          cleanData[1],
          cleanData[2],
          cleanData[3],
        );
      },
    },
  };

  const matchedCommand = cmds[userCommand as keyof typeof cmds];

  const cleanData = matchedCommand.args.map((argConfig, index) => {
    return argConfig.clean(rawUserArgs[index]);
  }) as BookArgType;

  matchedCommand.run(cleanData);
}
