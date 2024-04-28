import readline from "node:readline";

type Letter = {
  value: string;
  guessed: boolean;
};

type Word = {
  letters: Letter[];
  clue: string;
};

let showClue = false;
let guesses = 10;
const notInWord = [] as string[];

const rl = readline.createInterface({
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

const getWord = (maxLength?: number): Word => {
  const words = [
    {
      value: "BANAN",
      clue: "Gul och böjd",
    },
    { value: "BIL", clue: "Kör på vägar" },
    { value: "PRINSESSA", clue: "Ska bli drottning" },
    { value: "ÄPPLE", clue: "Frukt som kan vara röd och grön" },
    { value: "ENHÖRNING", clue: "Djur med fyra ben och horn i pannan" },
    { value: "BOK", clue: "Man kan låna såna på biblioteket" },

    { value: "SPIDERMAN", clue: "Kvarterets vänlige superhjälte" },
    { value: "PAW PATROL", clue: "Hundvalpar som räddar och hjälper till" },

    { value: "ROSA", clue: "Iris favoritfärg" },

    { value: "TÅRTA", clue: "Gott som man äter på födelsedagar" },
    {
      value: "BRANDBIL",
      clue: "Kommer körande snabbt ifall det börjar brinna",
    },
  ];
  const wordPool = maxLength
    ? words.filter((w) => w.value.length <= maxLength)
    : words;
  const picked = wordPool[Math.floor(Math.random() * words.length)];
  return {
    clue: picked.clue,
    letters: picked.value
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

const word = getWord();

clearScreen();
process.stdout.write(
  "Hej och välkommen till hänga gubbe!\n\nTryck på en knapp för att starta spelet"
);
process.stdin.once("data", () => {
  prompt();
});
