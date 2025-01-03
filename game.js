let score = 0;
let mode = ''; // Track the selected mode ('syntax' or 'description')
let totalRounds = 0; // Total number of rounds
let currentRound = 0; // Current round number
let currentTable = ''; // Current table name (html_syntax or css_syntax)

// Function to set the current table based on the page
function setTableName() {
    const page = window.location.pathname;
    if (page.includes('html.html')) {
        currentTable = 'html_syntax';
    } else if (page.includes('css.html')) {
        currentTable = 'css_syntax';
    }
}

// Choose mode and show round selection
function chooseRounds(selectedMode) {
    mode = selectedMode;
    document.getElementById('mode-selection').style.display = 'none';
    document.getElementById('round-selection').style.display = 'block';
    setTableName(); // Set the correct table name
}

// Start the game with the selected number of rounds
function startGame(rounds) {
    totalRounds = rounds;
    currentRound = 0;
    score = 0;
    document.getElementById('round-selection').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('score').textContent = score;
    document.getElementById('current-round').textContent = currentRound;
    document.getElementById('total-round-count').textContent = totalRounds;
    loadCard();
}

// Function to load a flashcard
async function loadCard() {
    if (currentRound >= totalRounds) {
        endGame();
        return;
    }

    currentRound++;
    document.getElementById('current-round').textContent = currentRound;

    const response = await fetch(`/get-random-card/${mode}/${currentTable}`);
    const data = await response.json();

    const correctAnswer = mode === 'syntax' ? data.Description : data.Syntax;

    // Fetch additional random answers
    const allAnswers = [correctAnswer];
    const randomResponse = await fetch(`/get-random-options/${mode}/${currentTable}?exclude=${data.ID}`);
    const randomOptions = await randomResponse.json();
    randomOptions.forEach(option => {
        allAnswers.push(mode === 'syntax' ? option.Description : option.Syntax);
    });

    // Shuffle answers to randomize their order
    allAnswers.sort(() => Math.random() - 0.5);

    // Update the question and answers
    document.getElementById('question').textContent = mode === 'syntax' ? data.Syntax : data.Description;
    const buttonsDiv = document.getElementById('buttons');
    buttonsDiv.innerHTML = ''; // Clear existing buttons
    allAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.classList.add('button');
        button.onclick = () => checkAnswer(button, correctAnswer);
        buttonsDiv.appendChild(button);
    });
}

function checkAnswer(button, correctAnswer) {
    const correctSound = document.getElementById('correct-sound');
    const incorrectSound = document.getElementById('incorrect-sound');

    if (button.textContent === correctAnswer) {
        button.classList.add('correct');
        score++;
        correctSound.play(); // Play correct answer sound
    } else {
        button.classList.add('incorrect');
        incorrectSound.play(); // Play incorrect answer sound
    }

    // Highlight the correct answer
    document.querySelectorAll('.button').forEach(btn => {
        if (btn.textContent === correctAnswer) {
            btn.classList.add('correct');
        }
    });

    document.getElementById('score').textContent = score;
    setTimeout(loadCard, 1500); // Load the next card after a delay
}

// End the game and display the final score
function endGame() {
    const finishSound = document.getElementById('finish-sound');
    finishSound.play(); // Play the game completion sound

    document.getElementById('game-container').style.display = 'none';
    document.getElementById('end-game').style.display = 'block';
    document.getElementById('final-score').textContent = score;
    document.getElementById('total-rounds').textContent = totalRounds;
}

// Restart the game and go back to the mode selection screen
function restartGame() {
    document.getElementById('end-game').style.display = 'none';
    document.getElementById('mode-selection').style.display = 'block';
}
