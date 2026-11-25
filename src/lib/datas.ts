export const DIAS_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
export const DIAS_LONGOS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
export const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
export const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const pad = (n: number) => String(n).padStart(2, '0')

/** 'AAAA-MM-DD' no fuso local */
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const deIso = (s: string) => {
  const [a, m, d] = s.split('-').map(Number)
  return new Date(a, m - 1, d)
}
export const hoje = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
export const somarDias = (d: Date, n: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
export const segundaDaSemana = (d: Date) => somarDias(d, -((d.getDay() + 6) % 7))
export const diasAte = (s: string) => Math.round((deIso(s).getTime() - hoje().getTime()) / 86400000)

/** "Quarta, 25 de novembro" */
export const dataPorExtenso = (d: Date) => `${DIAS_LONGOS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`

export function saudacao(d = new Date()) {
  const h = d.getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** "hoje", "amanhã", "sex" (até 6 dias) ou "02 dez" */
export function quandoCurto(s: string) {
  const n = diasAte(s)
  const d = deIso(s)
  if (n === 0) return 'hoje'
  if (n === 1) return 'amanhã'
  if (n > 1 && n < 7) return DIAS_CURTOS[d.getDay()]
  return `${pad(d.getDate())} ${MESES_CURTOS[d.getMonth()]}`
}

export function faltam(s: string) {
  const n = diasAte(s)
  if (n === 0) return 'é hoje'
  if (n === 1) return 'falta 1 dia'
  if (n < 0) return n === -1 ? 'foi ontem' : `foi há ${-n} dias`
  return `faltam ${n} dias`
}
