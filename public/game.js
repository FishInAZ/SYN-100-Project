// Fixed roles and their descriptions
const roles = [
  {
    name: "National Parks Conservation Association (NPCA) Representative",
    description: "A Green Detective. Knows who the Chevron Representative is.",
    team: "Green Detectives",
  },
  {
    name: "American Hiking Society (AKS) Representative",
    description:
      "A Green Detective. Knows which people are the ExxonMobil Representative and the NPCA Representative but can’t discern between the two.",
    team: "Green Detectives",
  },
  {
    name: "Traveler",
    description: "A Green Detective. No extra information.",
    team: "Green Detectives",
  },
  {
    name: "ExxonMobil Representative",
    description: "A Corporate Interest. No extra information.",
    team: "Corporate Interests",
  },
  {
    name: "Chevron Representative",
    description:
      "A Corporate Interest. No extra information. If three missions are completed successfully, this player has one chance to correctly identify the NPCA Representative and 'replace' them with a corrupt official, winning the game for the Corporate Interests.",
    team: "Corporate Interests",
  },
];

// Retrieve players from sessionStorage
const players = JSON.parse(sessionStorage.getItem("players")) || [];

// Validate the number of players
if (players.length !== 5) {
  alert("Exactly 5 players are required to start the game.");
  window.location.href = "index.html"; // Redirect back to the table page
}

// Shuffle array helper function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Assign roles to players
function assignRoles(players) {
  shuffleArray(roles); // Shuffle the roles
  return players.map((player, index) => ({
    name: player,
    role: roles[index].name,
    description: roles[index].description,
    team: roles[index].team,
  }));
}

// Game state variables
const playerRoles = assignRoles(players);
let currentPlayerIndex = 0;
let currentMissionIndex = 0;
let greenDetectivesWins = 0;
let corporateInterestsWins = 0;
let teamProposalsRejected = 0;
let currentLeaderIndex = 0;
let selectedTeam = [];
let votes = [];

// DOM Elements
const roleDisplay = document.getElementById("role-display");
const missionOutcome = document.getElementById("mission-outcome");
const nextButton = document.getElementById("next-button");
const approveButton = document.getElementById("approve-button");
const rejectButton = document.getElementById("reject-button");
const startMissionButton = document.getElementById("start-mission-button");
const playersListContainer = document.getElementById("players-list");

// Reveal roles to players
function showNextRole() {
  if (currentPlayerIndex < playerRoles.length) {
    const currentPlayer = playerRoles[currentPlayerIndex];
    let message = `${currentPlayer.name}, your role is: ${currentPlayer.role}. ${currentPlayer.description}`;

    // Add role-specific hints
    if (currentPlayer.role === "National Parks Conservation Association (NPCA) Representative") {
      const chevron = playerRoles.find(
        (player) => player.role === "Chevron Representative"
      );
      message += ` You know that ${chevron.name} is the Chevron Representative.`;
    } else if (currentPlayer.role === "American Hiking Society (AKS) Representative") {
      const suspects = playerRoles
        .filter(
          (player) =>
            player.role === "ExxonMobil Representative" ||
            player.role === "National Parks Conservation Association (NPCA) Representative"
        )
        .map((player) => player.name)
        .join(" and ");
      message += ` You know that ${suspects} are either the ExxonMobil Representative or the NPCA Representative.`;
    }

    roleDisplay.textContent = message;
    currentPlayerIndex++;
    nextButton.textContent = currentPlayerIndex < playerRoles.length ? "Next" : "Start Game";
  } else {
    roleDisplay.textContent = "Roles assigned! The game begins.";
    nextButton.classList.add("hidden");
    assignMission();
  }
}

// Assign a mission
function assignMission() {
  missionOutcome.classList.add("hidden");
  selectedTeam = [];
  votes = [];
  roleDisplay.textContent = `Leader ${playerRoles[currentLeaderIndex].name}, select the team for Mission ${currentMissionIndex + 1}.`;
  renderPlayersList();
}

