// News data for MEGARE
const newsData = [
    {
        title: "Релиз 1.2 — Новые возможности и исправления",
        date: "15 марта 2026",
        content: [
            "Изменения в версии 1.2:",
            "Два новых танка: Медицинский и Минный танки с уникальными способностями.",
            "Суперспособности для всех танков эпической редкости. Эти суперспособности слабее, чем у легендарных, мифических и хроматических танков, но всё равно добавляют интересные тактические возможности.",
            "Раздел новостей в главном меню для удобного доступа к информации об обновлениях и событиях.",
            "А также исправлены некоторые баги.",
            "Спасибо за вашу поддержку — следите за событиями в игре, скоро будут новые обновления!"
        ]
    },
    {
        title: "Благодарность",
        date: "15 марта 2026",
        content: [
            "Спасибо всем, кто помогал в создании этой игры: тестировал её, делился идеями и поддерживал проект.",
            "Отдельная благодарность моему другу Феде за особую помощь и вклад в разработку игры."
        ]
    }
];

// News modal functionality
(function(){
    const badge = document.getElementById('newsBadge');
    const modal = document.getElementById('newsModal');
    const closeBtn = document.getElementById('newsClose');
    const newsContent = document.getElementById('newsContent');

    function populateNews() {
        if (!newsContent || !newsData) return;
        newsContent.innerHTML = '';
        newsData.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'news-item';
            itemDiv.style.cssText = 'background:rgba(255,255,255,0.05); padding:12px; border-radius:8px; margin-bottom:12px;';
            itemDiv.innerHTML = `
                <p><strong>${item.title}</strong></p>
                <p style="margin:6px 0; font-style:italic; color:#b0c4c9;">Дата: ${item.date}</p>
                ${item.content.map(line => `<p>${line}</p>`).join('')}
            `;
            newsContent.appendChild(itemDiv);
        });
    }

    if (badge && modal) {
        badge.addEventListener('click', function(){
            populateNews();
            modal.style.display = 'flex';
        });
    }
    if (closeBtn) closeBtn.addEventListener('click', function(){ modal.style.display = 'none'; });
    if (modal) modal.addEventListener('click', function(e){ if (e.target === modal) modal.style.display = 'none'; });
})();