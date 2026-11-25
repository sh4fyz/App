/* Lógica de lembretes, compartilhada pelo app e pelo service worker.
   Não existe agendamento exato de notificações na web: o app verifica ao abrir,
   a cada minuto enquanto está aberto e, onde o navegador permite
   (Chrome/Android com o app instalado), em segundo plano pelo periodic sync. */
(function (root) {
  function parseDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function whenText(days) {
    if (days === 0) return 'hoje';
    if (days === 1) return 'amanhã';
    return `em ${days} dias`;
  }

  // Devolve os lembretes que já deveriam ter sido mostrados e ainda não foram.
  function due(state, sent, now) {
    now = now || new Date();
    const out = [];
    if (!state || !state.settings) return out;
    const hour = state.settings.reminderHour ?? 8;
    sent = sent || {};
    const cats = state.categories || [];

    for (const item of state.items || []) {
      if (item.done || !item.date) continue;
      const day = parseDate(item.date);
      const end = new Date(day);
      if (item.time) {
        const [h, mi] = item.time.split(':').map(Number);
        end.setHours(h, mi);
      } else {
        end.setHours(23, 59);
      }
      if (now > end) continue;

      const offsets = (state.settings.reminderDays || {})[item.type] || [];
      for (const off of offsets) {
        const key = `${item.id}:${item.date}:${off}`;
        if (sent[key]) continue;
        const fire = new Date(day);
        fire.setDate(fire.getDate() - off);
        fire.setHours(hour, 0, 0, 0);
        if (now < fire) continue;
        // Se o lembrete de 3 dias foi perdido e já estamos na véspera, só o mais recente aparece.
        const later = offsets.filter((o) => o < off).some((o) => {
          const f = new Date(day); f.setDate(f.getDate() - o); f.setHours(hour, 0, 0, 0);
          return now >= f;
        });
        if (later) { out.push({ key, skip: true }); continue; }

        const cat = cats.find((c) => c.id === item.subjectId);
        const label = item.type === 'prova' ? 'Prova' : 'Entrega';
        const daysLeft = Math.round((day - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
        out.push({
          key,
          title: `${label} ${whenText(daysLeft)}${item.time ? ' às ' + item.time.replace(':00', 'h').replace(':', 'h') : ''}`,
          body: `${item.title}${cat ? ' (' + cat.name + ')' : ''}`,
          tag: key,
        });
      }
    }
    return out;
  }

  // Estado + lembretes já enviados ficam no IndexedDB, lido pelos dois lados.
  function db() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('minha-agenda', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('kv');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  function kv(mode, fn) {
    return db().then((d) => new Promise((resolve, reject) => {
      const tx = d.transaction('kv', mode);
      const r = fn(tx.objectStore('kv'));
      tx.oncomplete = () => resolve(r && r.result);
      tx.onerror = () => reject(tx.error);
    }));
  }

  // Mostra o que estiver pendente. `show(n)` exibe a notificação.
  async function run(show, stateOverride) {
    const state = stateOverride || await kv('readonly', (s) => s.get('state'));
    if (!state || !state.settings || !state.settings.notifications) return 0;
    const sent = (await kv('readonly', (s) => s.get('sent'))) || {};
    const list = due(state, sent);
    let shown = 0;
    for (const n of list) {
      if (!n.skip) { await show(n); shown++; }
      sent[n.key] = Date.now();
    }
    if (list.length) await kv('readwrite', (s) => s.put(sent, 'sent'));
    return shown;
  }

  root.Reminders = { due, run };
})(typeof self !== 'undefined' ? self : window);
