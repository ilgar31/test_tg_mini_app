import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN не установлен в .env файле');
}

const bot = new TelegramBot(token, { polling: true });

const api_id = 26903017;
const api_hash = 'e09d2ed4b9c117036353cfff69dc0a17';

const sessions: { [key: number]: { client: TelegramClient, phoneNumber: string } } = {};

const initDB = async () => {
    const db = await open({
        filename: '../telegram_channels.db',
        driver: sqlite3.Database
    });

    // Создание таблицы каналов, если она не существует
    await db.exec(`
        CREATE TABLE IF NOT EXISTS channels (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            title TEXT,
            link TEXT
        )
    `);

    return db;
};

// Функция для сохранения канала в БД
const saveChannelToDB = async (db: any, userId: string, id: string, title: string, link: string) => {
    await db.run(`
        INSERT INTO channels (id, user_id, title, link) VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET title=excluded.title, link=excluded.link
    `, [id, userId, title, link]);
};

// Функция для парсинга и сохранения каналов
const parseAndSaveChannels = async (client: TelegramClient, userId: string, db: any) => {
    const result = await client.getDialogs({});

    for (const dialog of result) {
        const chat = dialog.entity;
        if (chat && chat.className === 'Channel') {
            const link = `https://t.me/${chat.username}`; // Генерация ссылки на канал

            await saveChannelToDB(db, userId, chat.id.toString(), chat.title || 'No Title', link);

            console.log('Saved Chat:', chat.title || 'No Title');
        }
    }
};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Введите ваш номер телефона:');
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const idUser = msg.from?.id;
    console.log(idUser);
    const text = msg.text;
    const db = await initDB();

    if (!text || text.startsWith('/')) return;

    if (!sessions[chatId]) {
        const stringSession = new StringSession('');
        const client = new TelegramClient(stringSession, api_id, api_hash, {
            connectionRetries: 5,
        });

        sessions[chatId] = { client, phoneNumber: text };

        try {
            await client.start({
                phoneNumber: async () => text,
                password: async () => '',
                phoneCode: async () => {
                    bot.sendMessage(chatId, 'Введите код из SMS:');
                    return new Promise((resolve) => {
                        bot.once('message', (msg) => {
                            resolve(msg.text || '');
                        });
                    });
                },
                onError: (err) => console.log(err),
            });

            bot.sendMessage(chatId, 'Регистрация завершена!');

            await parseAndSaveChannels(client, idUser ? idUser.toString() : '', db);

            delete sessions[chatId];
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, 'Произошла ошибка при регистрации. Попробуйте снова.');
        }
    }
});

console.log('Бот запущен...');