// Render players list for team selection
function renderPlayersList() {
  playersListContainer.innerHTML = "";
  playerRoles.forEach((player) => {
    const listItem = document.createElement("div");
    listItem.textContent = player.name;
    listItem.style.cursor = "pointer";
    listItem.addEventListener("click", () => {
      if (selectedTeam.includes(player.name)) {
        selectedTeam = selectedTeam.filter((name) => name !== player.name);
        listItem.style.backgroundColor = "";
      } else if (selectedTeam.length < 2) {
        selectedTeam.push(player.name);
        listItem.style.backgroundColor = "lightgreen";
      }
      if (selectedTeam.length === 2) {
        startMissionButton.classList.remove("hidden");
      } else {
        startMissionButton.classList.add("hidden");
      }
    });
    playersListContainer.appendChild(listItem);
  });
}

// Event listener for the "Start Mission" button
startMissionButton.addEventListener("click", () => {
  if (selectedTeam.length > 0) {
    roleDisplay.textContent = `Team selected: ${selectedTeam.join(", ")}. Vote to approve or reject this team.`;
    startMissionButton.classList.add("hidden");
    approveButton.classList.remove("hidden");
    rejectButton.classList.remove("hidden");
    currentPlayerIndex = 0; // Reset player index for voting
  } else {
    alert("Please select a team before starting the mission.");
  }
});

// Handle mission voting
function voteForMission() {
  if (currentPlayerIndex < playerRoles.length) {
    const currentPlayer = playerRoles[currentPlayerIndex];
    roleDisplay.textContent = `${currentPlayer.name}, vote to approve or reject this team.`;
    approveButton.classList.remove("hidden");
    rejectButton.classList.remove("hidden");
  } else {
    // All votes have been cast; tally them
    tallyVotes();
  }
}

function tallyVotes() {
  const approves = votes.filter(vote => vote).length;
  if (approves > votes.length / 2) {
    roleDisplay.textContent = `Team approved! Proceeding with the mission.`;
    executeMission();
  } else {
    roleDisplay.textContent = `Team rejected. Assigning a new leader.`;
    teamProposalsRejected++;
    if (teamProposalsRejected >= 5) {
      roleDisplay.textContent = "Five team proposals rejected. Corporate Interests win!";
      return;
    }
    currentLeaderIndex = (currentLeaderIndex + 1) % playerRoles.length;
    assignMission();
  }
}

// Execute mission logic
function executeMission() {
  const success = selectedTeam.every(playerName => {
    const player = playerRoles.find(p => p.name === playerName);
    return player.team === "Green Detectives";
  });

  if (success) {
    greenDetectivesWins++;
    missionOutcome.textContent = `Mission ${currentMissionIndex + 1} succeeded!`;
  } else {
    corporateInterestsWins++;
    missionOutcome.textContent = `Mission ${currentMissionIndex + 1} failed!`;
  }

  missionOutcome.classList.remove("hidden");
  currentMissionIndex++;

  if (greenDetectivesWins === 3) {
    handleChevronSpecial();
  } else if (corporateInterestsWins === 3 || currentMissionIndex === 5) {
    endGame();
  } else {
    currentLeaderIndex = (currentLeaderIndex + 1) % playerRoles.length;
    assignMission();
  }
}

// Chevron Representative's special ability
function handleChevronSpecial() {
  const chevron = playerRoles.find(
    (player) => player.role === "Chevron Representative"
  );
  roleDisplay.textContent = `${chevron.name}, guess who the NPCA Representative is.`;
  // Implement guessing logic here
}

// End game
function endGame() {
  if (greenDetectivesWins === 3) {
    roleDisplay.textContent = "Green Detectives win!";
  } else {
    roleDisplay.textContent = "Corporate Interests win!";
  }
}

// Event listeners for voting
approveButton.addEventListener("click", () => {
  votes.push(true);
  currentPlayerIndex++;
  voteForMission();
});

rejectButton.addEventListener("click", () => {
  votes.push(false);
  currentPlayerIndex++;
  voteForMission();
});
