import axios from 'axios'

const urlBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

const api = axios.create({
  baseURL: urlBase,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

export function extrairMensagemErro(erro) {
  const corpo = erro.response?.data

  if (corpo?.campos?.length) {
    return corpo.campos.map((c) => `${c.campo}: ${c.mensagem}`).join('\n')
  }
  if (corpo?.mensagem) {
    return corpo.mensagem
  }
  if (erro.code === 'ECONNABORTED') {
    return 'A API demorou demais para responder.'
  }
  if (!erro.response) {
    return 'Não foi possível conectar à API. Verifique se o backend está rodando.'
  }
  return 'Erro inesperado. Tente novamente.'
}

export function interpretarErroApi(erro) {
  const corpo = erro.response?.data
  const campos = {}

  for (const item of corpo?.campos ?? []) {
    campos[item.campo] ??= item.mensagem
  }

  const mensagem = Object.keys(campos).length > 0
    ? 'Corrija os campos destacados abaixo.'
    : extrairMensagemErro(erro)

  return { mensagem, campos }
}

export default api
