// table.js

// Array to hold player data
let players = [];
const radius = 150; // Radius for positioning avatars in a circle

// Get HTML elements
const form = document.getElementById('joinForm');
const gameTable = document.getElementById('gameTable');

// Event listener for the join form submission
form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    const playerName = document.getElementById('player_name').value.trim();
    if (!playerName) {
        alert('Please enter a valid name!');
        return;
    }

    // Create player avatar container
    const playerAvatar = document.createElement('div');
    playerAvatar.classList.add('player-avatar');

    // Create player name element
    const playerNameElement = document.createElement('div');
    playerNameElement.classList.add('player-name');
    playerNameElement.innerText = playerName;

    // Create player avatar image (tree image)
    const avatarImage = document.createElement('div');
    avatarImage.classList.add('avatar-image');

    // Assemble player avatar container
    playerAvatar.appendChild(playerNameElement);
    playerAvatar.appendChild(avatarImage);

    // Add to the game table
    gameTable.appendChild(playerAvatar);

    // Add player to the players array
    players.push(playerAvatar);

    // Clear input field
    document.getElementById('player_name').value = '';

    // Update avatar positions around the game table
    updatePlayerPositions();
});

// Function to update player positions around the game table
function updatePlayerPositions() {
    const angleStep = (2 * Math.PI) / players.length; // Divide the circle evenly for each player
    players.forEach((player, index) => {
        const angle = index * angleStep; // Calculate angle for each player
        const x = radius * Math.cos(angle); // Calculate x-coordinate
        const y = radius * Math.sin(angle); // Calculate y-coordinate
        player.style.transform = `translate(${x}px, ${y}px)`; // Apply position with CSS transform
    });
}

// Function to remove a player (if needed in the future)
function removePlayer(playerName) {
    const playerIndex = players.findIndex(player => player.querySelector('.player-name').innerText === playerName);
    if (playerIndex !== -1) {
        // Remove player from the DOM and array
        gameTable.removeChild(players[playerIndex]);
        players.splice(playerIndex, 1);
        // Update player positions after removal
        updatePlayerPositions();
    }
}

// Example usage of removePlayer function (for future use or development)
// removePlayer('PlayerName');