import { useCallback, useMemo, useState } from 'react'
import api from '../services/api'
import { AuthContext } from './contextoAuth.js'

const CHAVE_USUARIO = 'fintech.usuario'

function lerUsuarioSalvo() {
  try {
    const salvo = localStorage.getItem(CHAVE_USUARIO)
    return salvo ? JSON.parse(salvo) : null
  } catch {
    localStorage.removeItem(CHAVE_USUARIO)
    return null
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(lerUsuarioSalvo)

  const entrar = useCallback(async (email, senha) => {
    const { data } = await api.post('/auth/login', { email, senha })
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(data))
    setUsuario(data)
    return data
  }, [])

  const sair = useCallback(() => {
    localStorage.removeItem(CHAVE_USUARIO)
    setUsuario(null)
  }, [])

  const atualizarSessao = useCallback((usuarioAtualizado) => {
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuarioAtualizado))
    setUsuario(usuarioAtualizado)
  }, [])

  const valor = useMemo(
    () => ({ usuario, estaLogado: usuario !== null, entrar, sair, atualizarSessao }),
    [usuario, entrar, sair, atualizarSessao],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
