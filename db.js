// db.js - База даних із підтримкою LocalStorage

const STORAGE_KEY = 'home_team_db_v2'; // Змінив ключ, щоб не конфліктувало зі старою версією

// --- ПОЧАТКОВІ ДАНІ (DEFAULTS) ---
const DEFAULT_COMPLEXES = [
    { id: 1, name: "ЖК 'Сонячна Брама'", city: "Київ", address: "вул. Ломоносова, 73" },
    { id: 2, name: "ЖК 'Затишний Квартал'", city: "Київ", address: "просп. Героїв, 12" },
    { id: 3, name: "ОСББ 'Надія'", city: "Бровари", address: "вул. Київська, 245" },
    { id: 4, name: "Бізнес-центр 'Summit'", city: "Київ", address: "вул. Паркова, 8" }
];

const DEFAULT_INVENTORY = [
    { id: 1, item: "Лампа LED E27 10W", quantity: 150, unit: "шт", min: 20 },
    { id: 2, item: "Труба поліпропіленова 20мм", quantity: 45, unit: "м", min: 50 },
    { id: 3, item: "Кран кульовий 1/2", quantity: 12, unit: "шт", min: 10 },
];

const DEFAULT_NEWS = [
    { id: 1, date: "2024-01-10", title: "Підготовка до сезону", text: "Всі перевірки завершено. Система готова." }
];

const DEFAULT_USERS = [
    { 
        id: 1, name: "Олександр Адмін", role: "admin", specialization: "Керівник",
        email: "admin@hometeam.com", phone: "+380670000001", dob: "1985-05-20",
        passwordHash: "hash_123", avatar: null,
        status: "active", // active, busy, dayoff
        assignedComplexes: [1, 2, 3, 4], // ID ЖК
        trustedDevice: navigator.userAgent // Для перевірки безпеки
    },
    { 
        id: 2, name: "Марія Диспетчер", role: "dispatcher", specialization: "Диспетчер",
        email: "disp@hometeam.com", phone: "+380670000002", dob: "1990-08-15",
        passwordHash: "hash_123", avatar: null,
        status: "active",
        assignedComplexes: [],
        trustedDevice: navigator.userAgent
    },
    { 
        id: 3, name: "Іван Електрик", role: "worker", specialization: "Електрик",
        email: "ivan@hometeam.com", phone: "+380670000003", dob: "1988-03-10",
        passwordHash: "hash_123", avatar: null,
        status: "busy",
        assignedComplexes: [1],
        trustedDevice: navigator.userAgent
    },
    { 
        id: 4, name: "Петро Сантехнік", role: "worker", specialization: "Сантехнік",
        email: "petro@hometeam.com", phone: "+380670000004", dob: "1982-11-30",
        passwordHash: "hash_123", avatar: null,
        status: "dayoff",
        assignedComplexes: [2],
        trustedDevice: navigator.userAgent
    }
];

const DEFAULT_TASKS = [
    { id: 101, title: "Заміна ламп у холі", locationId: 1, status: "todo", assignee: 3, priority: "Low" },
    { id: 102, title: "Прорив труби у підвалі", locationId: 2, status: "in-progress", assignee: 4, priority: "Critical" },
];

const DEFAULT_SHIFTS = [
    { id: 1, userId: 3, start: "2024-02-01T08:00", end: "2024-02-01T18:00", type: "work" },
    { id: 2, userId: 4, start: "2024-02-01T08:00", end: "2024-02-01T18:00", type: "work" }
];

const DEFAULT_LOGS = [
    { id: 1, date: new Date().toISOString(), user: "System", action: "Ініціалізація бази даних", details: "Перший запуск" }
];

const DEFAULT_LOGIN_HISTORY = [];

// --- ЛОГІКА ЗАВАНТАЖЕННЯ ---
function initDB() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (storedData) {
        console.log("DB Loaded from LocalStorage");
        window.MOCK_DB = JSON.parse(storedData);
    } else {
        console.log("DB Initialized with Defaults");
        window.MOCK_DB = {
            complexes: DEFAULT_COMPLEXES,
            inventory: DEFAULT_INVENTORY,
            news: DEFAULT_NEWS,
            users: DEFAULT_USERS,
            tasks: DEFAULT_TASKS,
            shifts: DEFAULT_SHIFTS,     // Нове
            logs: DEFAULT_LOGS,         // Нове
            loginHistory: DEFAULT_LOGIN_HISTORY // Нове
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(window.MOCK_DB));
    }
}

initDB();

window.saveDB = function(newData) {
    window.MOCK_DB = { ...window.MOCK_DB, ...newData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.MOCK_DB));
    console.log("DB Saved");
};