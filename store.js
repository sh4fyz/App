/* Armazenamento local. O estado inteiro é um único objeto JSON:
   fica no localStorage (leitura rápida) e é espelhado no IndexedDB para que o
   service worker consiga ler e disparar lembretes. Esse mesmo objeto é o que
   será enviado à pasta oculta do Drive quando a sincronização for adicionada. */
(function () {
  const KEY = 'minha-agenda:v1';
  const SCHEMA = 1;

  const PALETTE = [
    { hex: '#4C6EF5', name: 'Azul' },
    { hex: '#7048E8', name: 'Violeta' },
    { hex: '#BE4BDB', name: 'Orquídea' },
    { hex: '#E64980', name: 'Rosa' },
    { hex: '#F03E3E', name: 'Vermelho' },
    { hex: '#F76707', name: 'Laranja' },
    { hex: '#F59F00', name: 'Âmbar' },
    { hex: '#74B816', name: 'Lima' },
    { hex: '#37B24D', name: 'Verde' },
    { hex: '#0CA678', name: 'Esmeralda' },
    { hex: '#1098AD', name: 'Ciano' },
    { hex: '#868E96', name: 'Grafite' },
  ];

  const SUBJECTS = [
    ['Atividade de Extensão III', '#7048E8'],
    ['Avaliação Psicológica: Instrumentos Objetivos', '#E64980'],
    ['Estágio Básico em Avaliação Psicológica I', '#F76707'],
    ['Prática de Pesquisa Qualitativa em Psicologia', '#37B24D'],
    ['Processos Psicológicos Básicos II', '#1098AD'],
    ['Psicologia do Desenvolvimento do Adulto e do Idoso', '#F59F00'],
    ['Psicologia e Políticas Públicas', '#BE4BDB'],
    ['Psicologia Social II', '#F03E3E'],
  ];

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function defaults() {
    const now = new Date().toISOString();
    return {
      schema: SCHEMA,
      updatedAt: now,
      categories: [
        { id: 'trabalho', name: 'Trabalho', color: '#4C6EF5', kind: 'trabalho' },
        ...SUBJECTS.map(([name, color]) => ({ id: uid(), name, color, kind: 'materia' })),
        { id: 'pessoal', name: 'Pessoal', color: '#74B816', kind: 'pessoal' },
      ],
      // 0 = domingo … 6 = sábado
      shiftTemplate: {
        1: { start: '13:00', end: '21:30' },
        2: { start: '13:00', end: '21:30' },
        3: { start: '13:00', end: '21:30' },
        4: { start: '13:00', end: '21:30' },
        5: { start: '13:00', end: '21:30' },
      },
      // 'AAAA-MM-DD' → { off: true } | { start, end }
      shiftOverrides: {},
      items: [],
      links: [
        { id: uid(), name: 'FCMSCSP', url: 'https://drive.google.com/drive/folders/1QW2AF25PmSIw-PNr0QaKj6NzNE6dK8ck', catId: null },
      ],
      settings: {
        notifications: false,
        reminderHour: 8,
        reminderDays: { prova: [3, 1, 0], tarefa: [1, 0] },
      },
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.schema === SCHEMA) return Object.assign(defaults(), data);
      }
    } catch (e) { /* armazenamento indisponível: começa do padrão */ }
    return defaults();
  }

  // IndexedDB mínimo (uma chave) para o service worker
  function idb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('minha-agenda', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('kv');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function mirror(state) {
    try {
      const db = await idb();
      const tx = db.transaction('kv', 'readwrite');
      tx.objectStore('kv').put(state, 'state');
    } catch (e) { /* sem IndexedDB: lembretes só com o app aberto */ }
  }

  let state = load();
  const listeners = new Set();

  function save() {
    state.updatedAt = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* cheio ou bloqueado */ }
    mirror(state);
    listeners.forEach((fn) => fn(state));
  }

  window.Store = {
    PALETTE,
    uid,
    get: () => state,
    save,
    subscribe: (fn) => listeners.add(fn),
    replace(next) {
      if (!next || typeof next !== 'object' || !Array.isArray(next.items)) throw new Error('Arquivo de backup inválido.');
      state = Object.assign(defaults(), next, { schema: SCHEMA });
      save();
    },
    exportJSON: () => JSON.stringify(state, null, 2),
    category: (id) => state.categories.find((c) => c.id === id),
  };
  mirror(state);
})();
