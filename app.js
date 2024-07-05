document.addEventListener("DOMContentLoaded", () => {
  let selectedWord, guessedLetters, incorrectGuesses;
  let winStreakCount = 0;
  let muted = false;

  //Winner and loser sound files
  const winnerSounds = [
    "Complete.wav",
    "Congratulations.wav",
    "Wow Incredible.wav",
  ];
  const loserSounds = ["Failure.wav", "Continue.wav", "Game Over.wav"];
  //Where the guessable words are
  const filePath = "src/words.txt";
  //Amount of guesses
  const maxIncorrectGuesses = 8;
  const wordDisplay = document.getElementById("word");
  const messageDisplay = document.getElementById("message");
  const lettersGuessedDisplay = document.getElementById("letters-guessed");
  const letterInput = document.getElementById("letter-input");
  const guessButton = document.getElementById("guess-button");
  const newGameButton = document.getElementById("new-game-button");
  const winStreak = document.getElementById("winStreak");
  const canvas = document.getElementById("hangman");
  const mutedButton = document.getElementById("muteButton");
  const ctx = canvas.getContext("2d");

  //Starting the game, called when a new game is made
  function initGame() {
    randomWord()
      .then((word) => {
        selectedWord = word;
        guessedLetters = [];
        incorrectGuesses = 0;
        updateWordDisplay();
        drawHangman();
        lettersGuessedDisplay.textContent = "Guessed Letters: ";
        messageDisplay.textContent = "";
        guessButton.disabled = false;
        letterInput.disabled = false;
        letterInput.value = "";
        letterInput.focus();
      })
      .catch((error) => {
        console.error("Error initializing the game:", error);
      });
  }

  //Reading from the words txt file
  function readWord() {
    return fetch(filePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.text();
      })
      .then((data) => {
        const lines = data.split("\n");
        return lines; // Return the array of lines
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        throw error; // Propagate the error
      });
  }

  //Generating a random word from the text file
  function randomWord() {
    return readWord()
      .then((lines) => {
        if (lines.length > 0) {
          const randomIndex = Math.floor(Math.random() * lines.length);
          return lines[randomIndex].trim(" ");
        } else {
          throw new Error("The file is empty or only contains empty lines.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        throw error; // Propagate the error
      });
  }

  //Drawing the hangman canvas and the limbs
  function drawHangman() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;

    if (incorrectGuesses > 0) {
      ctx.beginPath();
      ctx.moveTo(10, 190);
      ctx.lineTo(190, 190);
      ctx.stroke();
    }
    if (incorrectGuesses > 1) {
      ctx.beginPath();
      ctx.moveTo(50, 190);
      ctx.lineTo(50, 10);
      ctx.lineTo(150, 10);
      ctx.lineTo(150, 30);
      ctx.stroke();
    }
    if (incorrectGuesses > 2) {
      ctx.beginPath();
      ctx.arc(150, 50, 20, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (incorrectGuesses > 3) {
      ctx.beginPath();
      ctx.moveTo(150, 70);
      ctx.lineTo(150, 130);
      ctx.stroke();
    }
    if (incorrectGuesses > 4) {
      ctx.beginPath();
      ctx.moveTo(150, 80);
      ctx.lineTo(120, 110);
      ctx.stroke();
    }
    if (incorrectGuesses > 5) {
      ctx.beginPath();
      ctx.moveTo(150, 80);
      ctx.lineTo(180, 110);
      ctx.stroke();
    }
    if (incorrectGuesses > 6) {
      ctx.beginPath();
      ctx.moveTo(150, 130);
      ctx.lineTo(120, 160);
      ctx.stroke();
    }
    if (incorrectGuesses > 7) {
      ctx.beginPath();
      ctx.moveTo(150, 130);
      ctx.lineTo(180, 160);
      ctx.stroke();
    }
  }

  function updateWordDisplay() {
    let display = selectedWord
      .split("")
      .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
      .join(" ");
    wordDisplay.textContent = display;
  }

  function updateWinstreak() {
    winStreak.innerHTML = `<i class="fa-solid fa-star"></i>Winstreak: ${winStreakCount}`;
  }

  function checkWin() {
    if (!wordDisplay.textContent.includes("_")) {
      messageDisplay.textContent = "Congratulations! You guessed the word!";
      guessButton.disabled = true;
      letterInput.disabled = true;
      winStreakCount++;
      updateWinstreak();
      winSound();
    }
  }

  function checkLoss() {
    if (incorrectGuesses >= maxIncorrectGuesses) {
      messageDisplay.textContent = `Game Over! The word was "${selectedWord}".`;
      guessButton.disabled = true;
      letterInput.disabled = true;
      winStreakCount = 0;
      updateWinstreak();
      lossSound();
    }
  }

  function handleGuess() {
    const letter = letterInput.value.toLowerCase();
    if (letter && !guessedLetters.includes(letter) && letter != " ") {
      guessedLetters.push(letter);
      lettersGuessedDisplay.textContent = `Guessed Letters: ${guessedLetters.join(
        ", "
      )}`;

      if (selectedWord.includes(letter)) {
        updateWordDisplay();
        checkWin();
      } else {
        incorrectGuesses++;
        drawHangman();
        checkLoss();
      }
    }
    letterInput.value = "";
  }

  function winSound() {
    const randomIndex = Math.floor(Math.random() * winnerSounds.length);
    let victorySound = new Audio(`sounds/${winnerSounds[randomIndex]}`);
    if (!muted) {
      victorySound.play();
    }
  }

  function lossSound() {
    const randomIndex = Math.floor(Math.random() * loserSounds.length);
    let loseSound = new Audio(`sounds/${loserSounds[randomIndex]}`);
    if (!muted) {
      loseSound.play();
    }
  }

  function toggleAudio() {
    muted = !muted;
    if (muted) {
      mutedButton.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    } else {
      mutedButton.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    }
  }

  guessButton.addEventListener("click", handleGuess);
  letterInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleGuess();
    }
  });

  newGameButton.addEventListener("click", initGame);
  mutedButton.addEventListener("click", toggleAudio);

  initGame();
});
