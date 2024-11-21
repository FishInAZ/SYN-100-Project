let players = [];
const maxPlayers = 5;

const roles = [
    "National Parks Conservation Association (NPCA) Representative",
    "American Hiking Society (AKS) Representative",
    "Traveler",
    "ExxonMobil Representative",
    "Chevron Representative",
];

let gameState = {
    missionLeaderIndex: 0,
    numFailedMissions: 0,
    numSucceededMissions: 0,
    currentMission: 1,
    NPCAhead: null, // For endgame guessing
    proposedTeam: [], // Stores the current proposed team
};

export default function handler(req, res) {
    if (req.method === 'POST') {
        const url = req.url;
        const { body } = req;

        if (url === '/api/game') {
            handleJoinGame(body, res);
        } else if (url === '/api/game/start') {
            handleStartGame(res);
        } else if (url === '/propose_team') {
            handleProposeTeam(body, res);
        } else if (url === '/vote_team') {
            handleVoteTeam(body, res);
        } else if (url === '/mission_result') {
            handleMissionResult(body, res);
        } else {
            res.status(404).json({ error: 'Endpoint not found.' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed.' });
    }
}

// Handle player joining
function handleJoinGame(body, res) {
    const { name } = body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });
    if (players.find(player => player.name === name))
        return res.status(400).json({ error: 'Player already joined.' });
    if (players.length >= maxPlayers)
        return res.status(400).json({ error: 'Game is full.' });

    players.push({ name });
    res.status(200).json({ players });
}

// Handle game start
function handleStartGame(res) {
    if (players.length !== maxPlayers)
        return res.status(400).json({ error: 'Not enough players to start the game.' });

    // Assign roles to players
    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
    players = players.map((player, index) => ({
        ...player,
        role: shuffledRoles[index],
    }));

    res.status(200).json({
        message: 'Game started!',
        players: players.map(player => ({ name: player.name, role: player.role })),
    });
}

// Handle proposing a team
function handleProposeTeam(body, res) {
    const { team } = body;
    if (!team || !Array.isArray(team) || team.length === 0)
        return res.status(400).json({ error: 'Invalid team proposed.' });

    gameState.proposedTeam = team;
    res.status(200).json({ message: 'Team proposed successfully!', team });
}

// Handle voting on a team
function handleVoteTeam(body, res) {
    const { vote } = body;
    if (!vote || !['approve', 'reject'].includes(vote))
        return res.status(400).json({ error: 'Invalid vote.' });

    // Simulate voting results for simplicity
    const approveVotes = Math.floor(Math.random() * (players.length + 1));
    const rejectVotes = players.length - approveVotes;

    if (approveVotes > rejectVotes) {
        res.status(200).json({ message: 'Team approved!' });
    } else {
        gameState.missionLeaderIndex = (gameState.missionLeaderIndex + 1) % players.length;
        res.status(200).json({ message: 'Team rejected. Next leader assigned.' });
    }
}

// Handle mission result submission
function handleMissionResult(body, res) {
    const { result } = body;
    if (!result || !['pass', 'fail'].includes(result))
        return res.status(400).json({ error: 'Invalid mission result.' });

    if (result === 'fail') {
        gameState.numFailedMissions++;
    } else {
        gameState.numSucceededMissions++;
    }

    // Check for victory
    if (gameState.numFailedMissions === 3) {
        return res.status(200).json({ message: 'Corporate Interests win!' });
    }
    if (gameState.numSucceededMissions === 3) {
        return res.status(200).json({ message: 'Green Detectives win the missions!' });
    }

    gameState.currentMission++;
    res.status(200).json({ message: 'Mission result submitted.', nextMission: gameState.currentMission });
}