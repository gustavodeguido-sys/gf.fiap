import { Outlet } from 'react-router-dom'
import { NOME_SISTEMA, SIGLA_SISTEMA } from '../constantes'
import { useAuth } from '../context/contextoAuth.js'
import Navbar from './Navbar.jsx'

const LINKS_PADRAO = [
  { para: '/', rotulo: 'Início' },
  { para: '/usuarios', rotulo: 'Usuários' },
  { para: '/contas', rotulo: 'Contas' },
  { para: '/investimentos', rotulo: 'Investimentos' },
]

function Layout({ links = LINKS_PADRAO, children }) {
  const { usuario, sair } = useAuth()
  const primeiroNome = usuario?.nome?.split(' ')[0]

  return (
    <div className="layout">
      <Navbar
        titulo={NOME_SISTEMA}
        sigla={SIGLA_SISTEMA}
        links={links}
        nomeUsuario={primeiroNome}
        onSair={usuario ? sair : undefined}
      />
      <main className="conteudo">{children ?? <Outlet />}</main>
    </div>
  )
}

export default Layout
