import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CabecalhoPagina from '../../components/CabecalhoPagina.jsx'
import Mensagem from '../../components/Mensagem.jsx'
import Tabela from '../../components/Tabela.jsx'
import { useAuth } from '../../context/contextoAuth.js'
import { extrairMensagemErro } from '../../services/api'
import { excluirUsuario, listarUsuarios } from '../../services/usuarioService'
import { formatarCpf, formatarData } from '../../utils/formatadores'

const COLUNAS = [
  { chave: 'nome', titulo: 'Nome' },
  { chave: 'email', titulo: 'E-mail' },
  { chave: 'cpf', titulo: 'CPF', formatar: formatarCpf },
  { chave: 'dataNascimento', titulo: 'Nascimento', formatar: formatarData },
  { chave: 'dataCadastro', titulo: 'Cadastro', formatar: formatarData },
]

function ListaUsuarios() {
  const { usuario: usuarioLogado, sair } = useAuth()
  const navegar = useNavigate()
  const local = useLocation()

  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(local.state?.mensagemSucesso ?? '')

  useEffect(() => {
    if (local.state?.mensagemSucesso) {
      navegar(local.pathname, { replace: true, state: null })
    }
  }, [local.state, local.pathname, navegar])

  useEffect(() => {
    let cancelado = false

    listarUsuarios()
      .then((dados) => !cancelado && setUsuarios(dados))
      .catch((falha) => !cancelado && setErro(extrairMensagemErro(falha)))
      .finally(() => !cancelado && setCarregando(false))

    return () => {
      cancelado = true
    }
  }, [])

  async function excluir(usuario) {
    if (!window.confirm(`Excluir o usuário "${usuario.nome}"? Esta ação não pode ser desfeita.`)) {
      return
    }
    setErro('')
    setSucesso('')
    try {
      await excluirUsuario(usuario.id)
      setUsuarios((atuais) => atuais.filter((u) => u.id !== usuario.id))
      setSucesso(`Usuário "${usuario.nome}" excluído com sucesso.`)

      if (usuario.id === usuarioLogado.id) {
        sair()
      }
    } catch (falha) {
      setErro(extrairMensagemErro(falha))
    }
  }

  return (
    <section>
      <CabecalhoPagina titulo="Usuários" descricao="Pessoas cadastradas no sistema">
        <Link to="/usuarios/novo" className="botao botao-primario">
          + Novo usuário
        </Link>
      </CabecalhoPagina>

      <Mensagem tipo="sucesso" onFechar={() => setSucesso('')}>
        {sucesso}
      </Mensagem>
      <Mensagem tipo="erro" onFechar={() => setErro('')}>
        {erro}
      </Mensagem>

      {carregando ? (
        <p className="texto-suave">Carregando usuários...</p>
      ) : (
        <div className="cartao">
          <Tabela
            colunas={COLUNAS}
            dados={usuarios}
            onEditar={(usuario) => navegar(`/usuarios/${usuario.id}/editar`)}
            onExcluir={excluir}
            mensagemVazia="Nenhum usuário cadastrado."
          />
        </div>
      )}
    </section>
  )
}

export default ListaUsuarios
