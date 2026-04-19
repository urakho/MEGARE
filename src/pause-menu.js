// ─────────────────────────────────────────────────────────────────────────────
// pause-menu.js  –  In-game pause menu + optional maintenance mode overlay
// ─────────────────────────────────────────────────────────────────────────────

// ── Pause menu ────────────────────────────────────────────────────────────────

(function () {
    // Inject pause-menu HTML into the page
    const pauseHTML = `
<div id="pauseMenu" class="modal-overlay" style="display:none;z-index:200;">
    <div class="modal-box" style="max-width:380px;width:92%;text-align:center;">
        <h2 class="modal-title" style="margin-bottom:22px;">⏸ Пауза</h2>
        <div style="display:flex;flex-direction:column;gap:12px;align-items:center;">
            <button id="pauseResumeBtn" class="btn btn-start" style="width:80%;">▶ Продолжить</button>
            <button id="pauseRestartBtn" class="btn btn-mode" style="width:80%;">🔄 Перезапустить</button>
            <button id="pauseMenuBtn" class="btn btn-secondary" style="width:80%;">🏠 Главное меню</button>
        </div>
    </div>
</div>`;

    document.body.insertAdjacentHTML('beforeend', pauseHTML);

    const pauseMenu  = document.getElementById('pauseMenu');
    const resumeBtn  = document.getElementById('pauseResumeBtn');
    const restartBtn = document.getElementById('pauseRestartBtn');
    const toMenuBtn  = document.getElementById('pauseMenuBtn');

    let paused = false;

    // Show / hide helpers
    function openPause() {
        if (!pauseMenu) return;
        paused = true;
        pauseMenu.style.display = 'flex';
    }

    function closePause() {
        if (!pauseMenu) return;
        paused = false;
        pauseMenu.style.display = 'none';
    }

    // Resume
    if (resumeBtn) resumeBtn.addEventListener('click', closePause);

    // Restart – call startGame if it exists
    if (restartBtn) restartBtn.addEventListener('click', () => {
        closePause();
        if (typeof startGame === 'function') startGame();
    });

    // Return to main menu
    if (toMenuBtn) toMenuBtn.addEventListener('click', () => {
        closePause();
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) mainMenu.style.display = 'flex';
        // Stop game loop if possible
        if (typeof gameRunning !== 'undefined') window.gameRunning = false;
        // Hide canvas overlays
        const canvas = document.getElementById('gameCanvas');
        if (canvas) canvas.style.display = '';
    });

    // Keyboard: Escape toggles pause (only during gameplay)
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const mainMenu = document.getElementById('mainMenu');
        const mainVisible = mainMenu && mainMenu.style.display !== 'none';
        if (mainVisible) return; // Don't intercept Escape on main menu
        if (paused) {
            closePause();
        } else {
            openPause();
        }
    });

    // Expose globally so other scripts can trigger pause
    window.openPauseMenu  = openPause;
    window.closePauseMenu = closePause;
    window.isPaused = () => paused;
})();


// ─────────────────────────────────────────────────────────────────────────────
// MAINTENANCE MODE
// Set MAINTENANCE_MODE to 'on' to show a "technical break" screen instead of
// the normal main menu.  Set to 'off' to run the game as usual.
// ─────────────────────────────────────────────────────────────────────────────

const MAINTENANCE_MODE = 'on'; // <-- change to 'on' to enable maintenance screen

