// =====================================================================
// Workspace admin: menu tree, search menu, dan tab (iframe per tab).
// Dashboard bukan tab: ia menjadi latar belakang yang tampil saat
// tidak ada tab yang aktif.
// =====================================================================
(function () {
    'use strict';

    const MAX_TABS = 12;

    const config = JSON.parse(document.getElementById('wsConfig').textContent);
    const tabBar = document.getElementById('wsTabs');
    const frames = document.getElementById('wsFrames');
    const tree = document.getElementById('menuTree');
    const search = document.getElementById('menuSearch');
    const emptyInfo = document.getElementById('menuEmpty');
    const sidebar = document.getElementById('sidebar');

    /** @type {{key:string,title:string,icon:string,url:string,used:number,autoTitle?:boolean}[]} */
    let tabs = [];
    let activeKey = null; // null = Dashboard (latar belakang) sedang tampil

    // Iframe Dashboard: selalu ada di belakang, tampil jika tidak ada tab aktif
    const dashboard = document.createElement('iframe');
    dashboard.className = 'ws-frame ws-dashboard';
    dashboard.title = config.home.title;
    dashboard.src = config.home.url;
    dashboard.addEventListener('load', () => onFrameLoad(null, dashboard));
    frames.appendChild(dashboard);

    // ---------------------------------------------------------------
    // Penyimpanan tab (per browser) agar tab tetap ada setelah reload
    // ---------------------------------------------------------------
    function saveState() {
        try {
            const data = { active: activeKey, tabs: tabs.map(({ key, title, icon, url }) => ({ key, title, icon, url })) };
            localStorage.setItem(config.storageKey, JSON.stringify(data));
        } catch { /* storage tidak tersedia: abaikan */ }
    }

    function loadState() {
        try {
            return JSON.parse(localStorage.getItem(config.storageKey) || 'null');
        } catch {
            return null;
        }
    }

    // ---------------------------------------------------------------
    // Tab
    // ---------------------------------------------------------------
    const findTab = key => tabs.find(t => t.key === key);
    const tabEl = key => tabBar.querySelector(`[data-key="${CSS.escape(key)}"]`);
    const frameEl = key => frames.querySelector(`iframe[data-key="${CSS.escape(key)}"]`);

    function createTab(tab) {
        const li = document.createElement('li');
        li.className = 'ws-tab';
        li.dataset.key = tab.key;
        li.setAttribute('role', 'presentation');
        li.innerHTML =
            `<button type="button" class="ws-tab-btn" role="tab" aria-selected="false" title="">` +
            `<i class="bi ${tab.icon || 'bi-file-earmark'}"></i><span class="ws-tab-title"></span></button>` +
            `<button type="button" class="ws-tab-close" aria-label="Tutup tab"><i class="bi bi-x"></i></button>`;
        li.querySelector('.ws-tab-title').textContent = tab.title;
        li.querySelector('.ws-tab-btn').title = tab.title;
        tabBar.appendChild(li);

        const iframe = document.createElement('iframe');
        iframe.className = 'ws-frame';
        iframe.dataset.key = tab.key;
        iframe.title = tab.title;
        iframe.dataset.src = tab.url; // dimuat saat tab pertama kali diaktifkan
        iframe.addEventListener('load', () => onFrameLoad(tab, iframe));
        frames.appendChild(iframe);
    }

    function onFrameLoad(tab, iframe) {
        let doc;
        try { doc = iframe.contentDocument; } catch { return; }
        if (!doc) return;

        // Sesi habis: halaman login termuat di dalam tab -> muat ulang seluruh halaman
        if (iframe.contentWindow.location.pathname.toLowerCase().startsWith('/account/login')) {
            window.location.reload();
            return;
        }

        // Tab yang dibuka lewat URL (tanpa judul menu) memakai <title> halaman
        if (tab?.autoTitle && doc.title) {
            tab.title = doc.title;
            const el = tabEl(tab.key);
            if (el) {
                el.querySelector('.ws-tab-title').textContent = doc.title;
                el.querySelector('.ws-tab-btn').title = doc.title;
            }
            iframe.title = doc.title;
            if (activeKey === tab.key) document.title = `${doc.title} - Admin Panel`;
            saveState();
        }

        // Shortcut Ctrl+K juga bekerja saat fokus ada di dalam tab
        doc.addEventListener('keydown', handleShortcut);
    }

    function openTab(info, activate = true) {
        let tab = findTab(info.key);
        if (!tab) {
            // Batasi jumlah tab: tutup tab yang paling lama tidak dipakai
            if (tabs.length >= MAX_TABS) {
                const oldest = tabs.reduce((a, b) => (a.used < b.used ? a : b));
                closeTab(oldest.key, false);
            }
            tab = { ...info, used: Date.now() };
            tabs.push(tab);
            createTab(tab);
        }
        if (activate) activateTab(tab.key);
    }

    // Tampilkan tab dengan key tertentu, atau Dashboard jika key = null
    function activateTab(key) {
        const tab = key === null ? null : findTab(key);
        if (key !== null && !tab) return;
        activeKey = key;
        if (tab) tab.used = Date.now();

        tabBar.querySelectorAll('.ws-tab').forEach(li => {
            const on = li.dataset.key === key;
            li.classList.toggle('active', on);
            li.querySelector('.ws-tab-btn').setAttribute('aria-selected', on);
        });
        frames.querySelectorAll('.ws-frame[data-key]').forEach(f => f.classList.toggle('active', f.dataset.key === key));
        dashboard.classList.toggle('active', key === null);

        if (tab) {
            const frame = frameEl(key);
            if (frame && !frame.getAttribute('src')) frame.src = frame.dataset.src;
            tabEl(key)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }

        document.title = `${tab ? tab.title : config.home.title} - Admin Panel`;
        highlightMenu(key ?? config.home.key);
        saveState();
    }

    function closeTab(key, activateNeighbor = true) {
        const idx = tabs.findIndex(t => t.key === key);
        if (idx < 0) return;

        tabs.splice(idx, 1);
        tabEl(key)?.remove();
        frameEl(key)?.remove();

        if (activateNeighbor && activeKey === key) {
            // Pindah ke tab sebelahnya; jika tab sudah habis, Dashboard muncul
            const next = tabs[idx] || tabs[idx - 1];
            activateTab(next ? next.key : null);
        } else {
            saveState();
        }
    }

    function closeOthers() {
        tabs.filter(t => t.key !== activeKey).forEach(t => closeTab(t.key, false));
        saveState();
    }

    // Tutup semua tab lalu tampilkan Dashboard dengan data terbaru
    function showDashboard() {
        [...tabs].forEach(t => closeTab(t.key, false));
        activateTab(null);
        reloadDashboard();
    }

    function reloadDashboard() {
        try { dashboard.contentWindow.location.reload(); } catch { dashboard.src = config.home.url; }
    }

    function reloadActive() {
        if (activeKey === null) { reloadDashboard(); return; }
        frameEl(activeKey)?.contentWindow.location.reload();
    }

    // Membuka URL admin sebagai tab. Jika URL cocok dengan menu, pakai data menu itu.
    function openUrl(url, title) {
        const link = [...tree.querySelectorAll('.menu-link')].find(a => a.getAttribute('href') === url);
        if (link) {
            openFromLink(link);
        } else {
            openTab({ key: url, title: title || 'Memuat...', icon: 'bi-file-earmark', url, autoTitle: !title });
        }
    }

    function openFromLink(a) {
        if (a.dataset.key === config.home.key) {
            showDashboard();
            return;
        }
        openTab({ key: a.dataset.key, title: a.dataset.title, icon: a.dataset.icon, url: a.getAttribute('href') });
    }

    // Event tab bar: klik = aktifkan, tombol x / klik tengah = tutup
    tabBar.addEventListener('click', e => {
        const li = e.target.closest('.ws-tab');
        if (!li) return;
        if (e.target.closest('.ws-tab-close')) closeTab(li.dataset.key);
        else activateTab(li.dataset.key);
    });
    tabBar.addEventListener('auxclick', e => {
        const li = e.target.closest('.ws-tab');
        if (li && e.button === 1) { e.preventDefault(); closeTab(li.dataset.key); }
    });
    // Scroll roda mouse -> geser tab ke samping
    tabBar.addEventListener('wheel', e => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { tabBar.scrollLeft += e.deltaY; e.preventDefault(); }
    }, { passive: false });

    document.querySelectorAll('[data-ws-action]').forEach(btn => btn.addEventListener('click', () => {
        ({ 'reload': reloadActive, 'close-others': closeOthers, 'close-all': showDashboard })[btn.dataset.wsAction]();
    }));

    // ---------------------------------------------------------------
    // Menu tree
    // ---------------------------------------------------------------
    function setExpanded(group, expanded) {
        group.setAttribute('aria-expanded', expanded);
    }

    tree.addEventListener('click', e => {
        const toggle = e.target.closest('.menu-toggle');
        if (toggle) {
            const group = toggle.parentElement;
            setExpanded(group, group.getAttribute('aria-expanded') !== 'true');
            return;
        }

        const link = e.target.closest('.menu-link');
        if (link && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
            e.preventDefault();
            openFromLink(link);
            // Di HP, tutup sidebar setelah memilih menu
            bootstrap.Offcanvas.getInstance(sidebar)?.hide();
        }
    });

    function highlightMenu(key) {
        tree.querySelectorAll('.menu-link.active').forEach(a => a.classList.remove('active'));
        const link = tree.querySelector(`.menu-link[data-key="${CSS.escape(key)}"]`);
        if (!link) return;
        link.classList.add('active');
        // Buka semua grup induknya
        for (let g = link.closest('.menu-group'); g; g = g.parentElement.closest('.menu-group')) setExpanded(g, true);
    }

    document.getElementById('menuCollapseAll').addEventListener('click', () => {
        tree.querySelectorAll('.menu-group').forEach(g => setExpanded(g, false));
    });

    // ---------------------------------------------------------------
    // Search menu
    // ---------------------------------------------------------------
    let savedExpansion = null;

    const normalize = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    function setLabel(labelEl, text, query) {
        labelEl.textContent = '';
        const i = query ? normalize(text).indexOf(query) : -1;
        if (i < 0) { labelEl.textContent = text; return; }
        const mark = document.createElement('mark');
        mark.textContent = text.slice(i, i + query.length);
        labelEl.append(text.slice(0, i), mark, text.slice(i + query.length));
    }

    // Filter rekursif. Jika nama grup cocok, seluruh isinya ikut tampil.
    function filterList(ul, query, parentMatched) {
        let anyVisible = false;
        for (const li of ul.children) {
            const label = li.querySelector(':scope > .menu-link .menu-label, :scope > .menu-toggle .menu-label');
            const text = label.dataset.text ?? (label.dataset.text = label.textContent);
            const selfMatch = !query || normalize(text).includes(query);
            setLabel(label, text, query && selfMatch ? query : '');

            let visible;
            if (li.classList.contains('menu-group')) {
                const childVisible = filterList(li.querySelector(':scope > .menu-list'), query, parentMatched || selfMatch);
                visible = selfMatch || childVisible || parentMatched;
                if (query) setExpanded(li, childVisible);
            } else {
                visible = selfMatch || parentMatched;
            }

            li.hidden = !visible;
            anyVisible ||= visible;
        }
        return anyVisible;
    }

    function runSearch() {
        const query = normalize(search.value.trim());

        // Simpan kondisi grup sebelum mencari, pulihkan setelah search dikosongkan
        if (query && !savedExpansion) {
            savedExpansion = [...tree.querySelectorAll('.menu-group')].map(g => [g, g.getAttribute('aria-expanded')]);
        }

        const rootList = tree.querySelector(':scope > .menu-list');
        const found = filterList(rootList, query, false);
        emptyInfo.hidden = found;

        if (!query && savedExpansion) {
            savedExpansion.forEach(([g, v]) => g.setAttribute('aria-expanded', v));
            savedExpansion = null;
            highlightMenu(activeKey ?? config.home.key);
        }
    }

    const visibleLinks = () => [...tree.querySelectorAll('.menu-link')].filter(a => a.offsetParent !== null);

    search.addEventListener('input', runSearch);
    search.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const first = visibleLinks()[0];
            if (first) { clearSearch(); openFromLink(first); bootstrap.Offcanvas.getInstance(sidebar)?.hide(); }
        } else if (e.key === 'Escape') {
            clearSearch();
            search.blur();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            visibleLinks()[0]?.focus();
        }
    });

    function clearSearch() {
        search.value = '';
        runSearch();
    }

    // Navigasi panah atas/bawah di antara hasil menu
    tree.addEventListener('keydown', e => {
        if (!e.target.classList.contains('menu-link') || !['ArrowDown', 'ArrowUp'].includes(e.key)) return;
        e.preventDefault();
        const links = visibleLinks();
        const i = links.indexOf(e.target) + (e.key === 'ArrowDown' ? 1 : -1);
        if (i < 0) search.focus();
        else links[Math.min(i, links.length - 1)].focus();
    });

    // Ctrl+K atau "/" -> fokus ke search menu
    function handleShortcut(e) {
        const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' || (e.key === '/' && !typing)) {
            e.preventDefault();
            if (window.matchMedia('(max-width: 991.98px)').matches) bootstrap.Offcanvas.getOrCreateInstance(sidebar).show();
            search.focus();
            search.select();
        }
    }
    document.addEventListener('keydown', handleShortcut);

    // ---------------------------------------------------------------
    // Inisialisasi
    // ---------------------------------------------------------------
    // Baca dulu tab tersimpan SEBELUM membuka tab apa pun (openTab ikut menyimpan state)
    const saved = loadState();

    saved?.tabs?.forEach(t => openTab(t, false)); // iframe baru dimuat saat tab dibuka
    if (config.openUrl === config.home.url) activateTab(null); // buka Dashboard tanpa menutup tab
    else if (config.openUrl) openUrl(config.openUrl);
    else if (saved?.active && findTab(saved.active)) activateTab(saved.active);
    else activateTab(null);

    // API untuk halaman di dalam tab (lihat _EmbedLayout)
    window.AdminWorkspace = { openUrl, closeTab, activateTab, showDashboard };
})();
