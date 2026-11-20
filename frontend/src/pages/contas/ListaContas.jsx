import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CabecalhoPagina from '../../components/CabecalhoPagina.jsx'
import Mensagem from '../../components/Mensagem.jsx'
import Tabela from '../../components/Tabela.jsx'
import { ROTULOS_TIPO_CONTA } from '../../constantes'
import { extrairMensagemErro } from '../../services/api'
import { excluirConta, listarContas } from '../../services/contaService'
import { listarUsuarios } from '../../services/usuarioService'
import { descreverConta, formatarData, formatarMoeda } from '../../utils/formatadores'

function ListaContas() {
  const navegar = useNavigate()
  const local = useLocation()

  const [contas, setContas] = useState([])
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

    Promise.all([listarContas(), listarUsuarios()])
      .then(([listaContas, listaUsuarios]) => {
        if (cancelado) return
        setContas(listaContas)
        setUsuarios(listaUsuarios)
      })
      .catch((falha) => !cancelado && setErro(extrairMensagemErro(falha)))
      .finally(() => !cancelado && setCarregando(false))

    return () => {
      cancelado = true
    }
  }, [])

  const colunas = useMemo(() => {
    const nomePorId = Object.fromEntries(usuarios.map((u) => [u.id, u.nome]))
    return [
      { chave: 'idUsuario', titulo: 'Titular', formatar: (idUsuario) => nomePorId[idUsuario] ?? `#${idUsuario}` },
      { chave: 'nomeBanco', titulo: 'Banco' },
      { chave: 'agencia', titulo: 'Agência' },
      { chave: 'numeroConta', titulo: 'Conta' },
      { chave: 'tipo', titulo: 'Tipo', formatar: (tipo) => ROTULOS_TIPO_CONTA[tipo] ?? tipo },
      { chave: 'dataAbertura', titulo: 'Abertura', formatar: formatarData },
      { chave: 'saldo', titulo: 'Saldo', formatar: formatarMoeda, alinhamento: 'direita' },
    ]
  }, [usuarios])

  async function excluir(conta) {
    if (!window.confirm(`Excluir a conta "${descreverConta(conta)}"?`)) {
      return
    }
    setErro('')
    setSucesso('')
    try {
      await excluirConta(conta.id)
      setContas((atuais) => atuais.filter((c) => c.id !== conta.id))
      setSucesso('Conta excluída com sucesso.')
    } catch (falha) {
      setErro(extrairMensagemErro(falha))
    }
  }

  return (
    <section>
      <CabecalhoPagina titulo="Contas bancárias" descricao="Contas de todos os usuários">
        <Link to="/contas/novo" className="botao botao-primario">
          + Nova conta
        </Link>
      </CabecalhoPagina>

      <Mensagem tipo="sucesso" onFechar={() => setSucesso('')}>
        {sucesso}
      </Mensagem>
      <Mensagem tipo="erro" onFechar={() => setErro('')}>
        {erro}
      </Mensagem>

      {carregando ? (
        <p className="texto-suave">Carregando contas...</p>
      ) : (
        <div className="cartao">
          <Tabela
            colunas={colunas}
            dados={contas}
            onEditar={(conta) => navegar(`/contas/${conta.id}/editar`)}
            onExcluir={excluir}
            mensagemVazia="Nenhuma conta cadastrada."
          />
        </div>
      )}
    </section>
  )
}

export default ListaContas
