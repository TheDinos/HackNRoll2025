const textToType = document.getElementById('text-to-type');
const inputField = document.getElementById('input-field');
const startButton = document.getElementById('start-game');
const playerProgress = document.getElementById('player-progress');
const leaderboardList = document.getElementById('leaderboard-list');

let targetText = '';
let gameStarted = false;

startButton.addEventListener('click', () => {
    // Note to change this url when using server
    fetch('http://127.0.0.1:5000/start')
        .then(response => response.json())
        .then(data => {
            targetText = data.text;
            textToType.innerText = targetText;
            inputField.disabled = false;
            inputField.focus();
            gameStarted = true;
            startButton.disabled = true;
        });
});

inputField.addEventListener('input', () => {
    const typedText = inputField.value;
    if (typedText === targetText) {
        gameFinished();
    } else {
        const progress = Math.min(
            (typedText.length / targetText.length) * 100,
            100
        ).toFixed(1);
        playerProgress.innerText = `Your Progress: ${progress}%`;
    }
});

function gameFinished() {
    // Note to change this url when using server
    fetch('http://127.0.0.1:5000/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: 'Player1', time: new Date() })
    })
        .then(response => response.json())
        .then(data => {
            alert('Game Over! Check the leaderboard.');
            updateLeaderboard(data.leaderboard);
            inputField.disabled = true;
            startButton.disabled = false;
            inputField.value = '';
            textToType.innerText = 'Loading...';
        });
}

function updateLeaderboard(leaderboard) {
    leaderboardList.innerHTML = '';
    leaderboard.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.name}: ${player.time}s`;
        leaderboardList.appendChild(li);
    });
}
