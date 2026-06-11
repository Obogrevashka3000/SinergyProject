// === ДАННЫЕ MOG ===
const mogData = [
    { id: 'nu-7', name: 'Ню-7', alias: '"Удар молота"', spec: 'Боевая единица', desc: 'Специализируется на зачистке и сдерживании аномалий в условиях высокого риска.', img: 'img/Nu-7.png' },
    { id: 'epsilon-11', name: 'Эпсилон-11', alias: '"Девятихвостая лиса"', spec: 'Уничтожение аномалий', desc: 'Элитное подразделение Фонда, обученное специальным протоколам.', img: 'img/Epsilon-11.png' },
    { id: 'omega-1', name: 'Омега-1', alias: '"Шуйца Закона"', spec: 'Задержание', desc: 'Боевая единица для протоколов высшей секретности.', img: 'img/Omega-1.png' },
    { id: 'beta-777', name: 'Бета-777', alias: '"Копье Гекаты"', spec: 'Тауматургия', desc: 'Поиск аномалий, связанных с мистикой.', img: 'img/Beta-777.png' },
    { id: 'beta-7', name: 'Бета-7', alias: '"Шляпные болванчики"', spec: 'Биологические аномалии', desc: 'Специализация: захват биологических аномалий.', img: 'img/Beta-7.png' },
    { id: 'eta-10', name: 'Эта-10', alias: '"Не вижу зла"', spec: 'Меметика', desc: 'Тактическая разведка и наблюдение.', img: 'img/Eta-10.png' },
    { id: 'eta-11', name: 'Эта-11', alias: '"Дикие твари"', spec: 'Агрессивные аномалии', desc: 'Нейтрализация агрессивных форм жизни.', img: 'img/Eta-11.png' },
    { id: 'gamma-5', name: 'Гамма-5', alias: '"Ловчий след"', spec: 'Поисковые операции', desc: 'Поиск сбежавших аномалий.', img: 'img/Gamma-5.png' },
    { id: 'mu-13', name: 'Мю-13', alias: '"Охотники за привидениями"', spec: 'Призраки и духи', desc: 'Работа с призраками и внепространственными явлениями.', img: 'img/Mu-13.png' },
    { id: 'zeta-9', name: 'Дзета-9', alias: '"Кроторьсы"', spec: 'Пространственно-временная', desc: 'Проникновение в зоны с аномальными изменениями пространства.', img: 'img/Zeta-9.png' }
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
    // Загружаем пользователей из localStorage
    allUsers = JSON.parse(localStorage.getItem('rpUsers')) || [];
    
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
    
    if (currentUser && isAdmin(currentUser.role)) {
        renderAdminPanel();
    }
}

// === РАБОТА С LOCALSTORAGE ===
function saveUsers() {
    localStorage.setItem('rpUsers', JSON.stringify(allUsers));
}

// === РОЛИ ===
function isAdmin(role) { return role === 'admin' || role === 'superadmin'; }
function isSuperAdmin(role) { return role === 'superadmin'; }

// === АВТОРИЗАЦИЯ ===
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    const user = allUsers.find(u => u.username === username && u.password === password);

    if (user) {
        if (user.muted_until && new Date(user.muted_until) > new Date()) {
            document.getElementById('loginError').textContent = `Вы замучены до ${new Date(user.muted_until).toLocaleString()}`;
            return;
        }
        currentUser = { username: user.username, role: user.role, muted_until: user.muted_until };
        localStorage.setItem('rpUser', JSON.stringify(currentUser));
        showProfile(currentUser);
        closeModal('loginModal');
        document.getElementById('loginForm').reset();
        if (isAdmin(currentUser.role)) {
            renderAdminPanel();
        }
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

    if (allUsers.find(u => u.username === username)) {
        document.getElementById('registerError').textContent = 'Пользователь уже существует.';
        return;
    }

    allUsers.push({ username, password, role: 'user', muted_until: null });
    saveUsers();
    alert('Регистрация успешна!');
    closeModal('registerModal');
    document.getElementById('registerForm').reset();
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
    if (currentUser && isAdmin(currentUser.role)) renderAdminPanel();
}

function deleteUser(username) {
    if (!confirm(`Удалить пользователя ${username}?`)) return;
    allUsers = allUsers.filter(u => u.username !== username);
    saveUsers();
    renderAdminPanel();
}

function changeRole(username, newRole) {
    const user = allUsers.find(u => u.username === username);
    if (user) {
        user.role = newRole;
        saveUsers();
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
    saveUsers();
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