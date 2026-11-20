import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import CampoFormulario from '../components/CampoFormulario.jsx'
import Mensagem from '../components/Mensagem.jsx'
import { NOME_SISTEMA, SIGLA_SISTEMA } from '../constantes'
import { useAuth } from '../context/contextoAuth.js'
import { extrairMensagemErro } from '../services/api'

function Login() {
  const { estaLogado, entrar } = useAuth()
  const local = useLocation()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const destino = local.state?.de?.pathname ?? '/'

  if (estaLogado) {
    return <Navigate to={destino} replace />
  }

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await entrar(email.trim(), senha)
    } catch (falha) {
      setErro(extrairMensagemErro(falha))
      setEnviando(false)
    }
  }

  return (
    <div className="pagina-centralizada">
      <form className="cartao cartao-login" onSubmit={aoEnviar} noValidate>
        <div className="cartao-login-topo">
          <span className="marca-icone marca-icone-grande" aria-hidden="true">
            {SIGLA_SISTEMA}
          </span>
          <h1>{NOME_SISTEMA}</h1>
          <p className="texto-suave">Entre para ver suas contas e investimentos</p>
        </div>

        <Mensagem tipo="erro" onFechar={() => setErro('')}>
          {erro}
        </Mensagem>

        <CampoFormulario
          rotulo="E-mail"
          nome="email"
          tipo="email"
          valor={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          autoComplete="email"
          autoFocus
          required
        />

        <CampoFormulario
          rotulo="Senha"
          nome="senha"
          tipo="password"
          valor={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Sua senha"
          autoComplete="current-password"
          required
        />

        <button type="submit" className="botao botao-primario" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

export default Login
