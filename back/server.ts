import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import https from 'https';
import fs from 'fs';


const app = express();
const port = 3001;

app.use(cors());

const initDB = async () => {
    return open({
        filename: '../telegram_channels.db',
        driver: sqlite3.Database
    });
};

app.get('/api/channels/:userId', async (req, res) => {
    const db = await initDB();
    const userId = req.params.userId;
    console.log(userId);

    const channels = await db.all('SELECT * FROM channels WHERE user_id = ?', [userId]);
    if (channels.length > 0) {
        res.json(channels);
    } else {
        res.status(404).json({ message: 'No channels found. Please register.' });
    }
});

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app).listen(port, () => {
    console.log(`Server running at https://localhost:${port}`);
});

export {};
