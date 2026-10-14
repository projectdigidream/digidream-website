// title-bar icons and buttons on every window; the taskbar gets one button per top-level section
const tasks=document.getElementById('tasks');const btnOf={};
document.querySelectorAll('.win').forEach(w=>{
  const tb=w.querySelector(':scope > .tb');tb.prepend(icon(w.dataset.icon||'doc'));
  const top=!!w.dataset.task;
  [['_','Roll up'],['□','Maximise'],['×','Close']].forEach(([g,l])=>{const b=document.createElement('button');b.textContent=g;b.setAttribute('aria-label',l);b.tabIndex=-1;tb.appendChild(b);
    b.onclick=()=>{if(g==='_')w.classList.toggle('rolled');if(g==='□'){w.classList.toggle('max');w.classList.remove('rolled')}if(g==='×'){w.classList.add('gone');w.classList.remove('max');if(btnOf[w.id])btnOf[w.id].classList.add('off')}}});
  tb.addEventListener('dblclick',e=>{if(e.target.tagName!=='BUTTON'){w.classList.toggle('max');w.classList.remove('rolled')}});
  if(top){const t=document.createElement('button');t.appendChild(icon(w.dataset.icon));const s=document.createElement('span');s.className='lbl';s.textContent=w.dataset.task;t.appendChild(s);t.title=w.dataset.task;
    t.onclick=()=>{w.classList.remove('gone','rolled');t.classList.remove('off');if(!w.classList.contains('max'))w.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'})};
    tasks.appendChild(t);btnOf[w.id]=t}
});
document.querySelectorAll('canvas[data-icon]').forEach(c=>{const n=icon(c.dataset.icon);c.replaceWith(n);n.style.cssText='width:32px;height:32px;image-rendering:pixelated;flex:none'});
// highlight the section in view
const io=new IntersectionObserver(es=>es.forEach(e=>{const b=btnOf[e.target.id];if(b&&e.isIntersecting){Object.values(btnOf).forEach(x=>x.classList.remove('on'));b.classList.add('on')}}),{rootMargin:'-40% 0px -55% 0px'});
Object.keys(btnOf).forEach(id=>io.observe(document.getElementById(id)));
btnOf['w-welcome'].classList.add('on');

// start menu
const sm=document.getElementById('smenu'),sb=document.getElementById('start'),sl=document.getElementById('slist');
[['a','Tools','folder','#w-tools'],['a','Downloads','disk','downloads.html'],['a','Tutorials','help','tutorials/'],['a','AI-slopped examples','folder','#w-examples'],['sep'],['a','System Properties','cpu','#w-engine'],['a','Source on GitHub','box','https://github.com/projectdigidream']].forEach(([k,l,ic,h])=>{
  const li=document.createElement('li');if(k==='sep'){li.className='sep';sl.appendChild(li);return}
  const el=document.createElement(k==='a'?'a':'span');if(h){el.href=h;if(h.startsWith('https:')){el.target='_blank';el.rel='noopener'}}el.appendChild(icon(ic));el.append(l);if(h)el.onclick=()=>toggle(false);li.appendChild(el);sl.appendChild(li)});
function toggle(v){sm.hidden=!v;sb.setAttribute('aria-expanded',v)}
sb.onclick=e=>{e.stopPropagation();toggle(sm.hidden)};
document.addEventListener('pointerdown',e=>{if(!sm.hidden&&!sm.contains(e.target)&&!sb.contains(e.target))toggle(false)});
const ck=document.getElementById('clock');function tick(){ck.textContent=new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}tick();setInterval(tick,10000);

// plan view in the 16-colour palette: sectors appear one at a time, then the drawing loops
const ROOMS=[
 {pts:[[2,2],[11,2],[11,9],[2,9]],floor:0,ceil:128,name:'courtyard',fill:'#ffffc0'},
 {pts:[[11,4],[15,4],[15,7],[11,7]],floor:0,ceil:96,name:'hall',fill:'#e0e0e0'},
 {pts:[[15,2],[22,2],[22,8],[18,10],[15,8]],floor:24,ceil:160,name:'tower',fill:'#c0dcc0'},
 {pts:[[5,4],[8,4],[8,7],[5,7]],floor:-32,ceil:128,name:'pool',fill:'#a6caf0'},
 {pts:[[4,9],[7,9],[7,15],[4,15]],floor:-8,ceil:96,name:'stair',fill:'#e0e0e0',steps:5},
 {pts:[[2,15],[13,15],[13,19],[2,19]],floor:-40,ceil:120,name:'cellar',fill:'#ffdcb4'},
 {pts:[[17,10],[22,8],[22,16],[17,16]],floor:48,ceil:192,name:'ledge',fill:'#ffffc0'},
];
const cv=document.getElementById('plan'),g=cv.getContext('2d'),stat=document.getElementById('pstat');
const S=28,OX=64,OY=6,per=700;let t0=performance.now()-per*8;
const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
function draw(now){
  const W=cv.width,H=cv.height;g.fillStyle='#fff';g.fillRect(0,0,W,H);
  g.fillStyle='#c0c0c0';for(let x=OX;x<W;x+=S)for(let y=OY;y<H;y+=S)g.fillRect(x-1,y-1,2,2);
  const el=still?1e9:(now-t0);const n=Math.min(ROOMS.length,Math.floor(el/per)+1);
  for(let i=0;i<n;i++){const r=ROOMS[i];const k=still?1:Math.min(1,(el-i*per)/per);const P=r.pts.map(([x,y])=>[OX+x*S,OY+y*S]);
    g.beginPath();P.forEach(([x,y],j)=>j?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=r.fill;g.globalAlpha=k;g.fill();g.globalAlpha=1;
    if(r.steps){g.strokeStyle='#808080';g.lineWidth=1;const a=P[0],b=P[2];for(let s=1;s<r.steps;s++){const y=Math.round(a[1]+(b[1]-a[1])*s/r.steps)+.5;g.beginPath();g.moveTo(a[0],y);g.lineTo(b[0],y);g.stroke()}}
    const segs=P.length,upto=k*segs;g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.moveTo(...P[0]);
    for(let s=0;s<segs;s++){const a=P[s],b=P[(s+1)%segs],f=Math.max(0,Math.min(1,upto-s));if(f<=0)break;g.lineTo(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f)}g.stroke();
    g.fillStyle='#ff0000';P.forEach(([x,y])=>g.fillRect(x-3,y-3,6,6));
    if(k>.6){const cx=P.reduce((s,p)=>s+p[0],0)/P.length,cy=P.reduce((s,p)=>s+p[1],0)/P.length;g.textAlign='center';
      g.fillStyle='#000080';g.font='bold 18px Tahoma, Verdana, sans-serif';g.fillText(r.name,cx,cy-4);
      g.fillStyle='#000';g.font='15px Tahoma, Verdana, sans-serif';g.fillText('f '+r.floor+' · c '+r.ceil,cx,cy+17)}}
  if(n>=2){g.fillStyle='#008000';g.beginPath();g.moveTo(OX+3*S,OY+3.3*S);g.lineTo(OX+3.6*S,OY+3*S);g.lineTo(OX+3*S,OY+2.7*S);g.closePath();g.fill();
    g.fillStyle='#800080';g.fillRect(OX+9.5*S-7,OY+7.5*S-7,14,14)}
  stat.textContent=n+' sector'+(n>1?'s':'')+' · '+ROOMS.slice(0,n).reduce((s,r)=>s+r.pts.length,0)+' lines';
  if(!still&&el<per*(ROOMS.length+1))requestAnimationFrame(draw);else if(!still)setTimeout(()=>{t0=performance.now();requestAnimationFrame(draw)},4000);
}
requestAnimationFrame(draw);

// the Download box: one tab per tool; each shows that tool's latest release, this device's file first
;(async function downloadBox () {
  const R = window.DNP_RELEASES
  const $ = (id) => document.getElementById(id)
  const tabs = $('dl-tabs')
  const mine = R.detect()
  let data = { releases: [], failed: new Set(R.TOOLS.map((t) => t.id)), why: 'Asking GitHub for the releases…' }
  let current = 'studio'
  const ext = (a) => { a.target = '_blank'; a.rel = 'noopener'; return a }
  function show (toolId) {
    current = toolId
    const tool = R.TOOLS.find((t) => t.id === toolId)
    tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tool === toolId)))
    const n = icon(tool.icon); n.id = 'dl-icon'; n.className = 'big'; $('dl-icon').replaceWith(n)
    $('dl-name').textContent = tool.name
    $('dl-blurb').textContent = tool.blurb
    $('dl-all').href = 'downloads.html#' + tool.id
    const repo = ext(Object.assign(document.createElement('a'), { href: R.repoUrl(tool), textContent: 'github.com/' + R.repoOf(tool) }))
    $('dl-repo').replaceChildren('Source: ', repo)
    $('dl-src').textContent = data.why
    const main = $('dl-main'); const others = $('dl-others')
    others.replaceChildren(); main.hidden = true; main.target = ''
    $('dl-others-label').hidden = true
    const rel = R.latestOf(data.releases, toolId)
    if (!rel) {
      const unread = data.failed.has(toolId)
      $('dl-ver').textContent = unread ? 'Could not read the releases from GitHub just now.' : 'No release yet. It is on its way.'
      $('dl-tag').textContent = '—'
      $('dl-rec-label').replaceChildren(unread ? 'See them on GitHub instead: ' : 'Watch the repository to hear when it lands: ', ext(Object.assign(document.createElement('a'), { href: R.releasesUrl(tool), textContent: 'Releases on GitHub' })))
      return
    }
    $('dl-ver').textContent = `Version ${R.versionOf(rel)} · released ${R.date(rel.published_at)}${rel.prerelease ? ' · pre-release' : ''}`
    $('dl-tag').textContent = rel.tag_name
    const files = R.filesOf(rel).filter((x) => x.platform)
    const label = (x) => R.PLATFORMS[x.platform].label + ' (' + R.PLATFORMS[x.platform].detail + ')'
    const pick = R.pickFor(files, mine)
    if (pick) {
      $('dl-rec-label').textContent = 'Recommended for this device:'
      main.hidden = false; main.textContent = ''
      main.append(icon(x2icon(pick.platform)), 'Download for ' + label(pick) + ' · ' + R.size(pick.a.size))
      main.href = pick.a.browser_download_url
    } else if (files.length) {
      $('dl-rec-label').textContent = `Not built for ${R.PLATFORMS[mine].label} yet. It is available for:`
    } else {
      $('dl-rec-label').replaceChildren('This release has no ready-made builds. ', ext(Object.assign(document.createElement('a'), { href: rel.html_url, textContent: 'See it on GitHub' })))
    }
    $('dl-others-label').hidden = !pick || files.length < 2
    for (const x of files) {
      if (x === pick) continue
      const b = ext(document.createElement('a')); b.className = 'b95'; b.href = x.a.browser_download_url
      const sm = document.createElement('small'); sm.textContent = R.PLATFORMS[x.platform].detail + ' · ' + R.size(x.a.size)
      b.append(icon(x2icon(x.platform)), R.PLATFORMS[x.platform].label + ' ', sm); others.appendChild(b)
    }
  }
  for (const t of R.TOOLS) {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.tool = t.id
    b.append(icon(t.icon), t.name.replace('Digidream ', ''))
    b.addEventListener('click', () => show(t.id)); tabs.appendChild(b)
  }
  window.showDownload = (id) => { show(id); $('w-download').scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  show(current)
  data = await R.load()
  show(current)
})()
document.addEventListener('click', (e) => { const a = e.target.closest('[data-dl]'); if (a && window.showDownload) { e.preventDefault(); window.showDownload(a.dataset.dl) } })
function x2icon (p) { return p === 'android' ? 'phone' : 'monitor' }

// Help Topics: the bundled tutorials' own table of contents (tutorials/assets/nav.js)
;(function helpTopics () {
  const list = document.getElementById('help-list')
  if (!list) return
  const nav = window.DNP_NAV
  if (!Array.isArray(nav)) { document.getElementById('help-status').textContent = 'The tutorials are bundled when the site is built (scripts/build.mjs).'; return }
  let pages = 0
  for (const s of nav) {
    const first = (s.pages || [])[0]
    const li = document.createElement('li')
    const a = document.createElement('a'); a.href = 'tutorials/' + (first ? first.file : '')
    const book = icon('book'); book.className = 'book'
    const t = document.createElement('b'); t.textContent = s.title
    const n = document.createElement('small'); n.textContent = (s.pages || []).length + ' page' + ((s.pages || []).length === 1 ? '' : 's')
    a.append(book, t, n)
    const p = document.createElement('p'); p.textContent = s.blurb || ''
    li.append(a, p); list.appendChild(li); pages += (s.pages || []).length
  }
  document.getElementById('help-status').textContent = `${nav.length} books · ${pages} pages`
})()
