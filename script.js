// === КОНФИГУРАЦИЯ API ===
const API_KEY = "$2a$10$6A8RvTXoUaKzs5asgixFCO26ZXJs1/6lmoOldhiuHg4Z8e1WMyCvC";
const BIN_ID = "6a294677da38895dfea5fd35";

const GET_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;
const PUT_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// === ДАННЫЕ MOG ===
const mogData = [
    { 
        id: 'omega-1', 
        name: 'Омега-1', 
        alias: '"Шуйца Закона"', 
        spec: 'Этический контроль и ликвидация', 
        desc: 'Наделена полномочиями снимать с должности или устранять высокопоставленных сотрудников Фонда, которые действуют неэтично. Подчиняется напрямую Комитету по этике; своего рода антипод "Багряной десницы".', 
        img: 'img/omega1.png' 
    },
    { 
        id: 'epsilon-11', 
        name: 'Эпсилон-11', 
        alias: '"Девятихвостая лиса"', 
        spec: 'Внутренняя безопасность / Реагирование на нарушения', 
        desc: 'Находясь под надзором МОГ Альфа-1, обеспечивает внутреннюю безопасность Фонда SCP. Направляется в Зоны при неизбежном множественном нарушении условий содержания.', 
        img: 'img/Epsilon11.png' 
    },
    { 
        id: 'zeta-9', 
        name: 'Дзета-9', 
        alias: '"Кротокрысы"', 
        spec: 'Подземные и закрытые помещения', 
        desc: 'Специализируется на обнаружении, разведке и содержании подземных или закрытых помещений с аномальными свойствами, особенно с непостоянной топографией или нестабильным пространством-временем.', 
        img: 'img/Zeta9.png' 
    },
    { 
        id: 'lambda-5', 
        name: 'Лямбда-5', 
        alias: '"Белые кролики"', 
        spec: 'Путешествия по реальностям', 
        desc: 'Специализируется на путешествиях в нестабильные и сюрреалистичные реальности, где содержатся опасные лица и артефакты, способные манипулировать пространством и временем.', 
        img: 'img/Lambda5.png' 
    },
    { 
        id: 'eta-10', 
        name: 'Эта-10', 
        alias: '"Не вижу зла"', 
        spec: 'Визуальные и меметические угрозы', 
        desc: 'Специализируется на обнаружении, захвате и постановке на содержание объектов, представляющих опасность визуального восприятия, меметических агентов визуального действия, где требуется альтернативное наблюдение.', 
        img: 'img/Eta10.png' 
    },
    { 
        id: 'beta-7', 
        name: 'Бета-7', 
        alias: '"Шляпные болванчики"', 
        spec: 'Биологические, химические и радиационные угрозы', 
        desc: 'Специализируется на захвате и постановке на содержание аномалий с высокой биологической, химической или радиационной опасностью, а также на быстрой локализации и очистке территорий.', 
        img: 'img/Beta7.png' 
    },
    { 
        id: 'mu-13', 
        name: 'Мю-13', 
        alias: '"Охотники за привидениями"', 
        spec: 'Бестелесные и нематериальные сущности', 
        desc: 'Специализируется на отслеживании, анализе и постановке на содержание бестелесных или нематериальных проявлений и существ, особенно обладающих сознанием, разумом или способностью к адаптации.', 
        img: 'img/Mu13.png' 
    },
    { 
        id: 'nu-7', 
        name: 'Ню-7', 
        alias: '"Удар молота"', 
        spec: 'Милитаризованное быстрое реагирование', 
        desc: 'Милитаризованная МОГ, включающая батальон личного состава, бронетехнику и авиацию. Предназначена для быстрого реагирования на инциденты с потерей связи, масштабные нарушения или вторжения противника.', 
        img: 'img/Nu7.png' 
    },
    { 
        id: 'theta-7', 
        name: 'Тета-7', 
        alias: '"Вероятность Нуля"', 
        spec: 'Устранение аномалий физической реальности и времени', 
        desc: 'Информация временно отсутствует. Согласно предварительным данным, занимается устранением аномалий, связанных с физической реальностью и временем.', 
        img: 'img/Theta-7.png' 
    }
];
let currentUser = null;
let allUsers = [];

// === ЗАГРУЗКА ===
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('bgVideo');
    const enterBtn = document.getElementById('enterBtn');

    enterBtn.addEventListener('click', enterSite);
    video.addEventListener('ended', enterSite);

    function enterSite() {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('main-site').style.display = 'flex';
        document.getElementById('main-site').style.flexDirection = 'column';
        document.getElementById('main-site').style.minHeight = '100vh';
        initSite();
    }
});

