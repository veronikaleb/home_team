const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();

// --- Налаштування статичних файлів ---
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Шляхи до файлів
const DB_PATH = path.join(__dirname, 'databases/db.json');
const USERS_PATH = path.join(__dirname, 'databases/users.json');
const LOGS_PATH = path.join(__dirname, 'databases/logs.json');
const INVENTORY_PATH = path.join(__dirname, 'databases/inventory.json'); // НОВИЙ ШЛЯХ

// Перевірка і створення необхідних папок
const dirs = [path.join(__dirname, 'images'), path.join(__dirname, 'databases')];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
});

const readJSON = (filePath) => {
    if (!fs.existsSync(filePath)) return null;
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
};

// --- Робота з Мультимедіа (Multer) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images'); 
    },
    filename: (req, file, cb) => {
        const fileName = `avatar-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, fileName);
    }
});
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Файл не завантажено' });
    const imageUrl = `http://localhost:3000/images/${req.file.filename}`;
    res.json({ url: imageUrl });
});

// --- API роути ---

app.get('/api/data', (req, res) => {
    const dbData = readJSON(DB_PATH) || {};
    const usersData = readJSON(USERS_PATH) || [];
    const logsData = readJSON(LOGS_PATH) || [];
    const inventoryData = readJSON(INVENTORY_PATH) || []; // Читаємо окремий файл складу

    const fullData = { 
        tasks: [], shifts: [], 
        archiveTasks: [], complexes: [], 
        ...dbData, 
        users: usersData,
        logs: logsData,
        inventory: inventoryData // Віддаємо дані складу фронтенду
    };
    res.json(fullData);
});

app.post('/api/save', (req, res) => {
    const incomingData = req.body;

    // 1. Збереження користувачів
    if (incomingData.users) {
        fs.writeFileSync(USERS_PATH, JSON.stringify(incomingData.users, null, 2));
    }

    // 2. Збереження логів
    if (incomingData.logs) {
        fs.writeFileSync(LOGS_PATH, JSON.stringify(incomingData.logs, null, 2));
    }

    // 3. НОВЕ: Збереження складу в inventory.json
    if (incomingData.inventory) {
        fs.writeFileSync(INVENTORY_PATH, JSON.stringify(incomingData.inventory, null, 2));
    }

    // 4. Збереження решти даних в db.json (ВИКЛЮЧАЄМО inventory)
    const keysToSaveToDB = ['tasks', 'shifts', 'archiveTasks', 'complexes'];
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