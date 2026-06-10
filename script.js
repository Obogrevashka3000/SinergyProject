// ==========================================
// 1. КОНФИГУРАЦИЯ
// ==========================================
const PROXY_URL = 'https://sinergyproject.vercel.app/api/proxy?path=latest';
const PROXY_WRITE = 'https://sinergyproject.vercel.app/api/proxy?path=';

// ==========================================
// 2. ДАННЫЕ MOG
// ==========================================
const mogData = [
    { id: 'nu-7', name: 'Ню-7', alias: '"Удар молота"', spec: 'Анти-аномалии', desc: 'Специализируется на зачистке и сдерживании аномалий.', img: 'img/Nu-7.png' },
    { id: 'epsilon-11', name: 'Эпсилон-11', alias: '"Девятихвостая лиса"', spec: 'Уничтожение аномалий', desc: 'Элитное подразделение Фонда.', img: 'img/Epsilon-11.png' },
    { id: 'omega-1', name: 'Омега-1', alias: '"Буйца Закона"', spec: 'Сдерживание', desc: 'Боевая единица для протоколов высшей секретности.', img: 'img/Omega-1.png' },
    { id: 'beta-777', name: 'Бета-777', alias: '"Копье Гекаты"', spec: 'Паранормальные расследования', desc: 'Поиск аномалий, связанных с мистикой.', img: 'img/Beta-777.png' },
    { id: 'beta-7', name: 'Бета-7', alias: '"Шляпные болванчики"', spec: 'Биологические аномалии', desc: 'Специализация: захват биологических аномалий.', img: 'img/Beta-7.png' },
    { id: 'eta-10', name: 'Эта-10', alias: '"Не вижу зла"', spec: 'Наблюдение', desc: 'Тактическая разведка и наблюдение.', img: 'img/Eta-10.png' },
    { id: 'eta-11', name: 'Эта-11', alias: '"Дикие твари"', spec: 'Агрессивные аномалии', desc: 'Нейтрализация агрессивных форм жизни.', img: 'img/Eta-11.png' },
    { id: 'gamma-5', name: 'Гамма-5', alias: '"Ловчий след"', spec: 'Поисковые операции', desc: 'Поиск сбежавших аномалий.', img: 'img/Gamma-5.png' },
    { id: 'mu-13', name: 'Мю-13', alias: '"Охотники за привидениями"', spec: 'Парапсихология', desc: 'Работа с призраками и внепространственными явлениями.', img: 'img/Mu-13.png' },
    { id: 'zeta-9', name: 'Дзета-9', alias: '"Кроторьсы"', spec: 'Туннельные операции', desc: 'Проникновение в зоны с аномальными изменениями пространства.', img: 'img/Zeta-9.png' }
];

let currentUser = null;
let allUsers = [];
let tickets = [];

// ==========================================
// 3. БАЗОВЫЕ ФУНКЦИИ (JSONBIN ЧЕРЕЗ ПРОКСИ)
// ==========================================
async function jsonRequest(method, path, body = null) {
    const url = method === 'PUT' 
        ? `${PROXY_WRITE}${path}` 
        : PROXY_URL;
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(url, options);
    return res.json();
}

async function fetchData(path = null) {
    try {
        const data = await jsonRequest('GET', 'latest');
        if (!data.record) {
            const defaultData = { users: [], tickets: [], next_ticket_id: 1 };
            await updateBin(defaultData);
            return path ? null : defaultData;
        }
        if (path) {
            return data.record[path] || null;
        }
        if (!data.record.users) data.record.users = [];
        if (!data.record.tickets) data.record.tickets = [];
        if (!data.record.next_ticket_id) data.record.next_ticket_id = 1;
        return data.record;
    } catch (e) {
        console.error('❌ Ошибка fetchData:', e);
        return path ? null : { users: [], tickets: [], next_ticket_id: 1 };
    }
}

async function updateBin(newData) {
    try {
        await jsonRequest('PUT', '', newData);
        return true;
    } catch (e) {
        console.error('❌ Ошибка при записи:', e);
        return false;
    }
}

async function refreshData() {
    const data = await fetchData();
    if (data) {
        allUsers = data.users || [];
        tickets = data.tickets || [];
        if (!data.next_ticket_id) data.next_ticket_id = 1;
    }
    renderTickets();
    if (currentUser && isAdmin(currentUser.role)) {
        renderAdminPanel();
    }
}

// ==========================================
// 4. РОЛИ
// ==========================================
function isAdmin(role) { return role === 'admin' || role === 'superadmin'; }
function isSuperAdmin(role) { return role === 'superadmin'; }

// ==========================================
// 5. ЗАГРУЗКА И ИНИЦИАЛИЗАЦИЯ
// ==========================================
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

async function initSite() {
    const stored = localStorage.getItem('rpUser');
    if (stored) {
        currentUser = JSON.parse(stored);
        // Проверяем, что пользователь существует
        const users = await fetchData('users');
        const found = users?.find(u => u.username === currentUser.username);
        if (found) {
            currentUser = found;
            localStorage.setItem('rpUser', JSON.stringify(currentUser));
            showProfile(currentUser);
        } else {
            localStorage.removeItem('rpUser');
            showLoginButtons();
        }
    } else {
        showLoginButtons();
    }

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('ticketForm').addEventListener('submit', handleCreateTicket);

    showSection('home');
    initMOG();
    await refreshData();
}

