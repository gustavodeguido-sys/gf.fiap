import { useEffect, useState } from 'react'
import CabecalhoPagina from '../components/CabecalhoPagina.jsx'
import Mensagem from '../components/Mensagem.jsx'
import Tabela from '../components/Tabela.jsx'
import { ROTULOS_TIPO_CONTA } from '../constantes'
import { useAuth } from '../context/contextoAuth.js'
import { extrairMensagemErro } from '../services/api'
import { listarContas } from '../services/contaService'
import { listarInvestimentos } from '../services/investimentoService'
import { formatarData, formatarMoeda } from '../utils/formatadores'

const COLUNAS_CONTAS = [
  { chave: 'nomeBanco', titulo: 'Banco' },
  { chave: 'agencia', titulo: 'Agência' },
  { chave: 'numeroConta', titulo: 'Conta' },
  { chave: 'tipo', titulo: 'Tipo', formatar: (tipo) => ROTULOS_TIPO_CONTA[tipo] ?? tipo },
  { chave: 'dataAbertura', titulo: 'Abertura', formatar: formatarData },
  { chave: 'saldo', titulo: 'Saldo', formatar: formatarMoeda, alinhamento: 'direita' },
]

function somar(lista, campo) {
  return lista.reduce((total, item) => total + Number(item[campo]), 0)
}

function Home() {
  const { usuario, sair } = useAuth()
  const [resumo, setResumo] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let cancelado = false

    async function carregarResumo() {
      try {
        const contas = await listarContas(usuario.id)

        const listas = await Promise.all(contas.map((conta) => listarInvestimentos(conta.id)))
        const investimentos = listas.flat()

        if (!cancelado) {
          setResumo({
            contas,
            totalContas: contas.length,
            totalInvestimentos: investimentos.length,
            saldoTotal: somar(contas, 'saldo'),
            totalInvestido: somar(investimentos, 'valorAplicado'),
          })
        }
      } catch (falha) {
        if (cancelado) return
        if (falha.response?.status === 404) {
          sair()
          return
        }
        setErro(extrairMensagemErro(falha))
      }
    }

    carregarResumo()
    return () => {
      cancelado = true
    }
  }, [usuario.id, sair])

  return (
    <section>
      <CabecalhoPagina titulo="Resumo" descricao="Visão geral das suas contas e investimentos" />

      <Mensagem tipo="erro">{erro}</Mensagem>

      {!resumo && !erro && <p className="texto-suave">Carregando resumo...</p>}

      {resumo && (
        <>
          <div className="grade-resumo">
            <article className="cartao cartao-resumo">
              <span className="rotulo-resumo">Contas bancárias</span>
              <strong className="valor-resumo">{resumo.totalContas}</strong>
            </article>

            <article className="cartao cartao-resumo">
              <span className="rotulo-resumo">Investimentos</span>
              <strong className="valor-resumo">{resumo.totalInvestimentos}</strong>
            </article>

            <article className="cartao cartao-resumo">
              <span className="rotulo-resumo">Saldo em conta</span>
              <strong className="valor-resumo">{formatarMoeda(resumo.saldoTotal)}</strong>
            </article>

            <article className="cartao cartao-resumo">
              <span className="rotulo-resumo">Total investido</span>
              <strong className="valor-resumo">{formatarMoeda(resumo.totalInvestido)}</strong>
            </article>
          </div>

          <div className="cartao secao">
            <h2>Suas contas</h2>
            <Tabela
              colunas={COLUNAS_CONTAS}
              dados={resumo.contas}
              mensagemVazia="Você ainda não tem contas cadastradas."
            />
          </div>
        </>
      )}
    </section>
  )
}

export default Home
