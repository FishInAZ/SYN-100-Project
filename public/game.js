// Avalon roles
const roles = [
    "Merlin",
    "Assassin",
    "Loyal Servant of Arthur",
    "Loyal Servant of Arthur",
    "Minion of Mordred",
    "Percival",
    "Morgana",
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
        shuffledRoles[index].includes("Minion") ||
        shuffledRoles[index] === "Morgana" ||
        shuffledRoles[index] === "Assassin"
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
  let assassinGuessed = false;
  
  // DOM Elements
  const roleDisplay = document.getElementById("role-display");
  const questOutcome = document.getElementById("quest-outcome");
  const nextButton = document.getElementById("next-button");
  const approveButton = document.getElementById("approve-button");
  const rejectButton = document.getElementById("reject-button");
  const startQuestButton = document.getElementById("start-quest-button");
  
  // Show the next player's role
  function showNextRole() {
    if (currentPlayerIndex < playerRoles.length) {
      const currentPlayer = playerRoles[currentPlayerIndex];
      roleDisplay.textContent = `${currentPlayer.name}, your role is: ${currentPlayer.role}`;
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
    questTeam = players.slice(0, 2); // Change the number of players per quest as needed
    roleDisplay.textContent = `Quest ${currentQuestIndex + 1}: Team members are ${questTeam.join(
      ", "
    )}`;
    currentPlayerIndex = 0; // Reset index for voting
    nextPlayerVote();
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
        "Good team wins! Assassin, guess who Merlin is.";
      assassinGuessPhase();
    } else {
      roleDisplay.textContent = "Bad team wins!";
    }
  }
  
  // Assassin's guess logic
  function assassinGuessPhase() {
    const assassin = playerRoles.find((player) => player.role === "Assassin");
    const merlin = playerRoles.find((player) => player.role === "Merlin");
  
    roleDisplay.textContent = `${assassin.name}, you are the Assassin. Guess who Merlin is.`;
  
    // Display players for the Assassin to guess
    const playersList = document.createElement("ul");
    players.forEach((player) => {
      const listItem = document.createElement("li");
      listItem.textContent = player;
      listItem.style.cursor = "pointer";
      listItem.addEventListener("click", () => {
        if (player === merlin.name) {
          questOutcome.textContent =
            "The Assassin guessed correctly! Bad team wins!";
        } else {
          questOutcome.textContent =
            "The Assassin guessed incorrectly! Good team wins!";
        }
        roleDisplay.textContent = "Game Over!";
        assassinGuessed = true;
        playersList.remove();
      });
      playersList.appendChild(listItem);
    });
  
    document.body.appendChild(playersList);
  }
  
  // Event listeners
  nextButton.addEventListener("click", showNextRole);
  approveButton.addEventListener("click", () => handleBadVote(true));
  rejectButton.addEventListener("click", () => handleBadVote(false));
  startQuestButton.addEventListener("click", assignQuest);
  