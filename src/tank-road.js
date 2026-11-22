// Per-vehicle road. Legacy title IDs and global reward indices remain unchanged.
(() => {
    const titles = {
        normal: ['Первый выстрел','Стальной ветеран','Несокрушимый','Выживший'],
        fire: ['Искра','Огненный дозор','Хозяин пламени','Испепелитель'],
        ice: ['Иней','Снежный страж','Владыка метели','Вечная Мерзлота'],
        electric: ['Искровой разряд','Проводник грозы','Повелитель молний','Грозовой Удар'],
        plasma: ['Сгусток энергии','Плазменный охотник','Ядро реактора','Плазменный Убийца'],
        toxic: ['Едкий след','Химик фронта','Ядовитый шторм','Доктор Яд'],
        egyptian: ['Страж песков','Наследник пирамид','Проклятие фараона','Владыка'],
        mine: ['Минёр','Хранитель ловушек','Заклинатель взрывов','Минное Поле'],
        mirror: ['Блик','Зеркальный страж','Хозяин отражений','Отражение Гнева'],
        time: ['Миг','Страж секунд','Повелитель часов','Хронолог'],
        imitator: ['Подражатель','Мастер облика','Чужое лицо','Мимик II порядка'],
        robot: ['Протокол боя','Командир дронов','Железная логика','Боевой Разум'],
        roman: ['Легионер','Знаменосец Рима','Командир легиона','Центурион'],
        spartan: ['Гоплит','Щит Спарты','Защитник ущелья','Однажды в Фермопильском ущелье...'],
        illuminat: ['Наблюдатель','Тайный знак','Хранитель тайны','Всевидящее Oкo'],
        machinegun: ['Очередь','Пулемётчик','Свинцовый дождь','Шквал'],
        buckshot: ['Дробинка','Ближний бой','Стена картечи','Картечник'],
        waterjet: ['Капля','Страж потока','Девятый вал','Цунами'],
        buratino: ['Ракетчик','Залповый огонь','Огненный смерч','Буря Огня'],
        air: ['Порыв','Лётчик бури','Владыка ветров','Торнадо'],
        kamikaze: ['Доброволец','Последний рывок','Живой снаряд','За Императора!'],
        musical: ['Первая нота','Боевой дирижёр','Громкая симфония','Резонатор'],
        medical: ['Санитар','Полевой доктор','Спаситель отряда','Военный Хирург'],
        pyro: ['Уголёк','Огнемётчик','Танцующий в огне','Пироманьяк'],
        burovoy: ['Землекоп','Проходчик','Гроза подземелий','Бури, Детка! Бури!'],
        mechDiy: ['Сборщик','Железный пилот','Хранитель механизма','Механический Страж'],
        mechShield: ['Энергощит','Страж барьера','Непробиваемый бастион','Энергетическая Стена'],
        mechRocket: ['Ракетный пилот','Меткий пуск','Гроза укреплений','Гранатомётчик'],
        kvant: ['Импульс','Сбой системы','Разлом реальности','Квантовое Разрушение'],
        myasnoy: ['Нечто','Хищник арены','Неведомый ужас','Что это такое?']
    };
    const thresholds = [1000, 2500, 5000, 10000];
    const iconSteps = [750, 1750, 3500, 5000, 10000];
    const key = 'tankRoadProgress';
    function read() {
        try { const data = JSON.parse(localStorage.getItem(key) || '{}'); return data && typeof data === 'object' && !Array.isArray(data) ? data : {}; }
        catch (_) { return {}; }
    }
    function save(data) {
        localStorage.setItem(key, JSON.stringify(data));
        if (typeof window.saveActiveProfile === 'function') window.saveActiveProfile();
    }
    function titleId(type, threshold) { return `tank-title:${type}:${threshold}`; }
    function titleInfo(id) {
        const match = /^tank-title:([a-zA-Z]+):(1000|2500|5000|10000)$/.exec(id || '');
        if (!match || !titles[match[1]]) return null;
        const threshold = Number(match[2]);
        return { tank: match[1], threshold, name: titles[match[1]][thresholds.indexOf(threshold)], color: window.TANK_ATMOSPHERIC_TITLES?.[match[1]]?.color || '#e5c171' };
    }
    function record(type, count) {
        if (!titles[type] || window._isProfileSwitching) return;
        const data = read();
        const entry = data[type] || { best: 0, claimed: [] };
        const best = Math.max(Number(entry.best) || 0, Number(count) || 0);
        const unlocked = _getUnlockedTitles();
        let changed = !data[type] || best !== entry.best;
        entry.best = best;
        if (!Array.isArray(entry.claimed)) entry.claimed = [];
        for (const threshold of thresholds) {
            const id = titleId(type, threshold);
            if (best >= threshold && !unlocked.includes(id)) { unlocked.push(id); changed = true; }
        }
        data[type] = entry;
        if (changed) {
            localStorage.setItem('playerTitleUnlocks', JSON.stringify(unlocked));
            save(data);
        }
    }
    function sync() {
        let trophies = {};
        try { trophies = JSON.parse(localStorage.getItem('tankTrophiesData') || '{}'); } catch (_) {}
        for (const [type, count] of Object.entries(trophies)) record(type, count);
        if (localStorage.getItem(key) === null) save({});
    }
    function avatarMarkup(id, size) {
        const match = /^tank-road:([a-zA-Z]+):(750|1750|3500|5000|10000)$/.exec(id);
        if (!match || !titles[match[1]]) return '';
        return window.vehicleInsignia ? window.vehicleInsignia(match[1], Number(match[2]), size) : '';
    }

    function claim(type, step) {
        record(type, getTankTrophies(type));
        const data = read(), entry = data[type];
        if (!entry || step < 250 || step > 10000 || step % 250 || entry.best < step || entry.claimed.includes(step)) return;
        entry.claimed.push(step);
        if (iconSteps.includes(step)) _unlockAvatar(`tank-road:${type}:${step}`);
        else if (step % 1000 === 0) gems += 20;
        else if (step % 500 === 0) parts += 100;
        else coins += 100;
        localStorage.setItem(key, JSON.stringify(data));
        saveProgress();
        updateCoinDisplay();
        const road = document.getElementById('rankModal');
        const row = road?.querySelector(`[data-step="${step}"]`);
        if (row) {
            const button = row.querySelector('button');
            button.disabled = true;
            button.textContent = 'Получено';
            row.classList.add('is-claimed');
        }
        const items = [];
        if (iconSteps.includes(step)) items.push({ title: 'НОВЫЙ ЗНАЧОК', label: step >= 5000 ? 'Значок мастерства' : 'Значок техники', art: avatarMarkup(`tank-road:${type}:${step}`, 190) });
        else {
            const kind = step % 1000 === 0 ? 'gem' : step % 500 === 0 ? 'part' : 'coin';
            items.push({ title: 'НАГРАДА ПОЛУЧЕНА', label: kind === 'gem' ? '20 гемов' : kind === 'part' ? '100 деталей' : '100 монет', art: `<span class="currency-icon currency-icon--${kind}" style="width:120px;height:120px"></span>` });
        }
        if (thresholds.includes(step)) items.push({ title: 'НОВОЕ ЗВАНИЕ', label: titles[type][thresholds.indexOf(step)], art: '<span class="currency-icon currency-icon--trophy" style="width:120px;height:120px"></span>' });
        showRewards(items);
    }
    function showRewards(items, index = 0, onComplete) {
        if (!items.length || index >= items.length) { if (onComplete) onComplete(); return; }
        const old = document.getElementById('tankRoadReveal');
        if (old) old.remove();
        const overlay = document.createElement('div');
        overlay.id = 'tankRoadReveal';
        overlay.className = 'mastery-reveal';
        if (items[index].leagueColor) {
            overlay.classList.add('trophy-reveal');
            overlay.style.setProperty('--league-color', items[index].leagueColor);
        }
        const displayClass = items[index].background ? ' mastery-reveal-display--background' : '';
        overlay.innerHTML = `<div class="modal-box mastery-reveal-card"><div class="mastery-reveal-topline"><span>MEGARE • НАГРАДА</span><span>${index + 1} / ${items.length}</span></div><p class="mastery-reveal-caption"></p><div class="mastery-reveal-display${displayClass}"><div class="mastery-reveal-art">${items[index].art}</div></div><h2></h2><div class="mastery-reveal-divider"></div><p class="mastery-reveal-hint">НАГРАДА ДОБАВЛЕНА В ПРОФИЛЬ</p><button type="button" class="btn btn-gold">ПРОДОЛЖИТЬ</button></div>`;
        overlay.querySelector('.mastery-reveal-caption').textContent = items[index].title;
        const hint = overlay.querySelector('.mastery-reveal-hint');
        hint.textContent = items[index].hint ?? 'НАГРАДА ДОБАВЛЕНА В ПРОФИЛЬ';
        hint.hidden = !hint.textContent;
        overlay.querySelector('h2').textContent = items[index].label;
        const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey, true); showRewards(items, index + 1, onComplete); };
        const onKey = event => { if (event.key === 'Escape') { event.stopImmediatePropagation(); close(); } };
        overlay.querySelector('button').onclick = close;
        document.addEventListener('keydown', onKey, true);
        document.body.appendChild(overlay);
        overlay.querySelector('button').focus();
    }
    function show(type) {
        if (!titles[type]) return;
        record(type, getTankTrophies(type));
        const entry = read()[type], current = getTankTrophies(type);
        const old = document.getElementById('rankModal');
        if (old) old.remove();
        const modal = document.createElement('div');
        modal.id = 'rankModal'; modal.className = 'tank-road-overlay';
        const name = window.tankDescriptions?.[type]?.name || window.mechDescriptions?.[type]?.name || type;
        const box = document.createElement('div'); box.className = 'modal-box tank-road-box';
        const header = document.createElement('div'); header.className = 'tank-road-header';
        header.innerHTML = `<button class="tank-road-close" aria-label="Закрыть">✕</button><div class="tank-road-kicker">ДОРОГА МАСТЕРСТВА</div><h2 class="modal-title"></h2><p>Трофеи: ${current} · Рекорд: ${entry.best} / 10000</p><div class="tank-road-progress"><span style="width:${Math.min(100, entry.best / 100)}%"></span></div>`;
        header.querySelector('h2').textContent = name;
        header.querySelector('button').onclick = () => modal.remove();
        box.appendChild(header);
        const list = document.createElement('div'); list.className = 'tank-road-list';
        for (let step = 250; step <= 10000; step += 250) {
            const unlocked = entry.best >= step, claimed = entry.claimed.includes(step);
            const isIcon = iconSteps.includes(step), isTitle = thresholds.includes(step);
            const row = document.createElement('div'); row.dataset.step = step; row.className = 'tank-road-row' + (unlocked ? ' is-open' : '') + (isTitle ? ' is-major' : '') + (claimed ? ' is-claimed' : '');
            const label = isIcon ? (step >= 5000 ? 'Значок мастерства' : 'Значок техники') : step % 1000 === 0 ? '20 гемов' : step % 500 === 0 ? '100 деталей' : '100 монет';
            const resource = step % 1000 === 0 ? 'gem' : step % 500 === 0 ? 'part' : 'coin';
            const icon = isIcon ? avatarMarkup(`tank-road:${type}:${step}`, 86) : `<span class="currency-icon currency-icon--${resource}" aria-hidden="true"></span>`;
            const title = isTitle ? `<small>Звание «${titles[type][thresholds.indexOf(step)]}»</small>` : '';
            row.innerHTML = `<div class="tank-road-reward-text"><strong>${step} 🏆</strong></div><div class="tank-road-reward-icon">${icon}</div><div class="tank-road-reward-text"><span>${label}</span>${title}</div><button type="button" class="btn btn-gold" ${!unlocked || claimed ? 'disabled' : ''}>${claimed ? 'Получено' : unlocked ? 'Получить' : 'Закрыто'}</button>`;
            row.querySelector('button').onclick = () => claim(type, step);
            list.appendChild(row);
        }
        box.appendChild(list);
        const footer = document.createElement('div');
        footer.className = 'road-footer tank-road-footer';
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn btn-secondary';
        closeButton.textContent = 'Закрыть';
        closeButton.onclick = () => modal.remove();
        footer.appendChild(closeButton);
        box.appendChild(footer);
        modal.appendChild(box); document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }
    window.getTankRoadTitle = titleInfo;
    window.recordTankRoadProgress = record;
    window.syncTankRoadProgress = sync;
    window.tankRoadAvatarMarkup = avatarMarkup;
    window.showRankModal = show;
    window.showProgressionRewards = (items, onComplete) => showRewards(items, 0, onComplete);
    sync();
})();
