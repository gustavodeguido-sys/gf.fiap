import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CabecalhoPagina from '../../components/CabecalhoPagina.jsx'
import CampoFormulario from '../../components/CampoFormulario.jsx'
import Mensagem from '../../components/Mensagem.jsx'
import { OPCOES_TIPO_INVESTIMENTO, TIPOS_SEM_VENCIMENTO } from '../../constantes'
import { extrairMensagemErro, interpretarErroApi } from '../../services/api'
import { listarContas } from '../../services/contaService'
import {
  atualizarInvestimento,
  buscarInvestimento,
  criarInvestimento,
} from '../../services/investimentoService'
import { listarUsuarios } from '../../services/usuarioService'
import { descreverConta, formatarMoeda } from '../../utils/formatadores'
import { numeroOuNulo, textoOuNulo } from '../../utils/formularios'

const FORMULARIO_VAZIO = {
  idConta: '',
  nome: '',
  tipo: '',
  valorAplicado: '',
  taxaRentabilidade: '',
  dataAplicacao: '',
  dataVencimento: '',
}

function FormularioInvestimento() {
  const { id } = useParams()
  const ehEdicao = Boolean(id)
  const navegar = useNavigate()

  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO)
  const [valorOriginal, setValorOriginal] = useState(0)
  const [contas, setContas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [falhaCarregamento, setFalhaCarregamento] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [errosCampos, setErrosCampos] = useState({})

  useEffect(() => {
    let cancelado = false

    Promise.all([
      listarContas(),
      listarUsuarios(),
      ehEdicao ? buscarInvestimento(id) : Promise.resolve(null),
    ])
      .then(([listaContas, listaUsuarios, investimento]) => {
        if (cancelado) return
        setContas(listaContas)
        setUsuarios(listaUsuarios)
        if (investimento) {
          setFormulario({
            idConta: String(investimento.idConta),
            nome: investimento.nome,
            tipo: investimento.tipo,
            valorAplicado: String(investimento.valorAplicado),
            taxaRentabilidade: String(investimento.taxaRentabilidade),
            dataAplicacao: investimento.dataAplicacao,
            dataVencimento: investimento.dataVencimento ?? '',
          })
          setValorOriginal(Number(investimento.valorAplicado))
        }
      })
      .catch((falha) => !cancelado && setFalhaCarregamento(extrairMensagemErro(falha)))
      .finally(() => !cancelado && setCarregando(false))

    return () => {
      cancelado = true
    }
  }, [id, ehEdicao])

  const semVencimento = TIPOS_SEM_VENCIMENTO.includes(formulario.tipo)

  function alterarCampo(evento) {
    const { name, value } = evento.target
    setFormulario((atual) => {
      const novo = { ...atual, [name]: value }
      if (name === 'tipo' && TIPOS_SEM_VENCIMENTO.includes(value)) {
        novo.dataVencimento = ''
      }
      return novo
    })
    setErrosCampos((atuais) => ({ ...atuais, [name]: undefined }))
  }

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')
    setErrosCampos({})
    setEnviando(true)

    const dados = {
      idConta: numeroOuNulo(formulario.idConta),
      nome: textoOuNulo(formulario.nome),
      tipo: textoOuNulo(formulario.tipo),
      valorAplicado: numeroOuNulo(formulario.valorAplicado),
      taxaRentabilidade: numeroOuNulo(formulario.taxaRentabilidade),
      dataAplicacao: textoOuNulo(formulario.dataAplicacao),
      dataVencimento: semVencimento ? null : textoOuNulo(formulario.dataVencimento),
    }

    try {
      if (ehEdicao) {
        await atualizarInvestimento(id, dados)
        navegar('/investimentos', { state: { mensagemSucesso: 'Investimento atualizado com sucesso.' } })
      } else {
        await criarInvestimento(dados)
        navegar('/investimentos', { state: { mensagemSucesso: 'Investimento criado com sucesso.' } })
      }
    } catch (falha) {
      const { mensagem, campos } = interpretarErroApi(falha)
      setErro(mensagem)
      setErrosCampos(campos)
      setEnviando(false)
    }
  }

  const titulo = ehEdicao ? 'Editar investimento' : 'Novo investimento'

  if (carregando) {
    return <p className="texto-suave">Carregando...</p>
  }

  if (falhaCarregamento) {
    return (
      <section>
        <CabecalhoPagina titulo={titulo} />
        <Mensagem tipo="erro">{falhaCarregamento}</Mensagem>
        <Link to="/investimentos" className="botao botao-secundario">
          Voltar para a lista
        </Link>
      </section>
    )
  }

  const nomePorId = Object.fromEntries(usuarios.map((u) => [u.id, u.nome]))
  const opcoesContas = contas.map((c) => ({
    valor: String(c.id),
    rotulo: `${descreverConta(c)} — ${nomePorId[c.idUsuario] ?? 'titular #' + c.idUsuario}`,
  }))

  const contaSelecionada = contas.find((c) => String(c.id) === formulario.idConta)
  const ajudaConta = contaSelecionada
    ? ehEdicao
      ? `Saldo da conta: ${formatarMoeda(contaSelecionada.saldo)} + ${formatarMoeda(valorOriginal)} já aplicados neste investimento.`
      : `Saldo disponível: ${formatarMoeda(contaSelecionada.saldo)}`
    : undefined

  return (
    <section>
      <CabecalhoPagina
        titulo={titulo}
        descricao={ehEdicao ? 'Altere os dados do investimento' : 'O valor aplicado sai do saldo da conta escolhida'}
      />

      <form className="cartao formulario" onSubmit={aoEnviar} noValidate>
        <Mensagem tipo="erro" onFechar={() => setErro('')}>
          {erro}
        </Mensagem>

        <div className="formulario-grade">
          <CampoFormulario
            rotulo="Conta"
            nome="idConta"
            tipo="select"
            valor={formulario.idConta}
            onChange={alterarCampo}
            erro={errosCampos.idConta}
            opcoes={opcoesContas}
            disabled={ehEdicao}
            ajuda={ajudaConta}
            largo
          />

          <CampoFormulario
            rotulo="Nome do investimento"
            nome="nome"
            valor={formulario.nome}
            onChange={alterarCampo}
            erro={errosCampos.nome}
            placeholder="Ex.: CDB Banco X 2028"
            maxLength={100}
          />

          <CampoFormulario
            rotulo="Tipo"
            nome="tipo"
            tipo="select"
            valor={formulario.tipo}
            onChange={alterarCampo}
            erro={errosCampos.tipo}
            opcoes={OPCOES_TIPO_INVESTIMENTO}
          />

          <CampoFormulario
            rotulo="Valor aplicado (R$)"
            nome="valorAplicado"
            tipo="number"
            valor={formulario.valorAplicado}
            onChange={alterarCampo}
            erro={errosCampos.valorAplicado}
            min="0.01"
            step="0.01"
          />

          <CampoFormulario
            rotulo="Rentabilidade (% ao ano)"
            nome="taxaRentabilidade"
            tipo="number"
            valor={formulario.taxaRentabilidade}
            onChange={alterarCampo}
            erro={errosCampos.taxaRentabilidade}
            placeholder="Ex.: 11.5"
            min="0"
            step="0.0001"
          />

          <CampoFormulario
            rotulo="Data de aplicação"
            nome="dataAplicacao"
            tipo="date"
            valor={formulario.dataAplicacao}
            onChange={alterarCampo}
            erro={errosCampos.dataAplicacao}
            ajuda="Opcional. Se ficar em branco, usa a data de hoje."
          />

          <CampoFormulario
            rotulo="Data de vencimento"
            nome="dataVencimento"
            tipo="date"
            valor={formulario.dataVencimento}
            onChange={alterarCampo}
            erro={errosCampos.dataVencimento}
            disabled={semVencimento}
            ajuda={
              semVencimento
                ? 'Ações e fundos não têm data de vencimento.'
                : 'Obrigatória para renda fixa (CDB, LCI, LCA, Tesouro).'
            }
          />
        </div>

        <div className="formulario-acoes">
          <Link to="/investimentos" className="botao botao-secundario">
            Cancelar
          </Link>
          <button type="submit" className="botao botao-primario" disabled={enviando}>
            {enviando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default FormularioInvestimento
