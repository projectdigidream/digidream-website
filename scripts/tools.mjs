// tools.md -> the tools, checked; and the Tools window's cards, as HTML.
//
// tools.md is meant to be edited by hand, so a mistake in it stops the build
// with the line it is on rather than leaving a card half empty.
const FIELDS = {
  id: 'id', card: 'card', window: 'window', icon: 'icon', repository: 'repository',
  'comes with': 'comesWith', tutorial: 'tutorial', screenshot: 'screenshot',
  'screenshot text': 'screenshotText', short: 'short', wide: 'wide'
}
const REQUIRED = ['id', 'window', 'icon', 'tutorial', 'screenshot', 'screenshotText']

export function parseTools (text, file = 'tools.md') {
  const tools = []
  const problems = []
  let tool = null
  let para = []
  const endPara = () => { if (tool && para.length) tool.text.push(para.join(' ')); para = [] }
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim()
    const at = `${file}:${i + 1}`
    if (line.startsWith('## ')) {
      endPara()
      tool = { name: line.slice(3).trim(), text: [], line: i + 1 }
      tools.push(tool)
      return
    }
    if (!tool) return // everything above the first tool is the file's own instructions
    if (!line) { endPara(); return }
    const m = /^-\s+([a-z ]+?)\s*:\s*(.*)$/i.exec(line)
    if (m && !para.length) {
      const key = FIELDS[m[1].toLowerCase()]
      if (!key) problems.push(`${at}: "${m[1]}" is not a field (the fields are: ${Object.keys(FIELDS).join(', ')})`)
      else if (tool[key] !== undefined) problems.push(`${at}: "${m[1]}" is given twice for ${tool.name}`)
      else tool[key] = m[2].trim()
      return
    }
    para.push(line)
  })
  endPara()

  const ids = new Set()
  for (const t of tools) {
    const at = `${file}:${t.line} (${t.name})`
    for (const f of REQUIRED) if (!t[f]) problems.push(`${at}: no "${Object.keys(FIELDS).find((k) => FIELDS[k] === f)}"`)
    if (!t.text.length) problems.push(`${at}: no card text (the lines that are not fields)`)
    if (t.id && !/^[a-z0-9-]+$/.test(t.id)) problems.push(`${at}: the id "${t.id}" may only have lowercase letters, digits and dashes`)
    if (t.id && ids.has(t.id)) problems.push(`${at}: the id "${t.id}" is used twice`)
    ids.add(t.id)
    if (t.repository && t.comesWith) problems.push(`${at}: give "repository" or "comes with", not both`)
    if (!t.repository && !t.comesWith) problems.push(`${at}: give "repository" (it is downloaded) or "comes with" (it is part of another tool)`)
    if (t.repository && !t.short) problems.push(`${at}: no "short" (the Download box shows it)`)
    if (t.wide && !/^(yes|no)$/i.test(t.wide)) problems.push(`${at}: "wide" is yes or no, not "${t.wide}"`)
    t.wide = /^yes$/i.test(t.wide || '')
    t.card = t.card || t.name
  }
  for (const t of tools) {
    const host = tools.find((o) => o.id === t.comesWith && o.repository)
    if (host) t.comesWithName = host.card.toLowerCase()
    if (t.comesWith && !host) problems.push(`${file}:${t.line} (${t.name}): "comes with" names "${t.comesWith}", which is not a downloadable tool's id`)
  }
  if (!tools.length) problems.push(`${file}: no tools (each starts with a "## " heading)`)
  return { tools, problems }
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// one card, in the markup the Tools window has always had
export function cardHtml (t, owner) {
  const buttons = t.repository
    ? `<a class="b95 dlk" href="#w-download" data-dl="${esc(t.id)}">Download</a><a class="b95" href="tutorials/${esc(t.tutorial)}">Tutorial</a><a class="b95" href="https://github.com/${esc(owner)}/${esc(t.repository)}" target="_blank" rel="noopener">Source</a>`
    : `<a class="b95" href="tutorials/${esc(t.tutorial)}">Tutorial</a><a class="b95 dlk" href="#w-download" data-dl="${esc(t.comesWith)}">Comes with the ${esc(t.comesWithName || t.comesWith)}</a>`
  const shot = `<button class="frame in" data-zoom><img src="assets/shots/${esc(t.screenshot)}" alt="${esc(t.screenshotText)}" loading="lazy"></button>`
  const words = `<h3>${esc(t.card)}</h3>${t.text.map((p) => `<p>${esc(p)}</p>`).join('')}<span class="links">${buttons}</span>`
  return `        <article class="win out tool${t.wide ? ' wide' : ''}" data-icon="${esc(t.icon)}"><div class="tb"><span class="t">${esc(t.window)}</span></div>
          <div class="wb">${shot}${t.wide ? `\n          <div>${words}</div>` : words}</div></article>`
}

// what the pages' scripts get: the downloadable tools, in tools.md's order
export function toolsJs (tools) {
  const data = tools.map((t) => ({
    id: t.id, name: t.name, card: t.card, repo: t.repository || null, comesWith: t.comesWith || null,
    icon: t.icon, track: t.tutorial, blurb: t.short || null
  }))
  return '// Written by scripts/build.mjs from tools.md: edit that, not this.\nwindow.DNP_TOOLS = ' + JSON.stringify(data, null, 1) + '\n'
}
