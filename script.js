(function(){

/* ── THEME ── */
const THEME_KEY='nf-theme';
let dark=false;

function applyTheme(d){
  dark=d;
  document.documentElement.setAttribute('data-theme',d?'dark':'light');
  const icon=d?'☀️':'🌙';
  document.getElementById('themeToggle').textContent=icon;
  document.getElementById('themeToggle2').textContent=icon;
  localStorage.setItem(THEME_KEY,d?'dark':'light');
}

const saved=localStorage.getItem(THEME_KEY);
const prefersDark=window.matchMedia('(prefers-color-scheme:dark)').matches;
applyTheme(saved?saved==='dark':prefersDark);

function toggleTheme(){applyTheme(!dark)}
document.getElementById('themeToggle').addEventListener('click',toggleTheme);
document.getElementById('themeToggle2').addEventListener('click',toggleTheme);

window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',e=>{
  if(!localStorage.getItem(THEME_KEY))applyTheme(e.matches);
});

/* ── LOADER ── */
window.addEventListener('load',()=>{
  setTimeout(()=>{
    const l=document.getElementById('loader');
    l.classList.add('out');
    setTimeout(()=>{l.style.display='none';revealCards()},650);
  },1600);
});

function revealCards(){
  const cards=document.querySelectorAll('.glass-card');
  cards.forEach((c,i)=>{
    setTimeout(()=>c.classList.add('visible'),i*120);
  });
}

/* ── SCROLL PROGRESS ── */
const progressBar=document.getElementById('progress');
function updateScrollProgress(){
  const doc=document.documentElement;
  const pct=(doc.scrollTop||document.body.scrollTop)/
    ((doc.scrollHeight||document.body.scrollHeight)-doc.clientHeight)*100;
  progressBar.style.width=Math.min(pct,100)+'%';
  document.getElementById('scrollTop').classList.toggle('visible',pct>15);
}
window.addEventListener('scroll',updateScrollProgress,{passive:true});

/* ── BLOB PARALLAX ── */
const blobs=document.querySelectorAll('.blob');
document.addEventListener('mousemove',e=>{
  const x=(e.clientX/window.innerWidth-0.5)*2;
  const y=(e.clientY/window.innerHeight-0.5)*2;
  blobs.forEach((b,i)=>{
    const f=(i+1)*8;
    b.style.transform=`translate(${x*f}px,${y*f}px)`;
  });
},{passive:true});

/* ── ACTIVE NAV ON SCROLL ── */
const sections=document.querySelectorAll('.chapter');
const navLinks=document.querySelectorAll('.nav-links a');
const bnavItems=document.querySelectorAll('.bnav-item');

function setActive(id){
  navLinks.forEach(a=>{a.classList.toggle('active',a.dataset.section===id)});
  bnavItems.forEach(a=>{a.classList.toggle('active',a.dataset.section===id)});
}

const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)setActive(e.target.id)});
},{threshold:0.3,rootMargin:'-60px 0px -40% 0px'});
sections.forEach(s=>observer.observe(s));

/* ── PROGRESS TRACKING ── */
const DONE_KEY='nf-done';
let done=JSON.parse(localStorage.getItem(DONE_KEY)||'[]');

function updateProgress(){
  const total=5;const count=done.length;
  const pct=count/total*100;
  document.getElementById('progressFill').style.width=pct+'%';
  document.getElementById('progressCount').textContent=count+' / '+total+' done';
}

function initDoneState(){
  done.forEach(idx=>{
    const card=document.querySelector('.glass-card[data-index="'+idx+'"]');
    const btn=document.querySelector('.done-btn[data-section="'+idx+'"]');
    if(card){card.classList.add('done')}
    if(btn){btn.classList.add('marked');btn.querySelector('.done-check').textContent='✓'}
  });
  updateProgress();
}

document.querySelectorAll('.done-btn').forEach(btn=>{
  btn.addEventListener('click',function(){
    const idx=+this.dataset.section;
    const card=document.querySelector('.glass-card[data-index="'+idx+'"]');
    const check=this.querySelector('.done-check');
    if(done.includes(idx)){
      done=done.filter(d=>d!==idx);
      this.classList.remove('marked');check.textContent='○';
      card&&card.classList.remove('done');
    }else{
      done.push(idx);
      this.classList.add('marked');check.textContent='✓';
      card&&card.classList.add('done');
    }
    localStorage.setItem(DONE_KEY,JSON.stringify(done));
    updateProgress();
  });
});

initDoneState();

/* ── SEARCH ── */
const searchInput=document.getElementById('searchInput');
const searchClear=document.getElementById('searchClear');
const noResults=document.getElementById('noResults');

function escapeRx(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}

function stripMarks(el){
  el.querySelectorAll('mark').forEach(m=>{
    m.replaceWith(document.createTextNode(m.textContent));
  });
}

function highlightIn(el,rx){
  el.childNodes.forEach(node=>{
    if(node.nodeType===3){
      const text=node.textContent;
      if(rx.test(text)){
        const frag=document.createDocumentFragment();
        let last=0,m;rx.lastIndex=0;
        while((m=rx.exec(text))!==null){
          frag.appendChild(document.createTextNode(text.slice(last,m.index)));
          const mark=document.createElement('mark');
          mark.textContent=m[0];frag.appendChild(mark);
          last=rx.lastIndex;
        }
        frag.appendChild(document.createTextNode(text.slice(last)));
        node.replaceWith(frag);
      }
    }else if(node.nodeType===1&&!['SCRIPT','STYLE'].includes(node.tagName)){
      highlightIn(node,rx);
    }
  });
}

function doSearch(q){
  searchClear.classList.toggle('visible',q.length>0);
  const cards=document.querySelectorAll('.glass-card');
  if(!q.trim()){
    cards.forEach(c=>{c.style.display='';stripMarks(c);c.classList.remove('visible')});
    setTimeout(()=>cards.forEach(c=>c.classList.add('visible')),10);
    noResults.classList.remove('show');return;
  }
  const rx=new RegExp(escapeRx(q),'gi');
  let any=false;
  let first=null;
  cards.forEach(c=>{
    stripMarks(c);
    const txt=c.textContent;
    if(rx.test(txt)){
      c.style.display='';c.classList.add('visible');
      highlightIn(c,rx);
      if(!first)first=c;any=true;
    }else{
      c.style.display='none';c.classList.remove('visible');
    }
  });
  noResults.classList.toggle('show',!any);
  if(first){
    setTimeout(()=>first.scrollIntoView({behavior:'smooth',block:'start'}),80);
  }
}

let searchTimer;
searchInput.addEventListener('input',function(){
  clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>doSearch(this.value),200);
});
searchClear.addEventListener('click',()=>{
  searchInput.value='';doSearch('');searchInput.focus();
});

/* ── QUIZ ── */
window.toggleQA=function(btn){
  const body=btn.nextElementSibling;
  const open=body.classList.toggle('open');
  btn.style.background=open?'rgba(155,89,224,0.14)':'';
};

window.checkAnswer=function(el,correct){
  const opts=el.closest('.qa-options');
  if(opts.querySelector('.correct,.wrong'))return;
  el.classList.add(correct?'correct':'wrong');
  const result=el.closest('.qa-body').querySelector('.qa-result');
  result.className='qa-result show '+(correct?'correct-msg':'wrong-msg');
  result.textContent=correct
    ?'✓ Correct! Well done.'
    :'✗ Not quite — the highlighted option shows the right answer.';
  if(!correct){
    opts.querySelectorAll('.qa-opt').forEach(o=>{
      if(o.onclick.toString().includes('true'))o.classList.add('correct');
    });
  }
};

})();
