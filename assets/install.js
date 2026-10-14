// How to install, shown as a dialog when a macOS or Android file is downloaded.
//
// Neither kind opens like an ordinary download: the macOS apps are not
// notarized by Apple, and the Android APKs are sideloaded. The click still
// starts the download; the dialog opens over the page beside it. Any link with
// data-platform="macos-*" or "android" gets it, wherever it is on the page.
// The steps say what the release notes say (the release job writes them).
;(function () {
  const STEPS = {
    macos: (file) => ({
      title: 'Installing on a Mac',
      icon: 'monitor',
      lead: 'The download has started. The apps are not notarized by Apple yet, so the first time you open one, macOS says it cannot check it for malicious software. That is expected.',
      steps: [
        file.endsWith('.dmg')
          ? 'Open the .dmg and drag the app into Applications.'
          : 'Open the .zip (Finder unpacks it) and move the app into Applications.',
        'Open the app once. macOS refuses: click Done (not Move to Trash).',
        'Open System Settings → Privacy & Security, scroll down to Security, and click Open Anyway next to the app’s name. Confirm with your password. You only do this once.',
        'On macOS 14 and earlier, right-clicking the app and choosing Open also works.'
      ],
      foot: 'Apple silicon (M1 and later) and Intel Macs have separate downloads. Apple menu → About This Mac says which one yours is.'
    }),
    android: () => ({
      title: 'Installing on Android',
      icon: 'phone',
      lead: 'The download has started. The app is an APK installed straight from this site rather than from Google Play, which Android calls sideloading.',
      steps: [
        'Open the downloaded file, from the browser’s notification or the Downloads folder.',
        'If Android asks, allow your browser (or file manager) to install unknown apps, then go back and tap Install.',
        'If Play Protect warns about an unknown developer, choose More details → Install anyway.'
      ],
      foot: 'The APK is debug-signed. A newer version installs over the old one and keeps your work.'
    })
  }

  const css = `
#dnp-install{position:fixed;inset:0;z-index:100001;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,40,.35)}
#dnp-install .dlg{width:min(520px,100%);max-height:calc(100% - 32px);display:flex;flex-direction:column;padding:3px;background:var(--face,#c3c3c3);border:2px solid;border-color:var(--hi,#fff) var(--dk,#0a0a0a) var(--dk,#0a0a0a) var(--hi,#fff);box-shadow:inset -1px -1px var(--lo,#808080),inset 1px 1px #dfdfdf,4px 4px 0 rgba(0,0,0,.35);color:var(--ink,#0a0a0a);font:15px/1.5 var(--ui,Tahoma,Verdana,sans-serif)}
#dnp-install .bar{display:flex;align-items:center;gap:6px;padding:4px 4px 4px 6px;color:#fff;font-weight:bold;background:linear-gradient(90deg,var(--title-a,#0a246a),var(--title-b,#3a6ea5))}
#dnp-install .bar span{flex:1}
#dnp-install .bar button{width:20px;height:18px;padding:0;font:bold 12px/1 var(--ui,Tahoma,sans-serif);background:var(--face,#c3c3c3);color:var(--ink,#000);border:1px solid;border-color:var(--hi,#fff) var(--dk,#000) var(--dk,#000) var(--hi,#fff);cursor:pointer}
#dnp-install .body{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px 14px;padding:14px 12px 10px;overflow:auto}
#dnp-install .body canvas{width:40px;height:40px;image-rendering:pixelated}
#dnp-install p{margin:0 0 8px}
#dnp-install ol{margin:0 0 10px;padding-left:22px}
#dnp-install li{margin:0 0 6px}
#dnp-install .foot{font-size:13px;color:#333}
#dnp-install .file{font-size:13px;color:#333;overflow-wrap:anywhere}
#dnp-install .ok{display:flex;justify-content:center;padding:4px 0 8px}
#dnp-install .ok button{min-width:96px;min-height:28px;font:inherit;background:var(--face,#c3c3c3);border:2px solid;border-color:var(--hi,#fff) var(--dk,#000) var(--dk,#000) var(--hi,#fff);box-shadow:inset -1px -1px var(--lo,#808080);outline:1px solid var(--dk,#000);cursor:pointer}
#dnp-install .ok button:active{border-color:var(--dk,#000) var(--hi,#fff) var(--hi,#fff) var(--dk,#000)}
#dnp-install button:focus-visible{outline:1px dotted #000;outline-offset:-4px}
`
  function el (tag, props, ...kids) { const e = document.createElement(tag); Object.assign(e, props || {}); for (const k of kids) if (k != null) e.append(k); return e }

  let back = null
  function close () {
    const d = document.getElementById('dnp-install')
    if (d) d.remove()
    if (back && back.focus) back.focus()
  }
  function open (platform, file) {
    const s = (platform.startsWith('macos') ? STEPS.macos : STEPS.android)(file.toLowerCase())
    close()
    back = document.activeElement
    const pic = typeof icon === 'function' ? icon(s.icon) : el('span')
    const ok = el('button', { type: 'button', textContent: 'OK' })
    const dlg = el('div', { className: 'dlg', role: 'dialog', ariaModal: 'true', ariaLabel: s.title },
      el('div', { className: 'bar' }, el('span', { textContent: s.title }), el('button', { type: 'button', textContent: '×', ariaLabel: 'Close', onclick: close })),
      el('div', { className: 'body' }, pic, el('div', {},
        el('p', { textContent: s.lead }),
        el('ol', {}, ...s.steps.map((t) => el('li', { textContent: t }))),
        el('p', { className: 'foot', textContent: s.foot }),
        el('p', { className: 'file', textContent: 'File: ' + file }))),
      el('div', { className: 'ok' }, ok))
    ok.onclick = close
    const shade = el('div', { id: 'dnp-install' }, dlg)
    shade.addEventListener('click', (e) => { if (e.target === shade) close() })
    document.body.appendChild(shade)
    ok.focus()
  }

  document.head.appendChild(el('style', { textContent: css }))
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })
  // after the link's own handling, so the download itself goes ahead untouched
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[data-platform]')
    if (!a || e.defaultPrevented) return
    const p = a.dataset.platform
    if (!p.startsWith('macos') && p !== 'android') return
    const file = decodeURIComponent(a.href.split('/').pop() || '')
    setTimeout(() => open(p, file), 0)
  })
  window.DNP_INSTALL = { open }
})()
