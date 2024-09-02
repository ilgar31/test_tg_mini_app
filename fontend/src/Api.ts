import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const port = 3001;

const initDB = async () => {
    return open({
        filename: '../../telegram_channels.db',
        driver: sqlite3.Database
    });
};

app.get('/api/channels/:userId', async (req, res) => {
    const db = await initDB();
    const userId = req.params.userId;

    const channels = await db.all('SELECT * FROM channels WHERE user_id = ?', [userId]);
    if (channels.length > 0) {
        res.json(channels);
    } else {
        res.status(404).json({ message: 'No channels found. Please register.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

export {};