// === ИНИЦИАЛИЗАЦИЯ ===
async function initSite() {
    const stored = localStorage.getItem('rpUser');
    if (stored) {
        currentUser = JSON.parse(stored);
        showProfile(currentUser);
    } else {
        showLoginButtons();
    }

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    showSection('home');
    initMOG();
    await refreshData();
}

// === РАБОТА С БИНОМ ===
async function fetchData() {
    try {
        console.log("🌐 Запрос к JSONBIN...");
        const res = await fetch(GET_URL, {
            headers: { 'X-Access-Key': API_KEY }
        });
        if (!res.ok) {
            console.warn('⚠️ Ошибка при чтении бина:', res.status);
            return { users: [] };
        }
        const data = await res.json();
        console.log("📦 Данные из бина:", data);
        if (!data.record) {
            const defaultData = { users: [] };
            await updateBin(defaultData);
            return defaultData;
        }
        if (!data.record.users) data.record.users = [];
        return data.record;
    } catch (e) {
        console.error('❌ Ошибка сети/API:', e);
        return { users: [] };
    }
}

async function updateBin(newData) {
    try {
        console.log("💾 Сохраняем в JSONBIN...");
        const res = await fetch(PUT_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(newData)
        });
        console.log("✅ Сохранение завершено, статус:", res.status);
        return res.ok;
    } catch (e) {
        console.error('Ошибка updateBin:', e);
        return false;
    }
}

async function refreshData() {
    const data = await fetchData();
    allUsers = data.users || [];
    console.log("👤 Текущие пользователи:", allUsers);
    if (currentUser && isAdmin(currentUser.role)) {
        renderAdminPanel();
    }
}

// === РОЛИ ===
function isAdmin(role) { return role === 'admin' || role === 'superadmin'; }
function isSuperAdmin(role) { return role === 'superadmin'; }

// === АВТОРИЗАЦИЯ ===
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    console.log("🔑 Попытка входа:", username);
    const data = await fetchData();
    const user = data.users.find(u => u.username === username && u.password === password);

    if (user) {
        console.log("✅ Пользователь найден:", user);
        if (user.muted_until && new Date(user.muted_until) > new Date()) {
            document.getElementById('loginError').textContent = `Вы замучены до ${new Date(user.muted_until).toLocaleString()}`;
            return;
        }
        currentUser = { username: user.username, role: user.role, muted_until: user.muted_until };
        localStorage.setItem('rpUser', JSON.stringify(currentUser));
        showProfile(currentUser);
        closeModal('loginModal');
        document.getElementById('loginForm').reset();
        await refreshData();
    } else {
        console.warn("❌ Пользователь не найден или неверный пароль.");
        document.getElementById('loginError').textContent = 'Неверный логин или пароль.';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regPasswordConfirm').value;

    document.getElementById('registerError').textContent = '';
    if (password !== confirm) {
        document.getElementById('registerError').textContent = 'Пароли не совпадают.';
        return;
    }
    if (username.length < 3) {
        document.getElementById('registerError').textContent = 'Имя должно быть длиннее 3 символов.';
        return;
    }

    console.log("📝 Регистрация нового пользователя:", username);
    const data = await fetchData();
    
    if (data.users.find(u => u.username === username)) {
        document.getElementById('registerError').textContent = 'Пользователь уже существует.';
        return;
    }

    data.users.push({ username, password, role: 'user', muted_until: null });
    const success = await updateBin(data);
    if (success) {
        alert('Регистрация успешна! Теперь войдите.');
        closeModal('registerModal');
        document.getElementById('registerForm').reset();
        await refreshData();
    } else {
        document.getElementById('registerError').textContent = 'Ошибка сервера.';
    }
}

function showProfile(user) {
    document.getElementById('userNameDisplay').textContent = user.username;
    document.getElementById('userRoleDisplay').textContent = `[${user.role}]`;
    document.getElementById('userProfile').classList.remove('hidden');
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('registerBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');

    if (isAdmin(user.role)) {
        document.getElementById('adminPanelLink').style.display = 'inline-block';
    } else {
        document.getElementById('adminPanelLink').style.display = 'none';
    }
}

