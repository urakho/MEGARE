// Keep currency artwork in prices and rewards while leaving other emoji intact.
(function () {
    const currencies = {
        '💰': ['coin', 'монеты'],
        '🪙': ['coin', 'монеты'],
        '💎': ['gem', 'кристаллы'],
        '🔧': ['part', 'детали'],
        '🏆': ['trophy', 'трофеи'],
    };
    const pattern = /💰|🪙|💎|🔧|🏆/gu;
    const skip = 'script, style, textarea, option, [data-keep-emoji], .profile-avatar-opt, #profileEditAvatarPreview, #activeProfileName';

    function isAmount(value, match) {
        const before = value.slice(0, match.index).trimEnd();
        const after = value.slice(match.index + match[0].length).trimStart();
        return /\d[\d\s.,/]*$/.test(before) ||
            /^\d/.test(after) ||
            /^Купить за\s*\d/.test(after);
    }

    function upgradeText(node) {
        const value = node.nodeValue;
        const parent = node.parentElement;
        if (!value || !parent || parent.closest(skip)) return;
        const matches = [...value.matchAll(pattern)].filter(match => isAmount(value, match));
        if (!matches.length) return;

        const fragment = document.createDocumentFragment();
        let start = 0;
        for (const match of matches) {
            if (match.index > start) {
                fragment.appendChild(document.createTextNode(value.slice(start, match.index)));
            }
            const [kind, label] = currencies[match[0]];
            const icon = document.createElement('span');
            icon.className = `currency-icon currency-icon--${kind}`;
            icon.setAttribute('role', 'img');
            icon.setAttribute('aria-label', label);
            fragment.appendChild(icon);
            start = match.index + match[0].length;
        }
        if (start < value.length) {
            fragment.appendChild(document.createTextNode(value.slice(start)));
        }
        node.replaceWith(fragment);
    }

    function upgrade(root) {
        if (root.nodeType === Node.TEXT_NODE) {
            upgradeText(root);
            return;
        }
        if (root.nodeType !== Node.ELEMENT_NODE || root.matches(skip) || root.closest('[data-keep-emoji]')) return;
        if (!/[💰🪙💎🔧🏆]/u.test(root.textContent || '')) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        for (const node of nodes) upgradeText(node);
    }

    upgrade(document.body);
    if (typeof MutationObserver === 'function') {
        new MutationObserver(records => {
            for (const record of records) {
                for (const node of record.addedNodes) upgrade(node);
            }
        }).observe(document.body, { childList: true, subtree: true });
    }
})();
