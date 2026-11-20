const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatarMoeda(valor) {
  return formatoMoeda.format(Number(valor ?? 0))
}

export function formatarData(dataIso) {
  if (!dataIso) return '—'
  const [ano, mes, dia] = dataIso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

export function formatarTaxa(taxa) {
  return `${Number(taxa).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}% a.a.`
}

export function formatarCpf(cpf) {
  if (!cpf || cpf.length !== 11) return cpf ?? '—'
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function descreverConta(conta) {
  if (!conta) return '—'
  return `${conta.nomeBanco} • Ag. ${conta.agencia} • Conta ${conta.numeroConta}`
}