function showLoginButtons() {
    document.getElementById('userProfile').classList.add('hidden');
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('registerBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('adminPanelLink').style.display = 'none';
}

function logoutUser() {
    localStorage.removeItem('rpUser');
    currentUser = null;
    showLoginButtons();
    location.reload();
}

// === АДМИН ПАНЕЛЬ ===
function renderAdminPanel() {
    const container = document.getElementById('adminUserList');
    if (!allUsers || allUsers.length === 0) {
        container.innerHTML = '<p style="color:#666;">Пользователей пока нет.</p>';
        return;
    }
    container.innerHTML = allUsers.map(u => `
        <div class="admin-user">
            <div class="user-info">
                <span>${u.username}</span>
                <span class="role-badge ${u.role}">${u.role}</span>
                ${u.muted_until ? `<span style="color:#ff5252; font-size:0.7rem;">Мут до ${new Date(u.muted_until).toLocaleString()}</span>` : ''}
            </div>
            <div class="user-actions">
                ${isSuperAdmin(currentUser.role) ? `
                    ${u.role !== 'superadmin' ? `<button onclick="deleteUser('${u.username}')">Удалить</button>` : ''}
                    ${u.role !== 'superadmin' ? `<button onclick="changeRole('${u.username}', 'admin')">Сделать админом</button>` : ''}
                ` : ''}
                ${isAdmin(currentUser.role) ? `
                    ${u.role !== 'superadmin' ? `<button onclick="muteUser('${u.username}', '1h')">Мут час</button>` : ''}
                    ${u.role !== 'superadmin' ? `<button onclick="muteUser('${u.username}', '1d')">Мут день</button>` : ''}
                    ${u.role !== 'superadmin' ? `<button onclick="muteUser('${u.username}', '7d')">Мут неделя</button>` : ''}
                    ${u.role !== 'superadmin' ? `<button onclick="muteUser('${u.username}', 'forever')">Мут навсегда</button>` : ''}
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function loadAdminData() {
    await refreshData();
    if (currentUser && isAdmin(currentUser.role)) renderAdminPanel();
}

function deleteUser(username) {
    if (!confirm(`Удалить пользователя ${username}?`)) return;
    allUsers = allUsers.filter(u => u.username !== username);
    localStorage.setItem('rpUsers', JSON.stringify(allUsers)); // дополнительная защита
    updateBin({ users: allUsers });
    renderAdminPanel();
}

function changeRole(username, newRole) {
    const user = allUsers.find(u => u.username === username);
    if (user) {
        user.role = newRole;
        updateBin({ users: allUsers });
        renderAdminPanel();
    }
}

function muteUser(username, duration) {
    const user = allUsers.find(u => u.username === username);
    if (!user) return;
    let until = null;
    if (duration === 'forever') {
        until = '2099-01-01T00:00:00Z';
    } else {
        const d = new Date();
        if (duration === '1h') d.setHours(d.getHours() + 1);
        else if (duration === '1d') d.setDate(d.getDate() + 1);
        else if (duration === '7d') d.setDate(d.getDate() + 7);
        until = d.toISOString();
    }
    user.muted_until = until;
    updateBin({ users: allUsers });
    renderAdminPanel();
}

// === НАВИГАЦИЯ ===
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
    closeModal('loginModal');
    closeModal('registerModal');
}

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

// === ИНИЦИАЛИЗАЦИЯ MOG ===
function initMOG() {
    const grid = document.getElementById('mogGrid');
    const tooltip = document.getElementById('mogTooltip');

    mogData.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'mog-card';
        card.dataset.mogId = item.id;
        card.innerHTML = `
            <img src="${item.img}" alt="${item.name} logo" onerror="this.style.display='none'">
            <div class="mog-name">${item.name}</div>
            <div class="mog-alias">${item.alias}</div>
        `;
        grid.appendChild(card);

        card.addEventListener('mouseenter', (e) => {
            const data = mogData.find(m => m.id === card.dataset.mogId);
            if (!data) return;
            document.getElementById('tooltipTitle').textContent = `${data.name} ${data.alias}`;
            document.getElementById('tooltipSpec').textContent = data.spec;
            document.getElementById('tooltipDesc').textContent = data.desc;
            tooltip.style.display = 'block';
            const rect = card.getBoundingClientRect();
            let left = rect.right + 20;
            let top = rect.top;
            if (left + 350 > window.innerWidth) left = rect.left - 350;
            if (top + 200 > window.innerHeight) top = window.innerHeight - 200;
            if (top < 10) top = 10;
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
        });

        card.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    });
}