import api from './api'

export async function listarContas(idUsuario) {
  const { data } = await api.get('/contas-bancarias', {
    params: idUsuario ? { idUsuario } : undefined,
  })
  return data
}

export async function buscarConta(id) {
  const { data } = await api.get(`/contas-bancarias/${id}`)
  return data
}

export async function criarConta(conta) {
  const { data } = await api.post('/contas-bancarias', conta)
  return data
}

export async function atualizarConta(id, conta) {
  const { data } = await api.put(`/contas-bancarias/${id}`, conta)
  return data
}

export async function excluirConta(id) {
  await api.delete(`/contas-bancarias/${id}`)
}