(function () {
    if (MAINTENANCE_MODE !== 'on') return;

    // Check if maintenance bypass is active and not expired
    const bypassTime = localStorage.getItem('maintenanceBypassTime');
    if (bypassTime) {
        const now = Date.now();
        if (now < parseInt(bypassTime)) {
            // Bypass is still active - skip maintenance mode
            // But set up a checker to reload when time expires
            const timeLeft = parseInt(bypassTime) - now;
            setTimeout(() => {
                localStorage.removeItem('maintenanceBypassTime');
                window.location.reload();
            }, timeLeft);
            return;
        } else {
            // Time has expired - remove and show maintenance
            localStorage.removeItem('maintenanceBypassTime');
        }
    }

    let originalMenuContent = null; // Store original menu to restore later

    // Hide everything and show maintenance overlay
    function showMaintenance() {
        // Hide main menu content
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            // Save original content before replacing
            originalMenuContent = mainMenu.innerHTML;
            // Replace inner content with maintenance message
            mainMenu.innerHTML = `
<div style="
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:24px;
    min-height:100vh;
    width:100%;
    padding:40px 20px;
    box-sizing:border-box;
    text-align:center;
">
    <div style="font-size:72px;line-height:1;">🔧</div>
    <h1 style="
        font-size:clamp(28px,5vw,48px);
        font-weight:900;
        color:#f1c40f;
        text-shadow:0 0 20px rgba(241,196,15,0.6),2px 2px 0 #000;
        margin:0;
        letter-spacing:2px;
        text-transform:uppercase;
    ">Технический перерыв</h1>
    <p style="
        font-size:clamp(15px,2.5vw,20px);
        color:#ecf0f1;
        max-width:520px;
        line-height:1.7;
        margin:0;
        text-shadow:1px 1px 0 #000;
    ">
        Игра временно недоступна.<br>
        Мы проводим плановые технические работы.<br>
        Возвращайтесь позже — скоро всё будет готово! 🚀
    </p>
    <div style="
        background:rgba(255,255,255,0.06);
        border:1px solid rgba(255,255,255,0.15);
        border-radius:14px;
        padding:16px 28px;
        font-size:14px;
        color:#aaa;
        max-width:420px;
        line-height:1.6;
    ">
        ⏳ Ориентировочное время восстановления:<br>
        <span style="color:#f1c40f;font-weight:bold;">неизвестно</span>
    </div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:4px;">
        <input id="maintenanceCodeInput" type="text" maxlength="32" placeholder="Код доступа"
            style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);
                   border-radius:10px;padding:10px 14px;color:#fff;font-size:15px;outline:none;
                   width:200px;font-family:monospace;letter-spacing:2px;">
        <button id="maintenanceCodeBtn"
            style="background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;
                   border:none;border-radius:10px;padding:10px 18px;font-size:14px;
                   cursor:pointer;font-weight:bold;">✔</button>
    </div>
    <div id="maintenanceCodeMsg" style="font-size:13px;min-height:18px;color:#e74c3c;"></div>
    <p style="font-size:13px;color:#666;margin:0;">MEGARE &copy; 2026</p>
</div>`;
            mainMenu.style.display = 'flex';
        }

        // Prevent game from starting
        document.addEventListener('click', blockStart, true);
        document.addEventListener('keydown', blockStart, true);
    }

    function blockStart(e) {
        const blocked = ['startBtn','modeSingle','modeTeam','modeDuel',
                         'modeBossFight','modeOneVsAll','modeCancel'];
        if (e.target && blocked.includes(e.target.id)) {
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    }

    // Run after DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { showMaintenance(); bindCodeInput(); });
    } else {
        showMaintenance();
        bindCodeInput();
    }

    function bindCodeInput() {
        // Elements are injected by showMaintenance(), so query after it runs
        const input = document.getElementById('maintenanceCodeInput');
        const btn   = document.getElementById('maintenanceCodeBtn');
        const msg   = document.getElementById('maintenanceCodeMsg');
        if (!input || !btn) return;

        function tryCode() {
            // Secret code is base64-encoded
            const secret = atob('TUVHQURVUi1ZMjAyNg==');
            if (secret && input.value.trim() === secret) {
                // Correct code — set bypass time (10 minutes from now)
                const expiresAt = Date.now() + 600000;
                localStorage.setItem('maintenanceBypassTime', expiresAt.toString());
                
                // Reload page to show the real menu
                window.location.reload();
            } else {
                if (msg) {
                    msg.textContent = '❌ Неверный код';
                    setTimeout(() => { msg.textContent = ''; }, 2000);
                }
                input.value = '';
            }
        }

        btn.addEventListener('click', tryCode);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryCode(); });
    }
})();
