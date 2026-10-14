// Click any [data-zoom] screenshot to see it full size.
(function(){const z=document.getElementById('zoom'),zi=document.getElementById('zoom-img'),zc=document.getElementById('zoom-cap');let back=null;
function show(src,cap){back=document.activeElement;zi.src=src;zi.alt=cap||'';zc.textContent=cap||'';z.hidden=false;document.getElementById('zoom-x').focus()}
function hide(){z.hidden=true;zi.removeAttribute('src');if(back&&back.focus)back.focus()}
window.zoomShot=show;
document.addEventListener('click',e=>{const t=e.target.closest('[data-zoom]');if(t&&!z.contains(t)){e.preventDefault();e.stopPropagation();const im=t.tagName==='IMG'?t:t.querySelector('img');show(t.dataset.zoom||im.currentSrc||im.src,t.dataset.cap||im.alt)}},true);
z.addEventListener('click',hide);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!z.hidden)hide()});})();
