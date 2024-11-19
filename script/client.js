const joinForm = document.getElementById('joinForm');
const startGameBtn = document.getElementById('startGameBtn');
const errorMessage = document.getElementById('errorMessage');
const gameTable = document.getElementById('gameTable');
let players = [];

// Event listener for joining the game
joinForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const playerName = document.getElementById('player_name').value.trim();
    if (!playerName) return alert('Please enter a valid name.');

    try {
        const response = await fetch('/api/game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: playerName })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        alert('You joined the game!');
        updatePlayerList(data.players);
    } catch (error) {
        errorMessage.style.display = 'block';
        errorMessage.innerText = error.message;
    }
});

// Start game button
startGameBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/game/start', { method: 'POST' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        alert('Game is starting!');
    } catch (error) {
        errorMessage.style.display = 'block';
        errorMessage.innerText = error.message;
    }
});

function updatePlayerList(players) {
    gameTable.innerHTML = players.map(player => `
        <div class="player-avatar">
            <div class="player-name">${player.name}</div>
            <div class="avatar-image"></div>
        </div>
    `).join('');
}
