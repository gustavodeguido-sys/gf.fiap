export function textoOuNulo(valor) {
  const texto = (valor ?? '').toString().trim()
  return texto === '' ? null : texto
}

export function numeroOuNulo(valor) {
  if (valor === '' || valor === null || valor === undefined) return null
  const numero = Number(valor)
  return Number.isNaN(numero) ? null : numero
}
