(function () {
  'use strict';
  const S = window.Store;
  const app = document.getElementById('app');
  const titleEl = document.getElementById('screen-title');
  const backBtn = document.getElementById('back-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const sheet = document.getElementById('sheet');
  const sheetTitle = document.getElementById('sheet-title');
  const sheetBody = document.getElementById('sheet-body');

  // ---------- utilitários ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const mondayOf = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  const minutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const hm = (t) => { const [h, m] = t.split(':'); return `${Number(h)}h${m === '00' ? '' : m}`; };
  const diffDays = (dateStr) => Math.round((parse(dateStr) - today()) / 86400000);

  const DOW = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const DOW_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const MON_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  const longDate = (d) => `${DOW[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
  const shortDate = (s) => { const d = parse(s); return `${DOW_SHORT[d.getDay()]}, ${d.getDate()} ${MON_SHORT[d.getMonth()]}`; };
  function relDay(s) {
    const n = diffDays(s);
    if (n === 0) return 'hoje';
    if (n === 1) return 'amanhã';
    if (n === -1) return 'ontem';
    if (n < 0) return `há ${-n} dias`;
    if (n < 7) return `em ${n} dias`;
    return shortDate(s);
  }

  const ICON = {
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    week: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/><path d="M9 5.5v3M14 10.5v3M7 15.5v3" stroke-width="3"/></svg>',
    list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5l1.5 1.5L8 5.5M4 12.5l1.5 1.5L8 11.5M4 18.5l1.5 1.5L8 17.5M11 7h9M11 13h9M11 19h9"/></svg>',
    folder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.6l2 2.2h7.4A2.5 2.5 0 0 1 21 9.7v7.8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/></svg>',
    folderLine: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.6l2 2.2h7.4A2.5 2.5 0 0 1 21 9.7v7.8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  };

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2400);
  }

  // ---------- regras de domínio ----------
  const state = () => S.get();
  const subjects = () => state().categories.filter((c) => c.kind !== 'trabalho');
  const catColor = (id) => (S.category(id) || { color: '#868E96' }).color;
  const workColor = () => (S.category('trabalho') || { color: '#4C6EF5' }).color;

  // Turno de um dia: padrão da semana, com exceção por data quando existir
  function shiftFor(dateStr) {
    const st = state();
    const o = st.shiftOverrides[dateStr];
    const base = st.shiftTemplate[parse(dateStr).getDay()] || null;
    if (o) return o.off ? { off: true, changed: !!base } : { start: o.start, end: o.end, changed: true };
    return base ? { start: base.start, end: base.end, changed: false } : null;
  }
  const itemsOn = (dateStr) => state().items
    .filter((i) => i.date === dateStr)
    .sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));

  // ---------- faixa de horário ----------
  const T0 = 7 * 60, T1 = 24 * 60;
  const pct = (m) => ((Math.min(Math.max(m, T0), T1) - T0) / (T1 - T0)) * 100;

  function ribbon(dateStr, { compact = false, withNow = false } = {}) {
    const sh = shiftFor(dateStr);
    const ticks = [8, 12, 16, 20].map((h) => `<i class="tick" style="left:${pct(h * 60)}%"></i>`).join('');
    let shift = '';
    if (sh && !sh.off) {
      const l = pct(minutes(sh.start)), r = pct(minutes(sh.end));
      shift = `<div class="shift${sh.changed ? ' changed' : ''}" style="left:${l}%;width:${r - l}%;--work:${workColor()}">${hm(sh.start)}–${hm(sh.end)}</div>`;
    }
    const marks = itemsOn(dateStr).filter((i) => i.time && !i.done).map((i) =>
      `<i class="mark ${i.type}" style="left:${pct(minutes(i.time))}%;background:${catColor(i.subjectId)}" title="${esc(i.title)}"></i>`).join('');
    let now = '';
    if (withNow && dateStr === iso(today())) {
      const d = new Date();
      const m = d.getHours() * 60 + d.getMinutes();
      if (m >= T0) now = `<i class="now" style="left:${pct(m)}%"></i>`;
    }
    const label = sh && !sh.off ? `Turno das ${hm(sh.start)} às ${hm(sh.end)}` : 'Sem turno';
    return `<div class="track${compact ? ' compact' : ''}" role="img" aria-label="${label}">${ticks}${shift}${marks}${now}</div>`;
  }
  const scale = () => `<div class="scale" aria-hidden="true">${[8, 12, 16, 20].map((h) => `<span style="left:${pct(h * 60)}%">${h}h</span>`).join('')}</div>`;

  function chip(i) {
    const c = catColor(i.subjectId);
    return `<span class="chip ${i.type}${i.done ? ' done' : ''}" style="--c:${c}"><span class="dot"></span><span class="t">${i.time ? hm(i.time) + ' ' : ''}${esc(i.title)}</span></span>`;
  }

  function itemRow(i, { showSubject = true } = {}) {
    const cat = S.category(i.subjectId);
    const c = cat ? cat.color : '#868E96';
    const n = i.date ? diffDays(i.date) : null;
    const soon = !i.done && n !== null && n <= 1;
    const meta = [];
    meta.push(`<span class="tag" style="--c:${c}">${i.type === 'prova' ? 'Prova' : 'Tarefa'}</span>`);
    if (i.date) meta.push(`<span class="${soon ? 'soon' : ''}">${relDay(i.date)}${i.time ? ' às ' + hm(i.time) : ''}</span>`);
    if (showSubject && cat) meta.push(`<span>${esc(cat.name)}</span>`);
    if (i.type === 'prova' && i.grade) meta.push(`<span>Nota ${esc(i.grade)}</span>`);
    return `<div class="item ${i.type}${i.done ? ' done' : ''}" style="--c:${c}">
      <button type="button" class="check" role="checkbox" aria-checked="${!!i.done}" data-toggle="${i.id}" aria-label="Concluir ${esc(i.title)}"><span>${ICON.check}</span></button>
      <button type="button" class="item-body" data-edit="${i.id}">
        <span class="item-title">${esc(i.title)}</span>
        <span class="item-meta">${meta.join('')}</span>
      </button>
    </div>`;
  }

  // ---------- telas ----------
  const screens = {};

  screens[''] = function home() {
    const d = today();
    const ds = iso(d);
    const sh = shiftFor(ds);
    let sub;
    if (sh && !sh.off) sub = `Turno das ${hm(sh.start)} às ${hm(sh.end)}${sh.changed ? ' (horário alterado)' : ''}`;
    else if (sh && sh.off) sub = 'Folga do trabalho hoje';
    else sub = 'Sem turno hoje';

    const pending = state().items.filter((i) => !i.done);
    const provas = pending.filter((i) => i.type === 'prova' && i.date && diffDays(i.date) >= 0)
      .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
    const tarefas = pending.filter((i) => i.type === 'tarefa' && (!i.date || diffDays(i.date) <= 7))
      .sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999')).slice(0, 5);
    const todays = itemsOn(ds);

    return `
      <h2 class="hero-date">${DOW[d.getDay()]}</h2>
      <p class="hero-sub">${d.getDate()} de ${MONTHS[d.getMonth()]}. ${sub}.</p>

      <section class="ribbon-card" aria-label="Hoje">
        ${ribbon(ds, { withNow: true })}
        ${scale()}
        ${todays.length ? `<div class="chips">${todays.map(chip).join('')}</div>` : ''}
      </section>

      <h2 class="section-title">Próximas provas <a href="#/tarefas?f=prova">Ver todas</a></h2>
      ${provas.length ? `<div class="card">${provas.map((i) => itemRow(i)).join('')}</div>`
        : `<div class="empty"><p>Nenhuma prova marcada.</p><button type="button" class="pill-btn" data-new="prova">Adicionar prova</button></div>`}

      <h2 class="section-title">Para fazer esta semana <a href="#/tarefas">Ver todas</a></h2>
      ${tarefas.length ? `<div class="card">${tarefas.map((i) => itemRow(i)).join('')}</div>`
        : `<div class="empty"><p>Nada pendente para os próximos 7 dias.</p><button type="button" class="pill-btn" data-new="tarefa">Adicionar tarefa</button></div>`}

      <nav class="nav-list" aria-label="Seções">
        <a class="nav-item" href="#/agenda"><span class="glyph">${ICON.week}</span><span><strong>Agenda da semana</strong><small>Turnos e compromissos de seg a dom</small></span>${ICON.chev}</a>
        <a class="nav-item" href="#/tarefas"><span class="glyph">${ICON.list}</span><span><strong>Tarefas e provas</strong><small>${pending.length} pendente${pending.length === 1 ? '' : 's'}, por matéria</small></span>${ICON.chev}</a>
        <a class="nav-item" href="#/drive"><span class="glyph">${ICON.folderLine}</span><span><strong>Pastas do Drive</strong><small>${state().links.length} atalho${state().links.length === 1 ? '' : 's'}</small></span>${ICON.chev}</a>
      </nav>`;
  };
  screens[''].title = 'Minha Agenda';

  let weekStart = mondayOf(new Date());
  screens.agenda = function agenda() {
    const start = weekStart;
    const end = addDays(start, 6);
    const isThisWeek = iso(start) === iso(mondayOf(new Date()));
    const range = start.getMonth() === end.getMonth()
      ? `${start.getDate()} a ${end.getDate()} de ${MONTHS[end.getMonth()]}`
      : `${start.getDate()} ${MON_SHORT[start.getMonth()]} a ${end.getDate()} ${MON_SHORT[end.getMonth()]}`;
    const todayStr = iso(today());
    let rows = '';
    for (let k = 0; k < 7; k++) {
      const d = addDays(start, k);
      const ds = iso(d);
      const sh = shiftFor(ds);
      const its = itemsOn(ds);
      rows += `<button type="button" class="day-row${ds === todayStr ? ' today' : ''}" data-day="${ds}" aria-label="${longDate(d)}">
        <span class="day-label"><span class="dow">${DOW_SHORT[d.getDay()]}</span><span class="num">${d.getDate()}</span></span>
        <span class="day-main">
          ${sh && sh.off ? '<p class="day-off">Folga</p>' : ''}
          ${ribbon(ds, { compact: true, withNow: true })}
          ${its.length ? `<span class="chips">${its.map(chip).join('')}</span>` : ''}
        </span>
      </button>`;
    }
    return `
      <div class="week-nav">
        <h2>${range}</h2>
        <button type="button" class="icon-btn" data-week="-1" aria-label="Semana anterior">${ICON.left}</button>
        <button type="button" class="icon-btn" data-week="1" aria-label="Próxima semana">${ICON.right}</button>
      </div>
      ${isThisWeek ? '' : '<p><button type="button" class="pill-btn" data-week="0">Voltar para esta semana</button></p>'}
      <div class="week">${rows}</div>
      <div class="legend" aria-hidden="true">
        <span><i class="l-shift" style="background:${workColor()}"></i>Turno</span>
        <span><i class="l-dot"></i>Tarefa</span>
        <span><i class="l-dia"></i>Prova</span>
      </div>
      <p class="hint">Toque em um dia para marcar folga, mudar o horário ou adicionar algo.</p>
      <button type="button" class="fab" data-new="tarefa">${ICON.plus}Nova</button>`;
  };
  screens.agenda.title = 'Agenda da semana';

  const taskFilter = { status: 'pendentes', type: 'todas' };
  screens.tarefas = function tarefas(params) {
    if (params.get('f') === 'prova') { taskFilter.type = 'prova'; history.replaceState(null, '', '#/tarefas'); }
    const seg = (key, val, label) => `<button type="button" aria-pressed="${taskFilter[key] === val}" data-filter="${key}:${val}">${label}</button>`;
    const all = state().items.filter((i) =>
      (taskFilter.status === 'pendentes' ? !i.done : i.done) &&
      (taskFilter.type === 'todas' || i.type === taskFilter.type));
    const sortFn = (a, b) => (a.date || '9999').localeCompare(b.date || '9999') || (a.time || '').localeCompare(b.time || '');

    let groups = '';
    for (const cat of [...subjects(), { id: null, name: 'Sem matéria', color: '#868E96' }]) {
      const its = all.filter((i) => (cat.id === null ? !S.category(i.subjectId) : i.subjectId === cat.id)).sort(sortFn);
      if (!its.length) continue;
      groups += `<section class="group" style="--c:${cat.color}">
        <div class="group-head"><span class="bar"></span><h3>${esc(cat.name)}</h3><span class="count">${its.length}</span></div>
        <div class="card">${its.map((i) => itemRow(i, { showSubject: false })).join('')}</div>
      </section>`;
    }
    const emptyMsg = taskFilter.status === 'pendentes'
      ? 'Nada pendente aqui. Use o botão Nova para adicionar uma tarefa ou prova.'
      : 'Nenhum item concluído ainda.';
    return `
      <div class="segmented" role="group" aria-label="Situação">${seg('status', 'pendentes', 'Pendentes')}${seg('status', 'concluidas', 'Concluídas')}</div>
      <div class="segmented" role="group" aria-label="Tipo">${seg('type', 'todas', 'Todas')}${seg('type', 'prova', 'Provas')}${seg('type', 'tarefa', 'Tarefas')}</div>
      ${groups || `<div class="empty" style="margin-top:22px"><p>${emptyMsg}</p></div>`}
      <button type="button" class="fab" data-new="${taskFilter.type === 'prova' ? 'prova' : 'tarefa'}">${ICON.plus}Nova</button>`;
  };
  screens.tarefas.title = 'Tarefas e provas';

  screens.drive = function drive() {
    const links = state().links;
    const rows = links.map((l) => {
      const c = l.catId ? catColor(l.catId) : '#4C6EF5';
      const cat = S.category(l.catId);
      return `<div class="link-item" style="--c:${c}">
        <span class="folder">${ICON.folder}</span>
        <a href="${esc(l.url)}" target="_blank" rel="noopener"><strong>${esc(l.name)}</strong><small>${cat ? esc(cat.name) : 'Google Drive'}</small></a>
        <button type="button" class="icon-btn" data-edit-link="${l.id}" aria-label="Editar ${esc(l.name)}">${ICON.edit}</button>
      </div>`;
    }).join('');
    return `
      ${links.length ? `<div class="card">${rows}</div>` : '<div class="empty"><p>Nenhum atalho ainda. Cole o link de uma pasta do Drive para criar o primeiro.</p></div>'}
      <p class="hint">As pastas abrem no app do Google Drive ou no navegador e precisam de internet.</p>
      <button type="button" class="fab" data-new-link>${ICON.plus}Novo atalho</button>`;
  };
  screens.drive.title = 'Pastas do Drive';

  screens.config = function config() {
    const st = state();
    const cats = st.categories.map((c) => `<button type="button" class="setting" data-edit-cat="${c.id}" style="--c:${c.color}">
      <span class="sw"></span><span class="name">${esc(c.name)}</span>${ICON.chev}</button>`).join('');
    const days = [1, 2, 3, 4, 5, 6, 0].map((d) => {
      const t = st.shiftTemplate[d];
      return `<button type="button" class="setting plain" data-edit-template="${d}"><span class="name">${DOW[d]}</span><span class="val">${t ? `${hm(t.start)}–${hm(t.end)}` : 'Sem turno'}</span></button>`;
    }).join('');
    const perm = 'Notification' in window ? Notification.permission : 'unsupported';
    let notifHint = 'Avisos às 8h: 3 dias antes, na véspera e no dia da prova; na véspera e no dia das entregas.';
    if (perm === 'denied') notifHint = 'As notificações estão bloqueadas para este site. Libere nas configurações do navegador.';
    if (perm === 'unsupported') notifHint = 'Este navegador não mostra notificações. No iPhone, instale o app na tela de início primeiro.';
    return `
      <h2 class="section-title" style="margin-top:8px">Matérias e cores</h2>
      <div class="settings-list">${cats}</div>
      <p><button type="button" class="link-btn" data-new-cat>Adicionar matéria</button></p>

      <h2 class="section-title">Turno padrão</h2>
      <div class="settings-list">${days}</div>
      <p class="hint">Para folga ou outro horário em um dia só, toque no dia na agenda.</p>

      <h2 class="section-title">Lembretes</h2>
      <div class="settings-list">
        <label class="setting plain"><span class="name">Notificações de provas e entregas</span>
          <span class="switch"><input type="checkbox" id="notif-toggle" ${st.settings.notifications && perm === 'granted' ? 'checked' : ''} ${perm === 'unsupported' || perm === 'denied' ? 'disabled' : ''}><span></span></span>
        </label>
      </div>
      <p class="hint">${notifHint} Com o app fechado, o aviso pode chegar só quando você abrir o app de novo.</p>

      <h2 class="section-title">Backup</h2>
      <p class="muted small" style="margin-top:0">Os dados ficam salvos só neste aparelho. Exporte um arquivo de vez em quando para não perder nada.</p>
      <div class="btn-row" style="margin-top:8px">
        <button type="button" class="btn secondary" data-export>Exportar backup</button>
        <button type="button" class="btn secondary" data-import>Importar backup</button>
      </div>
      <input type="file" id="import-file" accept="application/json,.json" hidden>
      <p class="hint" style="margin-top:28px">Minha Agenda, versão 1.</p>`;
  };
  screens.config.title = 'Configurações';

  // ---------- roteamento ----------
  function route() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [name, query] = raw.split('?');
    const key = screens[name] ? name : '';
    const params = new URLSearchParams(query || '');
    app.innerHTML = screens[key](params);
    titleEl.textContent = screens[key].title;
    document.title = key ? `${screens[key].title} – Minha Agenda` : 'Minha Agenda';
    backBtn.hidden = key === '';
    settingsBtn.hidden = key === 'config';
    route.current = key;
  }
  function rerender() {
    const y = window.scrollY;
    route();
    window.scrollTo(0, y);
  }
  window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });
  backBtn.addEventListener('click', () => {
    if (history.length > 1 && route.came) history.back(); else location.hash = '#/';
  });
  window.addEventListener('hashchange', () => { route.came = true; }, { once: true });
  settingsBtn.addEventListener('click', () => { location.hash = '#/config'; });

  // ---------- folha inferior ----------
  function openSheet(title, html, onReady) {
    sheetTitle.textContent = title;
    sheetBody.innerHTML = html;
    if (!sheet.open) sheet.showModal();
    sheetBody.scrollTop = 0;
    if (onReady) onReady(sheetBody);
  }
  const closeSheet = () => sheet.close();
  sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });

  function subjectOptions(selected) {
    return subjects().map((c) => `<option value="${c.id}" ${c.id === selected ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  }

  function itemSheet(item, preset = {}) {
    const isNew = !item;
    const i = item || { type: preset.type || 'tarefa', title: '', subjectId: preset.subjectId || subjects()[0]?.id, date: preset.date || iso(today()), time: '', notes: '', grade: '' };
    openSheet(isNew ? (i.type === 'prova' ? 'Nova prova' : 'Nova tarefa') : 'Editar', `
      <div class="type-toggle" role="radiogroup" aria-label="Tipo">
        <label><input type="radio" name="type" value="tarefa" ${i.type === 'tarefa' ? 'checked' : ''}><span>Tarefa</span></label>
        <label><input type="radio" name="type" value="prova" ${i.type === 'prova' ? 'checked' : ''}><span>Prova</span></label>
      </div>
      <label class="field"><span>Título</span><input name="title" required maxlength="140" value="${esc(i.title)}" placeholder="Ex.: Resenha do capítulo 3" autocomplete="off"></label>
      <label class="field"><span>Matéria</span><select name="subjectId">${subjectOptions(i.subjectId)}</select></label>
      <div class="row-2">
        <label class="field"><span id="date-label">${i.type === 'prova' ? 'Data da prova' : 'Entrega'}</span><input type="date" name="date" value="${esc(i.date)}"></label>
        <label class="field"><span>Horário</span><input type="time" name="time" value="${esc(i.time)}"></label>
      </div>
      <label class="field"><span id="notes-label">${i.type === 'prova' ? 'Conteúdo da prova' : 'Observações'}</span><textarea name="notes" placeholder="${i.type === 'prova' ? 'Capítulos, textos, autores…' : 'Detalhes, links, combinados…'}">${esc(i.notes)}</textarea></label>
      <label class="field" id="grade-field" ${i.type === 'prova' ? '' : 'hidden'}><span>Nota</span><input name="grade" inputmode="decimal" maxlength="10" value="${esc(i.grade)}" placeholder="Preencha quando sair"></label>
      <p class="hint" id="form-error" role="alert" hidden></p>
      <div class="btn-row">
        ${isNew ? '' : '<button type="button" class="btn danger" data-delete>Excluir</button>'}
        <button type="button" class="btn secondary" data-cancel>Cancelar</button>
        <button type="submit" class="btn" value="save">${isNew ? 'Adicionar' : 'Salvar'}</button>
      </div>`, (body) => {
      const form = body.closest('form');
      body.querySelectorAll('input[name=type]').forEach((r) => r.addEventListener('change', () => {
        const p = r.value === 'prova';
        body.querySelector('#grade-field').hidden = !p;
        body.querySelector('#date-label').textContent = p ? 'Data da prova' : 'Entrega';
        body.querySelector('#notes-label').textContent = p ? 'Conteúdo da prova' : 'Observações';
        body.querySelector('[name=notes]').placeholder = p ? 'Capítulos, textos, autores…' : 'Detalhes, links, combinados…';
        if (isNew) sheetTitle.textContent = p ? 'Nova prova' : 'Nova tarefa';
      }));
      body.querySelector('[data-cancel]').onclick = closeSheet;
      const del = body.querySelector('[data-delete]');
      if (del) del.onclick = () => {
        if (!confirm(`Excluir "${i.title}"?`)) return;
        state().items = state().items.filter((x) => x.id !== i.id);
        S.save(); closeSheet(); toast('Excluído');
      };
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const title = String(fd.get('title') || '').trim();
        if (!title) {
          const er = body.querySelector('#form-error');
          er.hidden = false; er.textContent = 'Escreva um título.';
          body.querySelector('[name=title]').focus();
          return;
        }
        const data = {
          type: fd.get('type'), title, subjectId: fd.get('subjectId'),
          date: fd.get('date') || '', time: fd.get('time') || '',
          notes: String(fd.get('notes') || '').trim(),
          grade: fd.get('type') === 'prova' ? String(fd.get('grade') || '').trim() : '',
          updatedAt: new Date().toISOString(),
        };
        if (isNew) state().items.push({ id: S.uid(), done: false, createdAt: data.updatedAt, ...data });
        else Object.assign(item, data);
        S.save(); closeSheet();
        toast(isNew ? (data.type === 'prova' ? 'Prova adicionada' : 'Tarefa adicionada') : 'Salvo');
      };
      if (isNew) setTimeout(() => body.querySelector('[name=title]').focus(), 50);
    });
  }

  function daySheet(ds) {
    const d = parse(ds);
    const base = state().shiftTemplate[d.getDay()];
    const o = state().shiftOverrides[ds];
    const mode = o ? (o.off ? 'off' : 'custom') : 'normal';
    const start = o && !o.off ? o.start : base ? base.start : '13:00';
    const end = o && !o.off ? o.end : base ? base.end : '21:30';
    const its = itemsOn(ds);
    openSheet(longDate(d), `
      <label class="field"><span>Trabalho</span>
        <select name="mode">
          <option value="normal" ${mode === 'normal' ? 'selected' : ''}>${base ? `Turno normal (${hm(base.start)}–${hm(base.end)})` : 'Sem turno (padrão)'}</option>
          <option value="off" ${mode === 'off' ? 'selected' : ''}>Folga</option>
          <option value="custom" ${mode === 'custom' ? 'selected' : ''}>Outro horário</option>
        </select>
      </label>
      <div class="row-2" id="custom-times" ${mode === 'custom' ? '' : 'hidden'}>
        <label class="field"><span>Entrada</span><input type="time" name="start" value="${start}"></label>
        <label class="field"><span>Saída</span><input type="time" name="end" value="${end}"></label>
      </div>
      <h3 class="section-title" style="margin-top:22px">Neste dia</h3>
      ${its.length ? `<div class="card" style="box-shadow:none;background:var(--bg)">${its.map((i) => itemRow(i)).join('')}</div>` : '<p class="muted small">Nada marcado.</p>'}
      <div class="btn-row">
        <button type="button" class="btn secondary" data-add-here>Adicionar neste dia</button>
        <button type="submit" class="btn">Salvar turno</button>
      </div>`, (body) => {
      const form = body.closest('form');
      const sel = body.querySelector('[name=mode]');
      sel.onchange = () => { body.querySelector('#custom-times').hidden = sel.value !== 'custom'; };
      body.querySelector('[data-add-here]').onclick = () => itemSheet(null, { date: ds });
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const m = fd.get('mode');
        const ov = state().shiftOverrides;
        if (m === 'normal') delete ov[ds];
        else if (m === 'off') ov[ds] = { off: true };
        else {
          const s = fd.get('start'), en = fd.get('end');
          if (!s || !en || minutes(en) <= minutes(s)) { toast('A saída precisa ser depois da entrada.'); return; }
          ov[ds] = { start: s, end: en };
        }
        S.save(); closeSheet(); toast(m === 'off' ? 'Folga marcada' : 'Turno salvo');
      };
    });
  }

  function paletteField(selected) {
    return `<div class="field"><span>Cor</span><div class="swatches" role="radiogroup" aria-label="Cor">${S.PALETTE.map((p) =>
      `<label style="--c:${p.hex}"><input type="radio" name="color" value="${p.hex}" ${p.hex.toLowerCase() === (selected || '').toLowerCase() ? 'checked' : ''} aria-label="${p.name}"><span></span></label>`).join('')}</div></div>`;
  }

  function categorySheet(cat) {
    const isNew = !cat;
    const used = new Set(state().categories.map((c) => c.color));
    const c = cat || { name: '', color: (S.PALETTE.find((p) => !used.has(p.hex)) || S.PALETTE[0]).hex, kind: 'materia' };
    const count = cat ? state().items.filter((i) => i.subjectId === cat.id).length : 0;
    openSheet(isNew ? 'Nova matéria' : c.kind === 'trabalho' ? 'Trabalho' : 'Editar matéria', `
      <label class="field"><span>Nome</span><input name="name" required maxlength="80" value="${esc(c.name)}" placeholder="Nome da matéria"></label>
      ${paletteField(c.color)}
      <div class="btn-row">
        ${!isNew && c.kind === 'materia' ? '<button type="button" class="btn danger" data-delete>Excluir</button>' : ''}
        <button type="button" class="btn secondary" data-cancel>Cancelar</button>
        <button type="submit" class="btn">${isNew ? 'Adicionar' : 'Salvar'}</button>
      </div>`, (body) => {
      const form = body.closest('form');
      body.querySelector('[data-cancel]').onclick = closeSheet;
      const del = body.querySelector('[data-delete]');
      if (del) del.onclick = () => {
        const msg = count ? `Excluir "${c.name}"? ${count} item(ns) vão para "Sem matéria".` : `Excluir "${c.name}"?`;
        if (!confirm(msg)) return;
        state().categories = state().categories.filter((x) => x.id !== c.id);
        S.save(); closeSheet(); toast('Matéria excluída');
      };
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const name = String(fd.get('name') || '').trim();
        if (!name) { body.querySelector('[name=name]').focus(); return; }
        const color = fd.get('color') || c.color;
        if (isNew) {
          const cats = state().categories;
          const idx = cats.findIndex((x) => x.kind === 'pessoal');
          cats.splice(idx < 0 ? cats.length : idx, 0, { id: S.uid(), name, color, kind: 'materia' });
        } else Object.assign(cat, { name, color });
        S.save(); closeSheet(); toast(isNew ? 'Matéria adicionada' : 'Salvo');
      };
    });
  }

  function templateSheet(dow) {
    const t = state().shiftTemplate[dow];
    openSheet(DOW[dow], `
      <label class="field"><span>Trabalho</span>
        <select name="has"><option value="yes" ${t ? 'selected' : ''}>Tem turno</option><option value="no" ${t ? '' : 'selected'}>Sem turno</option></select>
      </label>
      <div class="row-2" id="tt" ${t ? '' : 'hidden'}>
        <label class="field"><span>Entrada</span><input type="time" name="start" value="${t ? t.start : '13:00'}"></label>
        <label class="field"><span>Saída</span><input type="time" name="end" value="${t ? t.end : '21:30'}"></label>
      </div>
      <p class="hint">Vale para toda ${DOW[dow].toLowerCase()}. Exceções marcadas na agenda continuam valendo.</p>
      <div class="btn-row">
        <button type="button" class="btn secondary" data-cancel>Cancelar</button>
        <button type="submit" class="btn">Salvar</button>
      </div>`, (body) => {
      const form = body.closest('form');
      const sel = body.querySelector('[name=has]');
      sel.onchange = () => { body.querySelector('#tt').hidden = sel.value !== 'yes'; };
      body.querySelector('[data-cancel]').onclick = closeSheet;
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        if (fd.get('has') === 'no') delete state().shiftTemplate[dow];
        else {
          const s = fd.get('start'), en = fd.get('end');
          if (!s || !en || minutes(en) <= minutes(s)) { toast('A saída precisa ser depois da entrada.'); return; }
          state().shiftTemplate[dow] = { start: s, end: en };
        }
        S.save(); closeSheet(); toast('Turno padrão salvo');
      };
    });
  }

  function linkSheet(link) {
    const isNew = !link;
    const l = link || { name: '', url: '', catId: '' };
    const opts = state().categories.map((c) => `<option value="${c.id}" ${c.id === l.catId ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
    openSheet(isNew ? 'Novo atalho' : 'Editar atalho', `
      <label class="field"><span>Nome</span><input name="name" required maxlength="80" value="${esc(l.name)}" placeholder="Ex.: Psicologia Social II"></label>
      <label class="field"><span>Link da pasta</span><input name="url" type="url" required inputmode="url" value="${esc(l.url)}" placeholder="https://drive.google.com/drive/folders/…"></label>
      <p class="hint">No Drive, abra a pasta, toque em Compartilhar e depois em Copiar link.</p>
      <label class="field"><span>Cor da categoria</span><select name="catId"><option value="">Azul do Drive</option>${opts}</select></label>
      <p class="hint" id="form-error" role="alert" hidden></p>
      <div class="btn-row">
        ${isNew ? '' : '<button type="button" class="btn danger" data-delete>Excluir</button>'}
        <button type="button" class="btn secondary" data-cancel>Cancelar</button>
        <button type="submit" class="btn">${isNew ? 'Adicionar' : 'Salvar'}</button>
      </div>`, (body) => {
      const form = body.closest('form');
      body.querySelector('[data-cancel]').onclick = closeSheet;
      const del = body.querySelector('[data-delete]');
      if (del) del.onclick = () => {
        if (!confirm(`Excluir o atalho "${l.name}"?`)) return;
        state().links = state().links.filter((x) => x.id !== l.id);
        S.save(); closeSheet(); toast('Atalho excluído');
      };
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const name = String(fd.get('name') || '').trim();
        const url = String(fd.get('url') || '').trim();
        const er = body.querySelector('#form-error');
        if (!name) { er.hidden = false; er.textContent = 'Dê um nome ao atalho.'; return; }
        if (!/^https:\/\//i.test(url)) { er.hidden = false; er.textContent = 'Cole um link que comece com https://'; return; }
        const data = { name, url, catId: fd.get('catId') || null };
        if (isNew) state().links.push({ id: S.uid(), ...data });
        else Object.assign(link, data);
        S.save(); closeSheet(); toast(isNew ? 'Atalho adicionado' : 'Salvo');
      };
    });
  }

  // ---------- notificações ----------
  async function checkReminders() {
    const st = state();
    if (!st.settings.notifications || !('Notification' in window) || Notification.permission !== 'granted') return;
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.ready : null;
    const show = (n) => reg
      ? reg.showNotification(n.title, { body: n.body, tag: n.tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { url: './#/tarefas' } })
      : new Notification(n.title, { body: n.body, tag: n.tag });
    try { await window.Reminders.run(show, st); } catch (e) { /* IndexedDB indisponível */ }
  }

  async function enableNotifications(on) {
    const st = state();
    if (!on) { st.settings.notifications = false; S.save(); toast('Lembretes desligados'); return; }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { st.settings.notifications = false; S.save(); toast('Permissão de notificação negada'); rerender(); return; }
    st.settings.notifications = true;
    S.save();
    try {
      const reg = await navigator.serviceWorker.ready;
      if ('periodicSync' in reg) await reg.periodicSync.register('lembretes', { minInterval: 6 * 60 * 60 * 1000 });
    } catch (e) { /* periodic sync indisponível: verifica ao abrir o app */ }
    toast('Lembretes ligados');
    checkReminders();
  }

  // ---------- eventos ----------
  app.addEventListener('click', (e) => {
    const t = e.target.closest('button, [data-day]');
    if (!t) return;
    const ds = t.dataset;
    if (ds.toggle) {
      const it = state().items.find((x) => x.id === ds.toggle);
      if (it) { it.done = !it.done; it.updatedAt = new Date().toISOString(); S.save(); toast(it.done ? 'Concluído' : 'Marcado como pendente'); }
    } else if (ds.edit) {
      const it = state().items.find((x) => x.id === ds.edit);
      if (it) itemSheet(it);
    } else if (ds.new) {
      itemSheet(null, { type: ds.new });
    } else if (ds.day) {
      daySheet(ds.day);
    } else if (ds.week !== undefined) {
      const n = Number(ds.week);
      weekStart = n === 0 ? mondayOf(new Date()) : addDays(weekStart, 7 * n);
      rerender();
    } else if (ds.filter) {
      const [k, v] = ds.filter.split(':');
      taskFilter[k] = v; rerender();
    } else if (ds.editLink) {
      linkSheet(state().links.find((x) => x.id === ds.editLink));
    } else if ('newLink' in ds) {
      linkSheet(null);
    } else if (ds.editCat) {
      categorySheet(S.category(ds.editCat));
    } else if ('newCat' in ds) {
      categorySheet(null);
    } else if (ds.editTemplate) {
      templateSheet(Number(ds.editTemplate));
    } else if ('export' in ds) {
      const blob = new Blob([S.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `minha-agenda-backup-${iso(today())}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } else if ('import' in ds) {
      document.getElementById('import-file').click();
    }
  });

  // Toques dentro da folha (itens listados no dia)
  sheetBody.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toggle], [data-edit]');
    if (!t) return;
    const id = t.dataset.toggle || t.dataset.edit;
    const it = state().items.find((x) => x.id === id);
    if (!it) return;
    if (t.dataset.toggle) { it.done = !it.done; S.save(); t.setAttribute('aria-checked', it.done); t.closest('.item').classList.toggle('done', it.done); }
    else itemSheet(it);
  });

  app.addEventListener('change', (e) => {
    if (e.target.id === 'notif-toggle') enableNotifications(e.target.checked);
    if (e.target.id === 'import-file') {
      const f = e.target.files[0];
      if (!f) return;
      f.text().then((txt) => {
        const data = JSON.parse(txt);
        if (!confirm('Importar este backup? Os dados atuais deste aparelho serão substituídos.')) return;
        S.replace(data);
        toast('Backup importado');
      }).catch(() => toast('Não foi possível ler o arquivo. Escolha um backup exportado pelo Minha Agenda.'));
    }
  });

  S.subscribe(rerender);

  const banner = document.getElementById('offline-banner');
  const net = () => { banner.hidden = navigator.onLine; };
  window.addEventListener('online', net);
  window.addEventListener('offline', net);
  net();

  // Atualiza o marcador de "agora" e verifica lembretes a cada minuto
  setInterval(() => {
    if (!sheet.open && (route.current === '' || route.current === 'agenda')) rerender();
    checkReminders();
  }, 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { rerender(); checkReminders(); }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  route();
  checkReminders();
})();
