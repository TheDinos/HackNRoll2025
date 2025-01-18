const socket = io('http://127.0.0.1:5000'); // Use the backend's URL

const textToType = document.getElementById('text-to-type');
const playerProgress = document.getElementById('player-progress');
const opponentProgress = document.getElementById('opponent-progress');
const startButton = document.getElementById('start-game');
const roomNameInput = document.getElementById('room-name');
const playerNameInput = document.getElementById('player-name');

let room = '';
let username = '';
let countdownInterval;
let currentShortcutIndex = 0; // Track the player's current shortcut index
let shortcuts = [];           // List of shortcuts for the game

// Join a room when the player clicks the button
startButton.addEventListener('click', () => {
    username = playerNameInput.value.trim(); // Get the player's name
    room = roomNameInput.value.trim();
    if (!username || !room) {
        alert('Please enter both your name and room name.');
        return;
    }

    console.log(`Joining room: ${room}, Username: ${username}`); // Debugging log
    socket.emit('join', { room, username });

    startButton.disabled = true;
    roomNameInput.disabled = true;
    textToType.innerText = 'Waiting for another player to join...';
});

// Update the current shortcut description
function updateShortcut() {
    if (currentShortcutIndex < shortcuts.length) {
        textToType.innerText = `${shortcuts[currentShortcutIndex].description}`;
    } else {
        textToType.innerText = 'Waiting for result...';
    }
}

// Handle the start countdown event
socket.on('start_countdown', (data) => {
    console.log(data.message);

    let countdown = 5; // Countdown from 5 seconds
    textToType.innerText = `Game starting in ${countdown} seconds...`;

    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            textToType.innerText = `Game starting in ${countdown} seconds...`;
        } else {
            clearInterval(countdownInterval);
            updateShortcut(); // Start displaying the first shortcut
        }
    }, 1000);
});

// Update progress bar function
function updateProgressBar(progressElement, progress, total) {
    const percentage = (progress / total) * 100;
    progressElement.style.width = `${percentage}%`;
}

// Handle individual player progress updates
socket.on('player_progress', (data) => {
    const totalShortcuts = shortcuts.length;

    if (data.username === username) {
        // Update your progress bar
        const playerBar = document.getElementById('player-progress-bar');
        updateProgressBar(playerBar, data.progress, totalShortcuts);

        // Update the current shortcut if it's your progress
        if (data.progress !== currentShortcutIndex) {
            currentShortcutIndex = data.progress;
            updateShortcut();
        }
    }
});

// Handle game state updates
socket.on('game_state', (data) => {
    console.log('Game state received:', data);
    shortcuts = data.shortcuts;
    const totalShortcuts = shortcuts.length;

    // Update opponent progress bar
    const opponent = Object.keys(data.progress).find((user) => user !== username);
    if (opponent) {
        const opponentBar = document.getElementById('opponent-progress-bar');
        const opponentProgressValue = data.progress[opponent] || 0;
        updateProgressBar(opponentBar, opponentProgressValue, totalShortcuts);
    }
});

// Handle keybind input
document.addEventListener('keydown', (event) => {
    const keybind = getKeybind(event); // Capture the keybind
    console.log(`Keybind pressed: ${keybind}`);

    // Prevent default browser behavior for specific shortcuts
     if (keybind === "Ctrl+F" || keybind === "Ctrl+S" || keybind === "Ctrl+P"
        || keybind === "Ctrl+O"
     ) {
        event.preventDefault(); // Stop the browser's default action
        console.log(`Prevented default for: ${keybind}`);
    }

    // Emit the keybind to the backend for validation
    if (room && username) {
        socket.emit('input', { room, username, keybind });
    } else {
        console.warn('Room or username is not set.');
    }
});

function getKeybind(event) {
    let keys = [];
    if (event.ctrlKey) keys.push("Ctrl");
    if (event.shiftKey) keys.push("Shift");
    if (event.altKey) keys.push("Alt");

    // Handle special keys
    const specialKeys = ["Enter", "Backspace", "Tab"];
    if (specialKeys.includes(event.key)) {
        keys.push(event.key);
    } else {
        keys.push(event.key.toUpperCase());
    }

    return keys.join("+");
}

// Handle the game result (victory or loss)
socket.on('game_result', (data) => {
    if (!room) {
        console.warn("Game result received, but the player is not in a room.");
        return;
    }

    if (data.result === 'victory') {
        showVictoryScreen();
    } else if (data.result === 'loss') {
        showLossScreen();
    }
});

// Display the victory screen
function showVictoryScreen() {
    document.body.innerHTML = `
        <div style="text-align: center; margin-top: 50px;">
            <h1>Congratulations! You Win! 🏆</h1>
            <button onclick="restartGame()">Play Again</button>
        </div>
    `;
}

// Display the loss screen
function showLossScreen() {
    document.body.innerHTML = `
        <div style="text-align: center; margin-top: 50px;">
            <h1>Sorry, You Lost! 😔</h1>
            <button onclick="restartGame()">Try Again</button>
        </div>
    `;
}

// Restart the game
function restartGame() {
    location.reload(); // Reload the page to restart
}
