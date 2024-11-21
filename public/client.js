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
            body: JSON.stringify({ name: playerName }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        alert(`You joined the game as ${playerName}!`);
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

        // Display roles for all players
        alert('Game is starting!');
        updateGameState(data.players);
    } catch (error) {
        errorMessage.style.display = 'block';
        errorMessage.innerText = error.message;
    }
});

// Update player list in the lobby
function updatePlayerList(players) {
    gameTable.innerHTML = players
        .map(
            (player) => `
        <div class="player-avatar">
            <div class="player-name">${player.name}</div>
            <div class="avatar-image"></div>
        </div>
    `
        )
        .join('');
}

// Update game state (roles and other data)
function updateGameState(players) {
    gameTable.innerHTML = players
        .map(
            (player) => `
        <div class="player-avatar">
            <div class="player-name">${player.name}</div>
            <div class="player-role">${player.role}</div>
        </div>
    `
        )
        .join('');
}

// Function to propose a team
async function proposeTeam(team) {
    try {
        const response = await fetch('/propose_team', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ team }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        alert(`Team proposed: ${data.team.join(', ')}`);
    } catch (error) {
        alert(`Error proposing team: ${error.message}`);
    }
}

// Function to submit mission result
async function submitMissionResult(result) {
    try {
        const response = await fetch('/mission_result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        alert(`Mission result submitted. Next mission: ${data.nextMission}`);
    } catch (error) {
        alert(`Error submitting mission result: ${error.message}`);
    }
}