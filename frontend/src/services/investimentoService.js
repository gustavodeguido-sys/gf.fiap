import api from './api'

export async function listarInvestimentos(idConta) {
  const { data } = await api.get('/investimentos', {
    params: idConta ? { idConta } : undefined,
  })
  return data
}

export async function buscarInvestimento(id) {
  const { data } = await api.get(`/investimentos/${id}`)
  return data
}

export async function criarInvestimento(investimento) {
  const { data } = await api.post('/investimentos', investimento)
  return data
}

export async function atualizarInvestimento(id, investimento) {
  const { data } = await api.put(`/investimentos/${id}`, investimento)
  return data
}

export async function excluirInvestimento(id) {
  await api.delete(`/investimentos/${id}`)
}
