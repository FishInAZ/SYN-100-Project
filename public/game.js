// Avalon roles
const roles = [
  "National Parks Conservation Association", // Merlin
  "ExxonMobil", // Assassin
  "U.S. Forest Service", // Loyal Servant
  "U.S. Environmental Protection Agency", // Percival
  "Peabody Energy" // Morgana
];

// Get players from sessionStorage
const players = JSON.parse(sessionStorage.getItem("players")) || [];

// Shuffle array helper function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

// Assign roles to players
function assignRoles(players) {
  const shuffledRoles = roles.slice(0, players.length);
  shuffleArray(shuffledRoles);
  return players.map((player, index) => ({
      name: player,
      role: shuffledRoles[index],
      team:
          shuffledRoles[index] === "Peabody Energy" ||
          shuffledRoles[index] === "ExxonMobil"
              ? "bad"
              : "good",
  }));
}

// Game state variables
const playerRoles = assignRoles(players);
let currentPlayerIndex = 0;
let currentQuestIndex = 0;
let goodWins = 0;
let badWins = 0;
let questVotes = [];
let questTeam = [];
let ExxonMobilGuessed = false;
let currentLeaderIndex = 0;

// DOM Elements
const roleDisplay = document.getElementById("role-display");
const questOutcome = document.getElementById("quest-outcome");
const nextButton = document.getElementById("next-button");
const approveButton = document.getElementById("approve-button");
const rejectButton = document.getElementById("reject-button");
const startQuestButton = document.getElementById("start-quest-button");
const playersListContainer = document.getElementById("players-list");

// Show the next player's role
function showNextRole() {
  if (currentPlayerIndex < playerRoles.length) {
      const currentPlayer = playerRoles[currentPlayerIndex];
      let message = `${currentPlayer.name}, your role is: ${currentPlayer.role}. You are on the ${currentPlayer.team} team.`;

      // Additional information for roles with powers
      if (currentPlayer.role === "National Parks Conservation Association") {
          // Merlin sees all evil players except Mordred
          const evilPlayers = playerRoles
              .filter(player => player.team === "bad" && player.role !== "Peabody Energy")
              .map(player => player.name)
              .join(', ');
          message += ` You can see the evil players: ${evilPlayers}.`;
      } else if (currentPlayer.role === "U.S. Environmental Protection Agency") {
          // Percival sees Merlin and Morgana (but doesn't know who is who)
          const merlinAndMorgana = playerRoles
              .filter(player => player.role === "National Parks Conservation Association" || player.role === "Peabody Energy")
              .map(player => player.name)
              .join(' or ');
          message += ` You know that one of these players is Merlin: ${merlinAndMorgana}.`;
      } else if (currentPlayer.role === "Peabody Energy" || currentPlayer.role === "ExxonMobil") {
          // Evil players see each other
          const fellowEvil = playerRoles
              .filter(player => player.team === "bad" && player.name !== currentPlayer.name)
              .map(player => player.name)
              .join(', ');
          message += ` Your fellow evil players are: ${fellowEvil}.`;
      }

      roleDisplay.textContent = message;
      currentPlayerIndex++;
      nextButton.textContent =
          currentPlayerIndex < playerRoles.length ? "Next" : "Assign Quests";
  } else {
      roleDisplay.textContent = "Roles assigned! Start assigning quests.";
      nextButton.classList.add("hidden");
      startQuestButton.classList.remove("hidden");
  }
}

// Assign players to a quest
function assignQuest() {
  questOutcome.classList.add("hidden");
  questVotes = [];
  questTeam = []; // Clear the current quest team
  roleDisplay.textContent = `Leader ${playerRoles[currentLeaderIndex].name}, please select the team members for Quest ${currentQuestIndex + 1}. Click on player names to select.`;
  renderPlayersList();
}

