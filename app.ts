import { createInterface } from "node:readline";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// const words = require("./words.json") as RawWordData[];

type Letter = {
  value: string;
  guessed: boolean;
};

type Word = {
  letters: Letter[];
  clue: string;
};

type RawWordData = {
  value: string;
  clue: string;
};

let word = undefined;
let showClue = false;
let guesses = 10;
const notInWord = [] as string[];

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const drawHints = (word: Letter[]) => {
  process.stdout.write(
    word
      .map((letter) =>
        letter.guessed || letter.value === " " ? letter.value : "_"
      )
      .join(" ") + "\n"
  );
};

const clearScreen = () => process.stdout.write("\x1B[2J\x1B[0f");

const getWord = async (maxLength?: number): Promise<Word> => {
  let word = null as RawWordData;
  console.log(process.argv);
  if (process.argv.length > 2 && process.argv[2] === "local") {
    const words = require("./words.json") as RawWordData[];
    word = words[Math.floor(Math.random() * words.length - 1)];
  } else {
    const res = await fetch(
      `http://localhost:5062/random${
        maxLength ? "?maxLength=" + maxLength : ""
      }`
    );

    word = (await res.json()) as RawWordData;
  }

  console.log(word);

  // const wordPool = maxLength
  //   ? words.filter((w) => w.value.length <= maxLength)
  //   : words;
  // const picked = wordPool[Math.floor(Math.random() * words.length)];
  return {
    clue: word.clue,
    letters: word.value
      .split("")
      .reduce(
        (res, char) => [...res, { value: char, guessed: char === " " }],
        [] as Letter[]
      ),
  };
};

const drawNotinWord = (notInWord: string[]) => {
  notInWord.length &&
    process.stdout.write(
      `Finns inte i ordet: ${notInWord.join(" ")}\nChanser kvar: ${guesses}\n`
    );
};

const drawClue = () => {
  process.stdout.write(`Ledtråd: ${word.clue}`);
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
  drawHints(word.letters);
  process.stdout.write("\n");
  drawNotinWord(notInWord);
  process.stdout.write("\n");
  showClue && drawClue();
  process.stdout.write("\n");
};

const prompt = () => {
  drawGameScreen();

  if (guesses === 0) {
    drawLoseScreen();
    return rl.close();
  }

  if (word.letters.every((l) => l.guessed)) {
    drawWinScreen();
    return rl.close();
  }

  rl.question(`Gissa bokstav: `, (userInput) => {
    const guess = userInput.toUpperCase()[0];
    let inWord = false;

    if (guess === ".") {
      showClue = true;
      return prompt();
    }

    word.letters
      .filter((w) => w.value !== " ")
      .forEach((l) => {
        if (l.value.toUpperCase() === guess) {
          l.guessed = true;
          inWord = true;
        }
      });

    if (!inWord && !notInWord.includes(guess) && guess) {
      notInWord.push(guess);
      guesses--;
    }

    prompt();
  });
};

clearScreen();
process.stdout.write(
  "Hej och välkommen till hänga gubbe!\n\nTryck på en knapp för att starta spelet"
);
process.stdin.once("data", async () => {
  word = await getWord();
  prompt();
});
