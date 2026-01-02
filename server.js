const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

const DB_PATH = path.join(__dirname, 'db.json');
const USERS_PATH = path.join(__dirname, 'users.json');

const readJSON = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e);
        return [];
    }
};

app.get('/api/data', (req, res) => {
    const dbData = readJSON(DB_PATH) || {};
    const usersData = readJSON(USERS_PATH) || [];
    const fullData = { 
        tasks: [], 
        inventory: [], 
        shifts: [], 
        logs: [], 
        archiveTasks: [], 
        complexes: [], 
        ...dbData, 
        users: usersData 
    };
    res.json(fullData);
});
app.post('/api/save', (req, res) => {
    const incomingData = req.body;

    if (incomingData.users) {
        fs.writeFileSync(USERS_PATH, JSON.stringify(incomingData.users, null, 2));
    }

    // Додано 'complexes' у список дозволених ключів
    const keysToSaveToDB = ['tasks', 'inventory', 'shifts', 'logs', 'archiveTasks', 'complexes'];
    let dbData = readJSON(DB_PATH) || {};
    let dbChanged = false;

    keysToSaveToDB.forEach(key => {
        if (incomingData[key]) {
            dbData[key] = incomingData[key];
            dbChanged = true;
        }
    });

    if (dbChanged) {
        fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
    }

    res.json({ success: true });
});

app.listen(3000, () => {
    console.log('SERVER RUNNING on http://localhost:3000');
});