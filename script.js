(function () {
    'use strict';

    /* ==========================================
       1. THEME MANAGEMENT
       ========================================== */
    const TK = 'nf-theme2'; 
    let dark = false;
    
    function applyTheme(d) {
        dark = d; 
        document.documentElement.setAttribute('data-theme', d ? 'dark' : 'light');
        const ic = d ? '☀️' : '🌙';
        document.getElementById('themeBtn').textContent = ic;
        document.getElementById('fabTheme').textContent = ic;
        localStorage.setItem(TK, d ? 'dark' : 'light');
    }
    
    const sv = localStorage.getItem(TK);
    applyTheme(sv ? sv === 'dark' : window.matchMedia('(prefers-color-scheme:dark)').matches);
    
    const toggleTheme = () => applyTheme(!dark);
    document.getElementById('themeBtn').addEventListener('click', toggleTheme);
    document.getElementById('fabTheme').addEventListener('click', toggleTheme);
    
    window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', e => { 
        if (!localStorage.getItem(TK)) applyTheme(e.matches);
    });

    /* ==========================================
       2. PEACEFUL LOADER FADE
       ========================================== */
    window.addEventListener('load', () => {
        setTimeout(() => {
            const l = document.getElementById('ldr'); 
            l.style.transition = 'opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1), transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)';
            l.classList.add('out');
            
            setTimeout(() => { 
                l.style.display = 'none'; 
                // Gentle, slow cascade fade-in for chapters
                document.querySelectorAll('.gc').forEach((c, i) => {
                    setTimeout(() => c.classList.add('vis'), i * 180);
                });
            }, 1200); 
        }, 1200);
    });

    /* ==========================================
       3. GLOBAL UTILS & ANIMATIONS
       ========================================== */
    const chapters = Array.from(document.querySelectorAll('.chapter'));
    const TOTAL = chapters.length;
    const chIds = chapters.map(c => c.id);
    const chTitles = chapters.map(c => c.querySelector('h2').textContent);
    const NAV_H = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;

    function smoothScrollTo(yPos) {
        window.scrollTo({ top: yPos, behavior: 'smooth' });
    }

    function scrollToElement(id) {
        const el = document.getElementById(id); 
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - NAV_H() - 20;
        smoothScrollTo(top);
    }

    // Elegant, soft pulse instead of a hard, fast bounce
    const elegantAnim = [
        { transform: 'scale(1)' },
        { transform: 'scale(0.96)' },
        { transform: 'scale(1.02)' },
        { transform: 'scale(1)' }
    ];
    const elegantTiming = { duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' };

    /* ==========================================
       4. BUILD UI ELEMENTS (Sidebars)
       ========================================== */
    
    // Left Sidebar (Folders)
    const navTree = document.getElementById('navTree');
    const cats = {};
    chapters.forEach(c => { 
        const cat = c.dataset.category || 'General'; 
        if (!cats[cat]) cats[cat] = []; 
        cats[cat].push(c); 
    });
    
    Object.entries(cats).forEach(([cat, items]) => {
        const folder = document.createElement('div'); folder.className = 'nf';
        const btn = document.createElement('button'); btn.className = 'fb open';
        btn.innerHTML = `<span>${cat}</span><span class="fa">›</span>`;
        btn.onclick = () => btn.classList.toggle('open');
        
        const fi = document.createElement('div'); fi.className = 'fi';
        items.forEach(c => {
            const a = document.createElement('a'); a.className = 'ni'; a.href = '#' + c.id; a.dataset.section = c.id;
            a.innerHTML = `<span class="nd"></span>${c.querySelector('h2').textContent}`;
            a.addEventListener('click', e => { e.preventDefault(); scrollToElement(c.id); });
            fi.appendChild(a);
        });
        folder.appendChild(btn); folder.appendChild(fi); navTree.appendChild(folder);
    });

    // Mobile Bottom Nav
    const botNav = document.getElementById('botNav');
    const bIcons = ['◈', '⬡', '◎', '⟿', '⊟', '🏠', '📍', '🌐', '🥞', '🛡️']; 
    chapters.forEach((c, i) => {
        if(i >= 5 && botNav.children.length >= 5) return; 
        const a = document.createElement('a'); a.className = 'bni'; a.href = '#' + c.id; a.dataset.section = c.id;
        a.innerHTML = `<span class="bic">${bIcons[i] || '·'}</span>${chTitles[i].split(' ')[0]}`;
        a.addEventListener('click', e => { e.preventDefault(); scrollToElement(c.id); });
        botNav.appendChild(a);
    });

    // Right Sidebar (Outline)
    const outlineList = document.getElementById('outlineList');
    chapters.forEach((c, i) => {
        const a = document.createElement('a'); a.className = 'oli'; a.href = '#' + c.id; a.dataset.section = c.id;
        const num = (i + 1).toString().padStart(2, '0');
        a.innerHTML = `<span class="oln">${num}</span>${chTitles[i]}`;
        a.addEventListener('click', e => { e.preventDefault(); scrollToElement(c.id); });
        outlineList.appendChild(a);
    });

    // Comprehensive, Beginner-Friendly Glossary
    const glossary = [
        { t: 'Bandwidth', d: 'The maximum capacity of a network connection, like the total number of lanes on a highway.' },
        { t: 'DHCP', d: 'The "Receptionist" service that automatically hands out temporary IP addresses to devices when they join a Wi-Fi network.' },
        { t: 'DNS', d: 'The internet\'s phonebook. It instantly translates human words like "google.com" into computer-readable IP addresses.' },
        { t: 'Firewall', d: 'A security guard that monitors and blocks dangerous hackers or bad traffic from entering your private network.' },
        { t: 'IP Address', d: 'Your device\'s temporary, logical location address on the internet. Used to route data to you globally.' },
        { t: 'Latency (Ping)', d: 'The physical time delay for data to travel from sender to receiver. High latency causes frustrating visual "lag".' },
        { t: 'MAC Address', d: 'The permanent, physical hardware serial number burned into your device at the factory.' },
        { t: 'Node', d: 'Any physical device connected to a network, like a smartphone, laptop, printer, or server.' },
        { t: 'Packet', d: 'A tiny, chopped-up chunk of data wrapped with addressing info, ready to be sent across the internet.' },
        { t: 'Protocol', d: 'A strict set of mathematical rules computers use to format, send, and understand data seamlessly.' },
        { t: 'Router', d: 'The smart post office that directs packets between completely different networks (like your home to the global internet).' },
        { t: 'Switch', d: 'Connects devices within the same local network (LAN), smartly sending data only to the exact correct port.' },
        { t: 'VPN', d: 'A secure, heavily encrypted tunnel over a public network, masking your true physical location and traffic.' }
    ];
    
    const glossList = document.getElementById('glossList');
    glossList.innerHTML = ''; // Clear out the hardcoded HTML ones
    glossary.forEach(({ t, d }) => {
        const div = document.createElement('div'); div.className = 'gi';
        div.innerHTML = `<div class="gt">${t}<span class="gar">›</span></div><div class="gd"><p>${d}</p></div>`;
        glossList.appendChild(div);
    });

    // Build Prev/Next buttons
    document.querySelectorAll('.cnav').forEach(nav => {
        const idx = +nav.dataset.idx;
        const prev = idx > 0
            ? `<a class="cnb prev" data-to="${chIds[idx - 1]}">Prev: ${chTitles[idx - 1]}</a>`
            : `<span class="cnb ghost prev">—</span>`;
        const next = idx < TOTAL - 1
            ? `<a class="cnb next" data-to="${chIds[idx + 1]}">Next: ${chTitles[idx + 1]}</a>`
            : `<a class="cnb" style="border-color:var(--success);color:var(--success);cursor:default;pointer-events:none">🎉 All done!</a>`;
        nav.innerHTML = prev + next;
        nav.querySelectorAll('[data-to]').forEach(a => a.addEventListener('click', e => { 
            e.preventDefault(); 
            scrollToElement(a.dataset.to); 
        }));
    });

    /* ==========================================
       5. ORGANIC LERPING (Scroll + Blobs)
       ========================================== */
    
    // Smooth Scroll Progress
    const sBar = document.getElementById('sProgress');
    const fabTop = document.getElementById('fabTop');
    let scrollTgt = 0, scrollCur = 0;

    function animateScroll() {
        const d = document.documentElement;
        scrollTgt = (d.scrollTop / (d.scrollHeight - d.clientHeight)) * 100;
        
        // Lerp equation for silky smooth catch-up
        scrollCur += (scrollTgt - scrollCur) * 0.08; 
        
        sBar.style.width = Math.max(0, Math.min(scrollCur, 100)) + '%';
        fabTop.classList.toggle('on', scrollCur > 8);
        
        requestAnimationFrame(animateScroll);
    }
    animateScroll(); // Start the loop

    // Floating Parallax Blobs
    const blobs = document.querySelectorAll('.blob');
    let mouseX = 0, mouseY = 0;
    let blobX = 0, blobY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    function animateBlobs() {
        // Very slow lerp (0.02) creates a deeply peaceful, floating delay
        blobX += (mouseX - blobX) * 0.02;
        blobY += (mouseY - blobY) * 0.02;

        blobs.forEach((b, i) => { 
            const f = (i + 1) * 12; 
            b.style.transform = `translate(${blobX * f}px, ${blobY * f}px)`; 
        });
        requestAnimationFrame(animateBlobs);
    }
    animateBlobs(); // Start the loop

    /* ==========================================
       6. CHAPTER OBSERVATION
       ========================================== */
    function allNavAs() { return document.querySelectorAll('.ni,.bni,.oli'); }
    function setActive(id) { 
        allNavAs().forEach(a => a.classList.toggle('active', a.dataset.section === id)); 
    }
    
    const secObs = new IntersectionObserver(entries => {
        entries.forEach(e => { 
            if (e.isIntersecting) {
                setActive(e.target.id);
            } 
        });
    }, { threshold: 0.15, rootMargin: `-${NAV_H() + 20}px 0px -50% 0px` });
    
    chapters.forEach(s => secObs.observe(s));

    /* ==========================================
       7. PROGRESS TRACKING (Mark Done)
       ========================================== */
    const DK = 'nf-done5'; 
    let done = new Set(JSON.parse(localStorage.getItem(DK) || '[]'));
    
    function saveDone() { localStorage.setItem(DK, JSON.stringify([...done])); }
    
    function updateUI() {
        const c = done.size, p = (c / TOTAL) * 100;
        document.getElementById('pFill').style.width = p + '%';
        document.getElementById('pCount').textContent = `${c} / ${TOTAL}`;
        
        chapters.forEach(ch => {
            const idx = +ch.dataset.index;
            ch.classList.toggle('dnc', done.has(idx));
            const nd = document.querySelector(`.ni[data-section="${ch.id}"] .nd`);
            if (nd) nd.classList.toggle('dn', done.has(idx));
        });
    }

    document.querySelectorAll('.db').forEach(btn => {
        btn.addEventListener('click', function () {
            const idx = +this.dataset.idx;
            const dc = this.querySelector('.dc');
            
            this.animate(elegantAnim, elegantTiming);

            if (done.has(idx)) { 
                done.delete(idx); 
                this.classList.remove('mk'); 
                dc.textContent = '○'; 
            } else { 
                done.add(idx); 
                this.classList.add('mk'); 
                dc.textContent = '✓'; 
            }
            saveDone(); 
            updateUI();
        });
    });

    done.forEach(idx => {
        const b = document.querySelector(`.db[data-idx="${idx}"]`);
        if (b) { b.classList.add('mk'); b.querySelector('.dc').textContent = '✓'; }
    });
    updateUI();

    /* ==========================================
       8. INTERACTIVE QUIZ ENGINE
       ========================================== */
    const softShakeAnim = [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(-2px)' },
        { transform: 'translateX(0)' }
    ];

    document.querySelectorAll('.qo-wrap').forEach(wrap => {
        wrap.querySelectorAll('.qo').forEach(opt => {
            opt.addEventListener('click', () => {
                if (wrap.querySelector('.ok,.ng')) return; 
                
                const correct = opt.dataset.c === '1';
                opt.classList.add(correct ? 'ok' : 'ng');
                opt.animate(elegantAnim, elegantTiming);

                const fb = wrap.closest('.qi').querySelector('.qfb');
                fb.className = 'qfb show ' + (correct ? 'qf-ok' : 'qf-ng');
                fb.textContent = correct 
                    ? '✓ Correct! Excellent reasoning.' 
                    : '✗ Not quite — the correct concept is now highlighted for you.';
                
                if (!correct) {
                    wrap.animate(softShakeAnim, { duration: 400, easing: 'ease-in-out' });
                    wrap.querySelector('[data-c="1"]')?.classList.add('ok'); 
                }
            });
        });
    });

    /* ==========================================
       9. ADVANCED SEARCH ENGINE (Beautiful Highlights)
       ========================================== */
    const sInp = document.getElementById('sInput');
    const sCl = document.getElementById('sClear');
    const noRes = document.getElementById('noRes');
    
    function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    
    function stripAndReset(el) { 
        el.querySelectorAll('mark').forEach(m => m.replaceWith(document.createTextNode(m.textContent)));
        el.querySelectorAll('.acb').forEach(a => { a.style.maxHeight = ''; a.style.opacity = ''; });
        el.querySelectorAll('.aci').forEach(a => { a.style.borderColor = ''; });
    }

    function hilite(el, rx, onFirstMatch) {
        el.childNodes.forEach(n => {
            if (n.nodeType === 3) {
                const t = n.textContent; 
                if (!rx.test(t)) return; 
                rx.lastIndex = 0;
                
                const f = document.createDocumentFragment(); 
                let l = 0, m;
                
                while ((m = rx.exec(t)) !== null) { 
                    f.appendChild(document.createTextNode(t.slice(l, m.index))); 
                    const mk = document.createElement('mark'); 
                    mk.textContent = m[0]; 
                    
                    // Apply a soft, modern inline style to override any ugly default yellow CSS
                    mk.style.background = 'rgba(129, 140, 248, 0.2)';
                    mk.style.color = 'inherit';
                    mk.style.borderRadius = '4px';
                    mk.style.padding = '1px 4px';
                    mk.style.boxShadow = '0 0 8px rgba(129, 140, 248, 0.3)';

                    f.appendChild(mk); 
                    
                    if (onFirstMatch) onFirstMatch(mk);
                    l = rx.lastIndex; 
                }
                f.appendChild(document.createTextNode(t.slice(l))); 
                
                const aci = n.parentElement.closest('.aci');
                if (aci) {
                    const acb = aci.querySelector('.acb');
                    if (acb) {
                        acb.style.maxHeight = '1000px'; 
                        acb.style.opacity = '1';
                    }
                    aci.style.borderColor = 'var(--accent)';
                }

                n.replaceWith(f);
            } else if (n.nodeType === 1 && !['SCRIPT', 'STYLE', 'MARK', 'SVG'].includes(n.tagName)) {
                hilite(n, rx, onFirstMatch);
            }
        });
    }

    function doSearch(q) {
        sCl.classList.toggle('on', q.length > 0);
        
        chapters.forEach(c => { 
            c.style.display = ''; 
            stripAndReset(c); 
            c.classList.remove('vis'); 
        });

        if (!q.trim()) {
            setTimeout(() => chapters.forEach(c => c.classList.add('vis')), 10);
            noRes.classList.remove('show'); 
            return;
        }

        const rx = new RegExp(esc(q), 'gi'); 
        let any = false;
        let firstMatchNode = null;

        chapters.forEach(c => {
            if (rx.test(c.textContent)) { 
                c.style.display = ''; 
                c.classList.add('vis'); 
                hilite(c, rx, (node) => {
                    if (!firstMatchNode) firstMatchNode = node;
                });
                any = true; 
            } else { 
                c.style.display = 'none'; 
                c.classList.remove('vis'); 
            }
        });
        
        noRes.classList.toggle('show', !any);
        
        if (firstMatchNode) {
            setTimeout(() => {
                const top = firstMatchNode.getBoundingClientRect().top + window.scrollY - NAV_H() - 100;
                smoothScrollTo(top);
            }, 50);
        }
    }

    let searchTimer; 
    sInp.addEventListener('input', function () { 
        clearTimeout(searchTimer); 
        searchTimer = setTimeout(() => doSearch(this.value), 250); 
    });
    
    sCl.addEventListener('click', () => { 
        sInp.value = ''; 
        doSearch(''); 
        sInp.focus(); 
    });

})();
