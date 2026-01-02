// services.js - Сервісні функції та логування

const HISTORY_KEY = 'home_team_profile_history'; // Історія змін профілю (стара)

// Завантаження історії
const storedHistory = localStorage.getItem(HISTORY_KEY);
window.PROFILE_HISTORY = storedHistory ? JSON.parse(storedHistory) : [];

// Константи для ролей
const ROLES = {
    ADMIN: 'admin',
    DISPATCHER: 'dispatcher',
    WORKER: 'worker',
    MANAGER: 'manager'
};

// Перевірка дозволів редагування
function canEditProfile(editor, targetUser) {
    const isAdmin = editor.role === 'Адмін' || editor.role === 'admin' || editor.role === 'Директор';
    if (isAdmin) return true; 
    if (editor.id === targetUser.id) return true; 
    return false;
}

// Функція запису в ГЛОБАЛЬНИЙ ЛОГ (безпека)
function logSystemAction(action, user, details) {
    const newLog = {
        id: Date.now(),
        date: new Date().toISOString(),
        user: user ? user.name : "Unknown",
        action: action,
        details: details
    };
    
    // Додаємо в локальний об'єкт бази (React потім це збереже через saveDB)
    if(window.MOCK_DB && window.MOCK_DB.logs) {
        window.MOCK_DB.logs.unshift(newLog);
    }
    return newLog;
}

// Історія змін саме профілю (для відображення в картці юзера)
function logProfileChange({ editor, target, field, oldValue, newValue }) {
    const newRecord = {
        date: new Date().toISOString(),
        editor,
        target,
        field,
        oldValue,
        newValue
    };
    window.PROFILE_HISTORY.unshift(newRecord);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(window.PROFILE_HISTORY));
    
    // Дублюємо в системний лог
    logSystemAction("Зміна профілю", { name: editor }, `Змінено ${field} у ${target}`);
}

window.AppService = {
    canEditProfile,
    logProfileChange,
    logSystemAction,
    ROLES
};