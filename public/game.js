let players = [];
const maxPlayers = 5;

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
            res.status(200).json({ message: 'Game started!', players });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed.' });
    }
}
