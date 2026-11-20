import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CabecalhoPagina from '../../components/CabecalhoPagina.jsx'
import Mensagem from '../../components/Mensagem.jsx'
import Tabela from '../../components/Tabela.jsx'
import { ROTULOS_TIPO_INVESTIMENTO } from '../../constantes'
import { extrairMensagemErro } from '../../services/api'
import { listarContas } from '../../services/contaService'
import { excluirInvestimento, listarInvestimentos } from '../../services/investimentoService'
import { descreverConta, formatarData, formatarMoeda, formatarTaxa } from '../../utils/formatadores'

function ListaInvestimentos() {
  const navegar = useNavigate()
  const local = useLocation()

  const [investimentos, setInvestimentos] = useState([])
  const [contas, setContas] = useState([])
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

    Promise.all([listarInvestimentos(), listarContas()])
      .then(([listaInvestimentos, listaContas]) => {
        if (cancelado) return
        setInvestimentos(listaInvestimentos)
        setContas(listaContas)
      })
      .catch((falha) => !cancelado && setErro(extrairMensagemErro(falha)))
      .finally(() => !cancelado && setCarregando(false))

    return () => {
      cancelado = true
    }
  }, [])

  const colunas = useMemo(() => {
    const contaPorId = Object.fromEntries(contas.map((c) => [c.id, c]))
    return [
      { chave: 'nome', titulo: 'Nome' },
      { chave: 'tipo', titulo: 'Tipo', formatar: (tipo) => ROTULOS_TIPO_INVESTIMENTO[tipo] ?? tipo },
      { chave: 'idConta', titulo: 'Conta', formatar: (idConta) => descreverConta(contaPorId[idConta]) },
      { chave: 'valorAplicado', titulo: 'Valor aplicado', formatar: formatarMoeda, alinhamento: 'direita' },
      { chave: 'taxaRentabilidade', titulo: 'Taxa', formatar: formatarTaxa, alinhamento: 'direita' },
      { chave: 'dataAplicacao', titulo: 'Aplicação', formatar: formatarData },
      { chave: 'dataVencimento', titulo: 'Vencimento', formatar: formatarData },
    ]
  }, [contas])

  async function excluir(investimento) {
    const confirmou = window.confirm(
      `Excluir "${investimento.nome}"?\n\n` +
        `O valor aplicado (${formatarMoeda(investimento.valorAplicado)}) volta para o saldo da conta.`,
    )
    if (!confirmou) return

    setErro('')
    setSucesso('')
    try {
      await excluirInvestimento(investimento.id)
      setInvestimentos((atuais) => atuais.filter((i) => i.id !== investimento.id))
      setSucesso(`Investimento "${investimento.nome}" excluído e valor devolvido à conta.`)
    } catch (falha) {
      setErro(extrairMensagemErro(falha))
    }
  }

  return (
    <section>
      <CabecalhoPagina titulo="Investimentos" descricao="Aplicações de todas as contas">
        <Link to="/investimentos/novo" className="botao botao-primario">
          + Novo investimento
        </Link>
      </CabecalhoPagina>

      <Mensagem tipo="sucesso" onFechar={() => setSucesso('')}>
        {sucesso}
      </Mensagem>
      <Mensagem tipo="erro" onFechar={() => setErro('')}>
        {erro}
      </Mensagem>

      {carregando ? (
        <p className="texto-suave">Carregando investimentos...</p>
      ) : (
        <div className="cartao">
          <Tabela
            colunas={colunas}
            dados={investimentos}
            onEditar={(investimento) => navegar(`/investimentos/${investimento.id}/editar`)}
            onExcluir={excluir}
            mensagemVazia="Nenhum investimento cadastrado."
          />
        </div>
      )}
    </section>
  )
}

export default ListaInvestimentos
