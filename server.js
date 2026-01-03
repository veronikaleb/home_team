require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DB_PATH = path.join(__dirname, 'db.json');
const USERS_PATH = path.join(__dirname, 'users.json');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB підключено');
        forceMigration(); 
    });

const CRMDataSchema = new mongoose.Schema({
    tasks: Array, inventory: Array, shifts: Array, 
    logs: Array, archiveTasks: Array, complexes: Array, users: Array
});
const CRMData = mongoose.model('CRMData', CRMDataSchema);

async function forceMigration() {
    console.log("⏳ Починаю повне перенесення даних...");
    try {
        const dbRaw = fs.readFileSync(DB_PATH, 'utf8');
        const usersRaw = fs.readFileSync(USERS_PATH, 'utf8');

        const dbFileData = JSON.parse(dbRaw);
        const usersFileData = JSON.parse(usersRaw);

        // Формуємо повний пакет даних
        const finalData = {
            tasks: dbFileData.tasks || [],
            inventory: dbFileData.inventory || [], // МАТЕРІАЛИ
            complexes: dbFileData.complexes || [], // ОБ'ЄКТИ
            shifts: dbFileData.shifts || [],
            logs: dbFileData.logs || [],
            archiveTasks: dbFileData.archiveTasks || [],
            users: usersFileData || [] // ПРАЦІВНИКИ
        };

        // Очищаємо і записуємо
        await CRMData.deleteMany({}); 
        await CRMData.create(finalData);
        
        console.log("🚀 ПЕРЕМОГА! Все перенесено:");
        console.log(`- Заявок: ${finalData.tasks.length}`);
        console.log(`- Матеріалів: ${finalData.inventory.length}`);
        console.log(`- Працівників: ${finalData.users.length}`);
        console.log(`- Об'єктів: ${finalData.complexes.length}`);

    } catch (e) {
        console.error("❌ Помилка під час збору даних:", e.message);
    }
}

app.get('/api/data', async (req, res) => {
    const data = await CRMData.findOne();
    res.json(data || {});
});

app.post('/api/save', async (req, res) => {
    try {
        await CRMData.findOneAndUpdate({}, { $set: req.body }, { upsert: true });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));