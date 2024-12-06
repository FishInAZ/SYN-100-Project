// Fixed roles and their descriptions
const roles = [
  {
    name: "National Parks Conservation Association (NPCA) Representative",
    description: "A special Green Detective",
    team: "Green Detectives",
  },
  {
    name: "American Hiking Society (AKS) Representative",
    description: "A special Green Detective",
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
      "A Corporate Interest. If three missions are completed successfully, you have one chance to correctly identify the NPCA Representative and 'replace' them with a corrupt official, winning the game for the Corporate Interests.",
    team: "Corporate Interests",
  },
];

// Retrieve players from sessionStorage
const players = JSON.parse(sessionStorage.getItem("players")) || [];

// Validate the number of players
if (players.length !== 5) {
  alert("Exactly 5 players are required to start the game.");
  window.location.href = "table.html"; // Redirect back to the table page
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

// Helper function to determine team size based on mission index
function getRequiredTeamSize(missionIndex) {
  const missionTeamSizes = [2, 3, 2, 3, 3]; // Mission-specific team sizes
  return missionTeamSizes[missionIndex];
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
let missionVotes = [];

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
  playersListContainer.innerHTML = ""; // Clear the previous list
  const requiredTeamSize = getRequiredTeamSize(currentMissionIndex); // Get team size for current mission

  playerRoles.forEach((player) => {
    const listItem = document.createElement("div");
    listItem.textContent = player.name;
    listItem.style.cursor = "pointer";
    listItem.addEventListener("click", () => {
      if (selectedTeam.includes(player.name)) {
        // Remove the player if already selected
        selectedTeam = selectedTeam.filter((name) => name !== player.name);
        listItem.style.backgroundColor = ""; // Reset background
      } else if (selectedTeam.length < requiredTeamSize) {
        // Add player to the team if under the required size
        selectedTeam.push(player.name);
        listItem.style.backgroundColor = "lightgreen"; // Highlight selected player
      }
      // Show or hide the Start Mission button based on team selection
      if (selectedTeam.length === requiredTeamSize) {
        startMissionButton.classList.remove("hidden");
      } else {
        startMissionButton.classList.add("hidden");
      }
    });
    playersListContainer.appendChild(listItem);
  });
}

// Handle team voting phase
function voteForTeam() {
  if (currentPlayerIndex < playerRoles.length) {
    const currentPlayer = playerRoles[currentPlayerIndex];
    roleDisplay.textContent = `${currentPlayer.name}, vote to approve or reject the selected team.`;
    approveButton.classList.remove("hidden");
    rejectButton.classList.remove("hidden");
  } else {
    // All votes have been cast; tally them
    tallyTeamVotes();
  }
}

// Tally team votes
function tallyTeamVotes() {
  const approves = votes.filter((vote) => vote).length;

  if (approves > votes.length / 2) {
    roleDisplay.textContent = `Team approved! Proceeding with the mission.`;
    startMissionVoting();
  } else {
    teamProposalsRejected++;
    if (teamProposalsRejected === 5) {
      roleDisplay.textContent = "Five team proposals rejected. Corporate Interests win!";
      return;
    }
    currentLeaderIndex = (currentLeaderIndex + 1) % playerRoles.length;
    assignMission();
  }
}

// Mission voting phase
function startMissionVoting() {
  missionVotes = [];
  currentPlayerIndex = 0; // Reset for mission voting
  missionVote();
}

function missionVote() {
  if (currentPlayerIndex < selectedTeam.length) {
    const currentPlayer = playerRoles.find(
      (player) => player.name === selectedTeam[currentPlayerIndex]
    );
    roleDisplay.textContent = `${currentPlayer.name}, vote for mission success or failure.`;
    approveButton.classList.remove("hidden");
    rejectButton.classList.remove("hidden");
  } else {
    tallyMissionVotes();
  }
}

// Tally mission votes
function tallyMissionVotes() {
  const rejects = missionVotes.filter((vote) => !vote).length;
  if (rejects > 0) {
    corporateInterestsWins++;
    missionOutcome.textContent = `Mission ${currentMissionIndex + 1} failed!`;
  } else {
    greenDetectivesWins++;
    missionOutcome.textContent = `Mission ${currentMissionIndex + 1} succeeded!`;
  }

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

// Handle Chevron Representative's special ability
function handleChevronSpecial() {
  const chevron = playerRoles.find((player) => player.role === "Chevron Representative");
  roleDisplay.textContent = `${chevron.name}, guess who the NPCA Representative is.`;
}

// End game
function endGame() {
  if (greenDetectivesWins === 3) {
    roleDisplay.textContent = "Green Detectives win!";
  } else {
    roleDisplay.textContent = "Corporate Interests win!";
  }
}

// Event listeners
nextButton.addEventListener("click", showNextRole);
startMissionButton.addEventListener("click", () => {
  if (selectedTeam.length > 0) {
    roleDisplay.textContent = `Team selected: ${selectedTeam.join(", ")}. Proceeding to vote.`;
    startMissionButton.classList.add("hidden");
    votes = [];
    currentPlayerIndex = 0;
    voteForTeam();
  } else {
    alert("Please select a team before starting the mission.");
  }
});
approveButton.addEventListener("click", () => {
  if (votes.length < playerRoles.length) {
    votes.push(true);
    currentPlayerIndex++;
    voteForTeam();
  } else {
    missionVotes.push(true);
    currentPlayerIndex++;
    missionVote();
  }
});
rejectButton.addEventListener("click", () => {
  if (votes.length < playerRoles.length) {
    votes.push(false);
    currentPlayerIndex++;
    voteForTeam();
  } else {
    missionVotes.push(false);
    currentPlayerIndex++;
    missionVote();
  }
});