// Render the players list for leader to select quest members
function renderPlayersList() {
  playersListContainer.innerHTML = ""; // Clear previous list
  playerRoles.forEach(player => {
      const listItem = document.createElement("div");
      listItem.textContent = player.name;
      listItem.style.cursor = "pointer";
      listItem.addEventListener("click", () => {
          if (questTeam.includes(player.name)) {
              // If player is already in the team, remove them
              questTeam = questTeam.filter(name => name !== player.name);
              listItem.style.backgroundColor = "";
          } else if (questTeam.length < 2) { // Limit the number of players per quest
              // Add player to the quest team
              questTeam.push(player.name);
              listItem.style.backgroundColor = "lightgreen";
          }
          if (questTeam.length === 2) { // All members selected
              startQuestButton.textContent = "Start Quest with Selected Team";
              startQuestButton.classList.remove("hidden");
          } else {
              startQuestButton.classList.add("hidden");
          }
      });
      playersListContainer.appendChild(listItem);
  });
}

// Handle quest voting
function nextPlayerVote() {
  if (currentPlayerIndex < questTeam.length) {
      const currentPlayer = playerRoles.find(
          (player) => player.name === questTeam[currentPlayerIndex]
      );

      if (currentPlayer.team === "good") {
          // Good players can only approve the quest
          questVotes.push(true);
          currentPlayerIndex++;
          nextPlayerVote(); // Automatically move to the next player
      } else {
          // Bad players choose to approve or reject
          roleDisplay.textContent = `${currentPlayer.name}, you are on the bad team. Do you approve or reject the quest?`;
          approveButton.classList.remove("hidden");
          rejectButton.classList.remove("hidden");
      }
  } else {
      // All votes collected
      tallyVotes();
  }
}

// Handle bad team votes
function handleBadVote(approve) {
  questVotes.push(approve);
  approveButton.classList.add("hidden");
  rejectButton.classList.add("hidden");
  currentPlayerIndex++;
  nextPlayerVote();
}

// Tally votes and determine quest outcome
function tallyVotes() {
  const approves = questVotes.filter((vote) => vote).length;

  // Quest succeeds if all members approve
  if (approves === questTeam.length) {
      goodWins++;
      questOutcome.textContent = `Quest ${currentQuestIndex + 1} succeeded!`;
  } else {
      badWins++;
      questOutcome.textContent = `Quest ${currentQuestIndex + 1} failed!`;
  }

  questOutcome.classList.remove("hidden");
  currentQuestIndex++;
  currentLeaderIndex = (currentLeaderIndex + 1) % playerRoles.length; // Rotate leader

  if (currentQuestIndex >= 5) {
      endGame();
  } else {
      startQuestButton.textContent = "Assign New Quest";
      startQuestButton.classList.remove("hidden");
  }
}

// End game logic
function endGame() {
  startQuestButton.classList.add("hidden");

  if (goodWins > badWins) {
      roleDisplay.textContent =
          "Good team wins! ExxonMobil, guess who National Parks Conservation Association is.";
      ExxonMobilGuessPhase();
  } else {
      roleDisplay.textContent = "Bad team wins!";
  }
}

// ExxonMobil's guess logic
function ExxonMobilGuessPhase() {
  const ExxonMobil = playerRoles.find((player) => player.role === "ExxonMobil");
  const merlinPlayer = playerRoles.find((player) => player.role === "National Parks Conservation Association");

  roleDisplay.textContent = `${ExxonMobil.name}, you are the ExxonMobil. Guess who National Parks Conservation Association is.`;

  // Display players for the ExxonMobil to guess
  const playersList = document.createElement("ul");
  players.forEach((player) => {
      const listItem = document.createElement("li");
      listItem.textContent = player;
      listItem.style.cursor = "pointer";
      listItem.addEventListener("click", () => {
          if (player === merlinPlayer.name) {
              questOutcome.textContent =
                  "The ExxonMobil guessed correctly! Bad team wins!";
          } else {
              questOutcome.textContent =
                  "The ExxonMobil guessed incorrectly! Good team wins!";
          }
          roleDisplay.textContent = "Game Over!";
          ExxonMobilGuessed = true;
          playersList.remove();
      });
      playersList.appendChild(listItem);
  });

  document.body.appendChild(playersList);
}

// Event listeners
nextButton.add