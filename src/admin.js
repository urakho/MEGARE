// ─────────────────────────────────────────────────────────────────────────────
// admin.js — Developer console
//
// TOGGLE: change ADMIN_ENABLED below.
//   'on'  → console works immediately, button/shortcut are available in-game
//   'off' → console is fully hidden; button/shortcut do nothing
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_ENABLED = 'on'; // ← set to 'off' to completely hide the console

// If admin is disabled, expose a no-op and hide all entry points
if (ADMIN_ENABLED !== 'on') {
    window.processDevCommand = function() {};
    window.devCommandsUnlocked = false;

    // Hide command button, settings command button, and the modal immediately
    // (DOMContentLoaded has already fired by the time scripts at end of body run)
    const _hideEl = document.getElementById('cmdBtn');
    if (_hideEl) _hideEl.style.setProperty('display', 'none', 'important');
    const _hideEl3 = document.getElementById('commandModal');
    if (_hideEl3) _hideEl3.style.setProperty('display', 'none', 'important');
} else {
    // ── Admin is ENABLED — show the command button (hidden by default in HTML) ──
    const _showCmdBtn = document.getElementById('settingsCommandBtn');
    if (_showCmdBtn) _showCmdBtn.style.removeProperty('display');

    let devCommandsUnlocked = true;
    window.devCommandsUnlocked = true;

    function processDevCommand(rawCommand) {
        const command = rawCommand.trim();
        if (!command) return;
        const lc = command.toLowerCase();

        // /MEG on — wipes all profiles
        if (lc === '/meg' || lc.startsWith('/meg ')) {
            const cmdParts = command.split(/\s+/);
            const arg = (cmdParts[1] || '').toLowerCase();
            if (arg === 'on') {
                const overlay = document.createElement('div');
                overlay.className = 'modal-overlay';
                overlay.id = '_megWipeOverlay';
                overlay.style.cssText = 'display:flex; z-index:99999;';
                overlay.innerHTML = `
                    <div class="modal-box" style="background:#0d0000;border:2px solid #e74c3c;max-width:min(32rem,95vw);text-align:center;">
                        <div style="font-size:2.5rem;margin-bottom:1rem;">⛔</div>
                        <h2 class="modal-title" style="color:#e74c3c;font-size:1.3rem;letter-spacing:0.1rem;">
                            Обнаружено использование читов
                        </h2>
                        <p style="color:#ddd;font-size:0.9rem;line-height:1.7;margin:0 0 0.75rem 0;">
                            Использование читов разрушает <strong style="color:#e74c3c;">честную игру</strong>
                            и опыт других игроков. Это нечестно по отношению к тем, кто играет честно.
                        </p>
                        <p style="color:#aaa;font-size:0.82rem;line-height:1.6;margin:0 0 1.5rem 0;
                            border:1px solid rgba(231,76,60,0.25);border-radius:0.5rem;
                            padding:0.75rem 1rem;background:rgba(231,76,60,0.07);">
                            Будет сброшено <strong style="color:#e74c3c;">всё</strong>:<br>
                            💰 Монеты, гемы, запчасти, трофеи<br>
                            🚫 Все разблокированные танки (включая лимитированные)<br>
                            ⚙️ Все улучшения и достижения<br>
                            Останется только стандартный танк.
                        </p>
                        <button id="_megWipeBtn" class="btn btn-primary" style="width:100%;background:#e74c3c;border-color:#e74c3c;">
                            Принять последствия
                        </button>
                    </div>
                `;
                document.body.appendChild(overlay);
                overlay.querySelector('#_megWipeBtn').addEventListener('click', () => {
                    window._isProfileSwitching = true;
                    if (typeof coins !== 'undefined') coins = 0;
                    if (typeof gems !== 'undefined') gems = 0;
                    if (typeof parts !== 'undefined') parts = 0;
                    if (typeof trophies !== 'undefined') trophies = 0;
                    if (typeof unlockedTanks !== 'undefined') unlockedTanks = ['normal'];
                    if (typeof tankUpgrades !== 'undefined') tankUpgrades = {};
                    if (typeof claimedRewards !== 'undefined') claimedRewards = [];
                    const blank = { tankCoins:'0', tankGems:'0', tankParts:'0', tankTrophies:'0',
                        tankClaimedRewards:'[]', tankUnlockedTanks:'["normal"]',
                        tankUpgrades:'{}', tankTrophiesData:'{}',
                        tankSelected:'normal', achievementData:'{}', tankDevUnlocked:'false',
                        tankAvatarUnlocks:'[]', tankPromoUsed:'[]', tankSelectedAvatars:'{}' };
                    const freshProfiles = [{ name: 'Игрок 1', avatar: '🎮', createdAt: Date.now(), data: blank }];
                    try { localStorage.clear(); } catch (e) {}
                    try { localStorage.setItem('megare_profiles', JSON.stringify(freshProfiles)); } catch (e) {}
                    try { localStorage.setItem('megare_activeProfile', '0'); } catch (e) {}
                    const KEYS = ['tankCoins','tankGems','tankParts','tankTrophies','tankClaimedRewards',
                        'tankUnlockedTanks','tankUpgrades','tankTrophiesData','tankSelected',
                        'achievementData','tankDevUnlocked','tankAvatarUnlocks','tankPromoUsed','tankSelectedAvatars'];
                    for (const k of KEYS) { if (blank[k] !== undefined) { try { localStorage.setItem(k, blank[k]); } catch(e) {} } }
                    window.location.replace(window.location.href.split('?')[0] + '?_p=' + Date.now());
                });
            } else {
                console.log('Invalid command.');
            }
            return;
        }

        // God mode
        if (lc.startsWith('/god')) {
            const parts2 = command.split(/\s+/);
            const arg = (parts2[1] || '').toLowerCase();
            if (arg === 'on') {
                godMode = true;
                if (typeof tank !== 'undefined' && tank) { tank.hp = 100000; tank.maxHp = 100000; }
                console.log('✓ God mode ENABLED');
                if (typeof showNotification === 'function') showNotification('👑 God mode ON', '#f1c40f');
            } else if (arg === 'off') {
                godMode = false;
                if (typeof tank !== 'undefined' && tank && typeof setTankHP === 'function') setTankHP(tankType);
                console.log('✓ God mode DISABLED');
                if (typeof showNotification === 'function') showNotification('God mode OFF', '#888');
            } else { console.log('Usage: /god on|off'); }
            return;
        }

        if (command.startsWith('/cash')) {
            const p = command.substring(5).trim().split(/\s+/);
            let op = '+', valStr = p[0];
            if (['+','-','='].includes(p[0])) { op = p[0]; valStr = p[1]; }
            const amount = parseInt(valStr);
            if (!isNaN(amount) && amount >= 0) {
                if (op === '+') coins += amount; else if (op === '-') coins = Math.max(0, coins - amount); else coins = amount;
                updateCoinDisplay(); saveProgress(); console.log(`Coins: ${coins}`);
            }
        } else if (command.startsWith('/crystal')) {
            const p = command.substring(8).trim().split(/\s+/);
            let op = '+', valStr = p[0];
            if (['+','-','='].includes(p[0])) { op = p[0]; valStr = p[1]; }
            const amount = parseInt(valStr);
            if (!isNaN(amount) && amount >= 0) {
                if (op === '+') gems += amount; else if (op === '-') gems = Math.max(0, gems - amount); else gems = amount;
                updateCoinDisplay(); saveProgress(); console.log(`Gems: ${gems}`);
            }
        } else if (command.startsWith('/scrap')) {
            const p = command.substring(6).trim().split(/\s+/);
            let op = '+', valStr = p[0];
            if (['+','-','='].includes(p[0])) { op = p[0]; valStr = p[1]; }
            const amount = parseInt(valStr);
            if (!isNaN(amount) && amount >= 0) {
                if (op === '+') parts += amount; else if (op === '-') parts = Math.max(0, parts - amount); else parts = amount;
                localStorage.setItem('tankParts', parts); updateCoinDisplay(); saveProgress(); console.log(`Parts: ${parts}`);
            }
        } else if (command.startsWith('/trophy')) {
            const trophyParts = command.substring(7).trim().split(/\s+/).filter(Boolean);
            let op = '=', valStr = trophyParts[0], idx = 0;
            if (['+','-','='].includes(trophyParts[0])) { op = trophyParts[0]; valStr = trophyParts[1]; idx = 1; }
            const perTank = (trophyParts[idx + 1] || '').toLowerCase() === 't';
            const amount = parseInt(valStr);
            if (!isNaN(amount) && amount >= 0) {
                if (perTank) {
                    let data = {};
                    try { data = JSON.parse(localStorage.getItem('tankTrophiesData')) || {}; } catch (e) { data = {}; }
                    const allTypes = window.tankDescriptions ? Object.keys(window.tankDescriptions) : [];
                    if (!allTypes.length) { if (typeof showNotification === 'function') showNotification('⚠️ Список танков недоступен', '#e74c3c'); return; }
                    allTypes.forEach(t => { const c = data[t]||0; data[t] = op==='+'?c+amount:op==='-'?Math.max(0,c-amount):amount; });
                    localStorage.setItem('tankTrophiesData', JSON.stringify(data));
                    console.log(`Per-tank trophies (${op}${amount}) x${allTypes.length}`);
                    if (typeof showNotification === 'function') showNotification(`🏆 Каждому танку: ${op==='='?'':op}${amount} (${allTypes.length} танков)`, '#f1c40f');
                    if (typeof drawCharacterPreviews === 'function') drawCharacterPreviews();
                } else {
                    if (op==='+') trophies+=amount; else if (op==='-') trophies=Math.max(0,trophies-amount); else { trophies=amount; claimedRewards=[]; }
                    updateCoinDisplay(); saveProgress(); console.log(`Trophies: ${trophies}`);
                    if (typeof trophyRoadModal!=='undefined' && trophyRoadModal && trophyRoadModal.style.display==='flex') if (typeof generateTrophyRoad==='function') generateTrophyRoad();
                }
            }
        } else if (command === '/clear t') {
            unlockedTanks = ['normal']; saveProgress();
            if (typeof window.setSelectedTank === 'function') window.setSelectedTank('normal');
            if (typeof drawCharacterPreviews==='function' && typeof characterModal!=='undefined' && characterModal && characterModal.style.display==='flex') drawCharacterPreviews();
            console.log('All tanks except normal locked.');
        } else if (command === '/clear en') {
            tankUpgrades = {};
            if (typeof saveTankUpgrades==='function') saveTankUpgrades();
            if (typeof setTankHP==='function') setTankHP(tankType);
            if (typeof setTankSpeed==='function') setTankSpeed(tankType);
            console.log('All upgrades cleared.');
        } else if (command === '/clear ic') {
            localStorage.setItem('tankAvatarUnlocks', JSON.stringify([]));
            if (typeof achievementData!=='undefined' && achievementData) {
                if (!achievementData.claimed) achievementData.claimed = {};
                Object.keys(achievementData.claimed).forEach(k => {
                    const def = typeof ACHIEVEMENT_DEFS!=='undefined' ? ACHIEVEMENT_DEFS.find(a=>a.id===k) : null;
                    if ((def&&def.group==='icon')||k==='icon_tank'||k.startsWith('easter_')) delete achievementData.claimed[k];
                });
            }
            const ca = typeof PROFILE_AVATAR_TIERS!=='undefined' ? PROFILE_AVATAR_TIERS.common : ['🎮'];
            const sa = {}; const att = typeof unlockedTanks!=='undefined' ? unlockedTanks : ['normal'];
            att.forEach(t => { sa[t] = ca[Math.floor(Math.random()*ca.length)]; });
            localStorage.setItem('tankSelectedAvatars', JSON.stringify(sa));
            if (typeof saveAchievements==='function') saveAchievements();
            if (typeof saveProgress==='function') saveProgress();
            if (typeof window.saveActiveProfile==='function') window.saveActiveProfile();
            if (typeof showNotification==='function') showNotification('🎲 Все иконки очищены', '#27ae60');
            console.log('Icons cleared.');
        } else if (command === '/clear ac') {
            achievementData = {}; localStorage.setItem('achievementData', JSON.stringify(achievementData));
            if (typeof saveAchievements==='function') saveAchievements();
            if (typeof saveProgress==='function') saveProgress();
            if (typeof window.saveActiveProfile==='function') window.saveActiveProfile();
            if (typeof showNotification==='function') showNotification('✓ Все достижения очищены', '#27ae60');
            console.log('All achievements cleared.');
        } else if (command.startsWith('/uncoin')) {
            const a = parseInt(command.substring(7).trim());
            if (!isNaN(a)&&a>0) { coins=-a; updateCoinDisplay(); saveProgress(); console.log(`Coins: ${coins}`); } else console.log('Usage: /uncoin N');
        } else if (command.startsWith('/ungem')) {
            const a = parseInt(command.substring(6).trim());
            if (!isNaN(a)&&a>0) { gems=-a; updateCoinDisplay(); saveProgress(); console.log(`Gems: ${gems}`); } else console.log('Usage: /ungem N');
        } else if (command.startsWith('/unpart')) {
            const a = parseInt(command.substring(7).trim());
            if (!isNaN(a)&&a>0) { parts=-a; localStorage.setItem('tankParts',parts); updateCoinDisplay(); saveProgress(); console.log(`Parts: ${parts}`); } else console.log('Usage: /unpart N');
        } else if (command === '/aid' || command === '/commands') {
            const helpText = [
                '╔══════════════════════════════════════╗',
                '║       ДОСТУПНЫЕ КОМАНДЫ              ║',
                '╠══════════════════════════════════════╣',
                '  /god on|off        Режим бога',
                '  /cash [+/-/=] N    Монеты',
                '  /crystal [+/-/=] N Гемы',
                '  /scrap [+/-/=] N   Запчасти',
                '  /trophy [+/-/=] N  Трофеи',
                '  /trophy = N t      Трофеи всем танкам',
                '  ── Отрицательные ──',
                '  /uncoin N   /ungem N   /unpart N',
                '  ── Сброс ──',
                '  /clear t   Сбросить танки',
                '  /clear en  Сбросить улучшения',
                '  /clear ic  Сбросить иконки',
                '  /clear ac  Сбросить достижения',
                '  /meg on    Полный сброс профиля',
                '  /aid       Этот список',
                '╚══════════════════════════════════════╝',
            ].join('\n');
            console.log(helpText);
            const hc = document.getElementById('helpContent');
            if (hc) { hc.textContent = helpText; const hm = document.getElementById('helpModal'); if (hm) hm.style.display = 'flex'; }
        } else {
            console.log('[Admin] Unknown command:', command);
        }
    }
    window.processDevCommand = processDevCommand;

    // ── Wire up the command modal ─────────────────────────────────────────────
    (function _initCommandModal() {
        const commandModal   = document.getElementById('commandModal');
        const commandInput   = document.getElementById('commandInput');
        const commandExecute = document.getElementById('commandExecute');
        const commandCancel  = document.getElementById('commandCancel');
        const helpClose      = document.getElementById('helpClose');
        const helpModal      = document.getElementById('helpModal');

        if (commandExecute) commandExecute.addEventListener('click', () => {
            if (commandInput) processDevCommand(commandInput.value);
            if (commandInput) commandInput.value = '';
            if (commandModal) commandModal.style.display = 'none';
        });
        if (commandCancel) commandCancel.addEventListener('click', () => {
            if (commandInput) commandInput.value = '';
            if (commandModal) commandModal.style.display = 'none';
        });
        if (commandModal) commandModal.addEventListener('click', (e) => {
            if (e.target === commandModal) { if (commandInput) commandInput.value = ''; commandModal.style.display = 'none'; }
        });
        if (commandInput) commandInput.addEventListener('keydown', (e) => {
            if (e.code === 'Enter') { processDevCommand(commandInput.value); commandInput.value = ''; if (commandModal) commandModal.style.display = 'none'; e.stopImmediatePropagation(); }
            else if (e.code === 'Escape') { commandInput.value = ''; if (commandModal) commandModal.style.display = 'none'; commandInput.blur(); }
        });
        if (helpClose) helpClose.addEventListener('click', () => { if (helpModal) helpModal.style.display = 'none'; });
        if (helpModal) helpModal.addEventListener('click', (e) => { if (e.target === helpModal) helpModal.style.display = 'none'; });
    })();
}