// ==========================================
// 6. АВТОРИЗАЦИЯ
// ==========================================
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    const users = await fetchData('users');
    const user = users?.find(u => u.username === username && u.password === password);

    if (user) {
        if (user.muted_until && new Date(user.muted_until) > new Date()) {
            document.getElementById('loginError').textContent = `Вы замучены до ${new Date(user.muted_until).toLocaleString()}`;
            return;
        }
        currentUser = user;
        localStorage.setItem('rpUser', JSON.stringify(user));
        showProfile(user);
        closeModal('loginModal');
        document.getElementById('loginForm').reset();
        await refreshData();
    } else {
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

    const users = await fetchData('users');
    if (users?.find(u => u.username === username)) {
        document.getElementById('registerError').textContent = 'Пользователь уже существует.';
        return;
    }

    const newUser = { username, password, role: 'user', muted_until: null };
    users.push(newUser);
    const success = await updateBin({ users, tickets: tickets || [], next_ticket_id: 1 });
    if (success) {
        alert('Регистрация успешна!');
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

    document.getElementById('forumGuestMessage').style.display = 'none';
    document.getElementById('forumContent').style.display = 'block';
}

function showLoginButtons() {
    document.getElementById('userProfile').classList.add('hidden');
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('registerBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('adminPanelLink').style.display = 'none';
    document.getElementById('forumGuestMessage').style.display = 'block';
    document.getElementById('forumContent').style.display = 'none';
}

function logoutUser() {
    localStorage.removeItem('rpUser');
    currentUser = null;
    showLoginButtons();
    location.reload();
}

// ==========================================
// 7. ФОРУМ (тикеты)
// ==========================================
function renderTickets() {
    const container = document.getElementById('ticketList');
    if (!tickets || tickets.length === 0) {
        container.innerHTML = '<p style="color:#666; text-align:center;">Тикетов пока нет.</p>';
        return;
    }
    container.innerHTML = tickets.map(t => `
        <div class="ticket-item">
            <div class="ticket-info">
                <div class="ticket-title">${t.title}</div>
                <div class="ticket-author">${t.author} • ${new Date(t.created_at).toLocaleString()}</div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <span class="ticket-status ${t.status}">${t.status}</span>
                <div class="ticket-actions">
                    ${isAdmin(currentUser?.role) ? `
                        <button onclick="closeTicket(${t.id})">Закрыть</button>
                        <button onclick="deleteTicket(${t.id})">Удалить</button>
                    ` : ''}
                    <button onclick="openTicket(${t.id})">Открыть</button>
                </div>
            </div>
        </div>
    `).join('');
}

function openTicket(id) {
    alert('Просмотр тикета (функция в разработке).');
}

async function handleCreateTicket(e) {
    e.preventDefault();
    if (!currentUser) return alert('Вы не авторизованы.');
    const title = document.getElementById('ticketTitle').value.trim();
    const desc = document.getElementById('ticketDesc').value.trim();
    if (!title || !desc) return alert('Заполните все поля.');

    const data = await fetchData();
    const newTicket = {
        id: data.next_ticket_id || 1,
        author: currentUser.username,
        title,
        description: desc,
        status: 'open',
        created_at: new Date().toISOString(),
        comments: []
    };
    data.tickets.push(newTicket);
    data.next_ticket_id = (data.next_ticket_id || 1) + 1;
    const success = await updateBin(data);
    if (success) {
        closeModal('ticketModal');
        document.getElementById('ticketForm').reset();
        await refreshData();
        alert('✅ Тикет создан!');
    } else {
        alert('❌ Ошибка при создании тикета.');
    }
}

async function closeTicket(id) {
    if (!confirm('Закрыть тикет?')) return;
    const data = await fetchData();
    const ticket = data.tickets.find(t => t.id === id);
    if (ticket) ticket.status = 'closed';
    await updateBin(data);
    await refreshData();
}

async function deleteTicket(id) {
    if (!confirm('Удалить тикет?')) return;
    const data = await fetchData();
    data.tickets = data.tickets.filter(t => t.id !== id);
    await updateBin(data);
    await refreshData();
}

// ==========================================
// 8. АДМИН ПАНЕЛЬ
// ==========================================
async function renderAdminPanel() {
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

async function deleteUser(username) {
    if (!confirm(`Удалить пользователя ${username}?`)) return;
    const data = await fetchData();
    data.users = data.users.filter(u => u.username !== username);
    await updateBin(data);
    await refreshData();
}

async function changeRole(username, newRole) {
    const data = await fetchData();
    const user = data.users.find(u => u.username === username);
    if (user) {
        user.role = newRole;
        await updateBin(data);
        await refreshData();
    }
}

async function muteUser(username, duration) {
    const data = await fetchData();
    const user = data.users.find(u => u.username === username);
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
    await updateBin(data);
    await refreshData();
}

// ==========================================
// 9. НАВИГАЦИЯ И МОДАЛЬНЫЕ ОКНА
// ==========================================
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
    closeModal('loginModal');
    closeModal('registerModal');
    closeModal('ticketModal');
}

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

// ==========================================
// 10. ИНИЦИАЛИЗАЦИЯ MOG
// ==========================================
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