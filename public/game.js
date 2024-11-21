let players = [];
const maxPlayers = 5;

const roles = [
    "National Parks Conservation Association (NPCA) Representative",
    "American Hiking Society (AKS) Representative",
    "Traveler",
    "ExxonMobil Representative",
    "Chevron Representative",
];


export default function handler(req, res) {
    if (req.method === 'POST') {
        if (req.url === '/api/game') {
            const { name } = req.body;
            if (!name) return res.status(400).json({ error: 'Name is required.' });
            if (players.find(player => player.name === name))
                return res.status(400).json({ error: 'Player already joined.' });
            if (players.length >= maxPlayers)
                return res.status(400).json({ error: 'Game is full.' });

            players.push({ name });
            res.status(200).json({ players });
        } else if (req.url === '/api/game/start') {
            if (players.length !== maxPlayers)
                return res.status(400).json({ error: 'Not enough players to start the game.' });

            // Assign roles to players
            const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
            players = players.map((player, index) => ({
                ...player,
                role: shuffledRoles[index]
            }));
            
            res.status(200).json({ 
                message: 'Game started!',
                players: players.map(player => ({ name: player.name, role: player.role})) 
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed.' });
    }
}

function assignRoles(players) {
    if (players.length > roles.length) {
        throw new Error("Not enough roles for all players.");
    }

    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5); // Shuffle roles
    const assignedRoles = {};

    players.forEach((player, index) => {
        assignedRoles[player] = shuffledRoles[index];
    });

    return assignedRoles;
}