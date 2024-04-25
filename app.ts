import readline from "node:readline";

type Letter = {
  value: string;
  guessed: boolean;
};

let guesses = 10;
const notInWord = [] as string[];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const drawHints = (word: Letter[]) => {
  process.stdout.write(
    word.map((letter) => (letter.guessed ? letter.value : "_")).join(" ") + "\n"
  );
};

const clearScreen = () => process.stdout.write("\x1B[2J\x1B[0f");

const getWord = (maxLength?: number): Letter[] => {
  const words = [
    "BANAN",
    "BIL",
    "PRINSESSA",
    "ÄPPLE",
    "ENHÖRNING",
    "BOK",
    "SPIDERMAN",
    "PAWPATROL",
    "ROSA",
    "TÅRTA",
    "BRANDBIL",
  ];
  const picked = maxLength ? words.filter((w) => w.length <= maxLength) : words;
  return picked[Math.floor(Math.random() * words.length)]
    .split("")
    .reduce(
      (res, char) => [...res, { value: char, guessed: false }],
      [] as Letter[]
    );
};

const drawNotinWord = (notInWord: string[]) => {
  notInWord.length &&
    process.stdout.write(
      `Finns inte i ordet: ${notInWord.join(
        " "
      )}\nGissningar kvar: ${guesses}\n`
    );
};

const drawWinScreen = () => {
  process.stdout.write("\n\u001b[32mDu vann! Bra jobbat!\n");
};

const drawLoseScreen = () => {
  process.stdout.write("\n\u001b[31mDu förlorade :( Försök igen!\n");
};

const drawGameScreen = () => {
  clearScreen();
  process.stdout.write("\n");
  drawHints(word);
  process.stdout.write("\n");
  drawNotinWord(notInWord);
  process.stdout.write("\n");
};

const prompt = () => {
  drawGameScreen();

  if (guesses === 0) {
    drawLoseScreen();
    return rl.close();
  }

  if (word.every((l) => l.guessed)) {
    drawWinScreen();
    return rl.close();
  }

  rl.question(`Gissa bokstav: `, (guess) => {
    let inWord = false;

    word.forEach((l) => {
      if (l.value.toUpperCase() === guess.toUpperCase()) {
        l.guessed = true;
        inWord = true;
      }
    });

    if (!inWord) {
      notInWord.push(guess.toUpperCase());
      guesses--;
    }

    prompt();
  });
};

const word = getWord();

clearScreen();
process.stdout.write(
  "Hej och välkommen till hänga gubbe!\n\nTryck på en knapp för att starta spelet"
);
process.stdin.once("data", () => {
  prompt();
});
