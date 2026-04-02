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
                document.querySelectorAll('.gc').forEach((c, i) => {
                    setTimeout(() => c.classList.add('vis'), i * 120); 
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

    const botNav = document.getElementById('botNav');
    const bIcons = ['⬡', '⇄', '◉', '⟿', '⊟', '🌍', '📍', '🎭', '🏢', '🕸️', '🥞', '🛡️', '🌊', '☁️']; 
    chapters.forEach((c, i) => {
        const a = document.createElement('a'); a.className = 'bni'; a.href = '#' + c.id; a.dataset.section = c.id;
        let shortName = chTitles[i].split(' ')[0];
        if(shortName === "Public") shortName = "NAT";
        if(shortName === "The") shortName = chTitles[i].split(' ')[1] || "Net";
        
        a.innerHTML = `<span class="bic">${bIcons[i] || '·'}</span>${shortName}`;
        a.addEventListener('click', e => { e.preventDefault(); scrollToElement(c.id); });
        botNav.appendChild(a);
    });

    const outlineList = document.getElementById('outlineList');
    chapters.forEach((c, i) => {
        const a = document.createElement('a'); a.className = 'oli'; a.href = '#' + c.id; a.dataset.section = c.id;
        const num = (i + 1).toString().padStart(2, '0');
        a.innerHTML = `<span class="oln">${num}</span>${chTitles[i]}`;
        a.addEventListener('click', e => { e.preventDefault(); scrollToElement(c.id); });
        outlineList.appendChild(a);
    });

    // Prev/Next buttons
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
    const sBar = document.getElementById('sProgress');
    const fabTop = document.getElementById('fabTop');
    let scrollTgt = 0, scrollCur = 0;

    function animateScroll() {
        const d = document.documentElement;
        scrollTgt = (d.scrollTop / (d.scrollHeight - d.clientHeight)) * 100;
        scrollCur += (scrollTgt - scrollCur) * 0.08; 
        sBar.style.width = Math.max(0, Math.min(scrollCur, 100)) + '%';
        fabTop.classList.toggle('on', scrollCur > 8);
        requestAnimationFrame(animateScroll);
    }
    animateScroll(); 

    const blobs = document.querySelectorAll('.blob');
    let mouseX = 0, mouseY = 0, blobX = 0, blobY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    function animateBlobs() {
        blobX += (mouseX - blobX) * 0.02;
        blobY += (mouseY - blobY) * 0.02;
        blobs.forEach((b, i) => { 
            const f = (i + 1) * 12; 
            b.style.transform = `translate(${blobX * f}px, ${blobY * f}px)`; 
        });
        requestAnimationFrame(animateBlobs);
    }
    animateBlobs(); 

    /* ==========================================
       6. CHAPTER OBSERVATION
       ========================================== */
    function allNavAs() { return document.querySelectorAll('.ni,.bni,.oli'); }
    function setActive(id) { 
        allNavAs().forEach(a => a.classList.toggle('active', a.dataset.section === id)); 
    }
    
    const secObs = new IntersectionObserver(entries => {
        entries.forEach(e => { 
            if (e.isIntersecting) setActive(e.target.id);
        });
    }, { threshold: 0.15, rootMargin: `-${NAV_H() + 20}px 0px -50% 0px` });
    
    chapters.forEach(s => secObs.observe(s));

    /* ==========================================
       7. DYNAMIC CELEBRATION INJECTION
       ========================================== */
    function injectCelebration() {
        // Inject CSS for the animation so you don't have to touch style.css
        const style = document.createElement('style');
        style.textContent = `
            #nfFinish { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); opacity: 0; pointer-events: none; transition: opacity 0.6s ease; overflow: hidden; }
            #nfFinish.show { opacity: 1; pointer-events: all; }
            
            /* Rings */
            .nf-ring { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 50%; border: 2px solid var(--accent); opacity: 0; }
            #nfFinish.show .nf-ring-1 { animation: nfRing 2s ease-out forwards; }
            #nfFinish.show .nf-ring-2 { animation: nfRing 2.5s ease-out 0.2s forwards; border-color: var(--accent2); }
            #nfFinish.show .nf-ring-3 { animation: nfRing 3s ease-out 0.4s forwards; border-color: var(--accent3); }
            @keyframes nfRing { 0% { width: 0; height: 0; opacity: 1; border-width: 15px; } 100% { width: 150vw; height: 150vw; opacity: 0; border-width: 1px; } }
            
            /* Side Bounces */
            .nf-bounce { position: absolute; font-size: 6rem; opacity: 0; filter: drop-shadow(0 15px 25px rgba(0,0,0,0.3)); }
            .nf-bounce-l { top: 50%; left: -150px; }
            .nf-bounce-r { top: 50%; right: -150px; }
            #nfFinish.show .nf-bounce-l { animation: nfSpringL 1.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.5s forwards; }
            #nfFinish.show .nf-bounce-r { animation: nfSpringR 1.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.7s forwards; }
            @keyframes nfSpringL { 0% { left: -150px; opacity: 0; transform: translateY(-50%) rotate(-45deg) scale(0.5); } 100% { left: 10%; opacity: 1; transform: translateY(-50%) rotate(15deg) scale(1); } }
            @keyframes nfSpringR { 0% { right: -150px; opacity: 0; transform: translateY(-50%) rotate(45deg) scale(0.5); } 100% { right: 10%; opacity: 1; transform: translateY(-50%) rotate(-15deg) scale(1); } }
            
            /* Center Card */
            .nf-card { text-align: center; z-index: 10; transform: scale(0.5) translateY(50px); opacity: 0; background: var(--panel); border: 1px solid var(--glass-border); padding: 50px 40px; border-radius: 28px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); max-width: 500px; width: 90%; }
            #nfFinish.show .nf-card { animation: nfPop 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.9s forwards; }
            @keyframes nfPop { to { transform: scale(1) translateY(0); opacity: 1; } }
            
            .nf-title { font-family: 'DM Serif Display', serif; font-size: 2.8rem; background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 15px; line-height: 1.1; }
            .nf-msg { font-size: 1.05rem; color: var(--text-2); line-height: 1.7; margin-bottom: 35px; }
            
            .nf-btn { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; border: none; padding: 14px 36px; border-radius: 50px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s; box-shadow: 0 8px 25px var(--accent-glow); }
            .nf-btn:hover { transform: scale(1.08) translateY(-3px); box-shadow: 0 15px 35px var(--accent-glow); }
            
            /* Mobile fixes for bounces */
            @media(max-width: 900px) { 
                .nf-bounce { font-size: 4rem; }
                .nf-bounce-l { left: 5%; top: 15%; animation-name: nfSpringLMob !important; } 
                .nf-bounce-r { right: 5%; top: 85%; animation-name: nfSpringRMob !important; } 
                @keyframes nfSpringLMob { 0% { top: -100px; opacity: 0; } 100% { top: 12%; opacity: 1; transform: rotate(15deg); } } 
                @keyframes nfSpringRMob { 0% { top: 120%; opacity: 0; } 100% { top: 88%; opacity: 1; transform: rotate(-15deg); } } 
            }
        `;
        document.head.appendChild(style);

        // Inject HTML
        const overlay = document.createElement('div');
        overlay.id = 'nfFinish';
        overlay.innerHTML = `
            <div class="nf-ring nf-ring-1"></div>
            <div class="nf-ring nf-ring-2"></div>
            <div class="nf-ring nf-ring-3"></div>
            <div class="nf-bounce nf-bounce-l">🚀</div>
            <div class="nf-bounce nf-bounce-r">🏆</div>
            <div class="nf-card">
                <div class="nf-title">Course Complete!</div>
                <div class="nf-msg">Incredible work! You've successfully mastered the foundations of computer networking.<br><br>You now understand how the digital world routes data, connects devices, and stays secure. Keep building, keep learning, and stay curious!</div>
                <button class="nf-btn" id="nfCloseBtn">Awesome!</button>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('nfCloseBtn').addEventListener('click', () => {
            overlay.classList.remove('show');
        });
    }

    // Inject immediately on load
    injectCelebration();

    /* ==========================================
       8. PROGRESS TRACKING (Mark Done)
       ========================================== */
    const DK = 'nf-done7'; 
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

        // TRIGGER THE CELEBRATION
        if (c === TOTAL && !localStorage.getItem('nf-celebrated')) {
            setTimeout(() => {
                document.getElementById('nfFinish').classList.add('show');
                // Save flag so it doesn't pop up every time they refresh the page
                localStorage.setItem('nf-celebrated', 'true');
            }, 800); // Waits for the button "bounce" animation to finish first
        }
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
       9. INTERACTIVE QUIZ ENGINE
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
       10. ADVANCED SEARCH ENGINE
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
            } else if (n.nodeType === 1 && !['SCRIPT', 'STYLE', 'MARK', 'SVG'].includes(n.tagName) && !n.closest('svg')) {
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
