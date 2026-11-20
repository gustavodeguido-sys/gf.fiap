import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CabecalhoPagina from '../../components/CabecalhoPagina.jsx'
import CampoFormulario from '../../components/CampoFormulario.jsx'
import Mensagem from '../../components/Mensagem.jsx'
import { OPCOES_TIPO_CONTA } from '../../constantes'
import { useAuth } from '../../context/contextoAuth.js'
import { extrairMensagemErro, interpretarErroApi } from '../../services/api'
import { atualizarConta, buscarConta, criarConta } from '../../services/contaService'
import { listarUsuarios } from '../../services/usuarioService'
import { formatarMoeda } from '../../utils/formatadores'
import { numeroOuNulo, textoOuNulo } from '../../utils/formularios'

function FormularioConta() {
  const { id } = useParams()
  const ehEdicao = Boolean(id)
  const navegar = useNavigate()
  const { usuario: usuarioLogado } = useAuth()

  const [formulario, setFormulario] = useState({
    idUsuario: String(usuarioLogado.id),
    nomeBanco: '',
    agencia: '',
    numeroConta: '',
    tipo: '',
    saldoInicial: '',
    dataAbertura: '',
  })
  const [saldoAtual, setSaldoAtual] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [falhaCarregamento, setFalhaCarregamento] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [errosCampos, setErrosCampos] = useState({})

  useEffect(() => {
    let cancelado = false

    Promise.all([listarUsuarios(), ehEdicao ? buscarConta(id) : Promise.resolve(null)])
      .then(([listaUsuarios, conta]) => {
        if (cancelado) return
        setUsuarios(listaUsuarios)
        if (conta) {
          setFormulario({
            idUsuario: String(conta.idUsuario),
            nomeBanco: conta.nomeBanco,
            agencia: conta.agencia,
            numeroConta: conta.numeroConta,
            tipo: conta.tipo,
            saldoInicial: '',
            dataAbertura: conta.dataAbertura,
          })
          setSaldoAtual(conta.saldo)
        }
      })
      .catch((falha) => !cancelado && setFalhaCarregamento(extrairMensagemErro(falha)))
      .finally(() => !cancelado && setCarregando(false))

    return () => {
      cancelado = true
    }
  }, [id, ehEdicao])

  function alterarCampo(evento) {
    const { name, value } = evento.target
    setFormulario((atual) => ({ ...atual, [name]: value }))
    setErrosCampos((atuais) => ({ ...atuais, [name]: undefined }))
  }

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')
    setErrosCampos({})
    setEnviando(true)

    const dados = {
      idUsuario: numeroOuNulo(formulario.idUsuario),
      nomeBanco: textoOuNulo(formulario.nomeBanco),
      agencia: textoOuNulo(formulario.agencia),
      numeroConta: textoOuNulo(formulario.numeroConta),
      tipo: textoOuNulo(formulario.tipo),
      saldoInicial: numeroOuNulo(formulario.saldoInicial),
      dataAbertura: textoOuNulo(formulario.dataAbertura),
    }

    try {
      if (ehEdicao) {
        await atualizarConta(id, dados)
        navegar('/contas', { state: { mensagemSucesso: 'Conta atualizada com sucesso.' } })
      } else {
        await criarConta(dados)
        navegar('/contas', { state: { mensagemSucesso: 'Conta criada com sucesso.' } })
      }
    } catch (falha) {
      const { mensagem, campos } = interpretarErroApi(falha)
      setErro(mensagem)
      setErrosCampos(campos)
      setEnviando(false)
    }
  }

  const titulo = ehEdicao ? 'Editar conta' : 'Nova conta'

  if (carregando) {
    return <p className="texto-suave">Carregando...</p>
  }

  if (falhaCarregamento) {
    return (
      <section>
        <CabecalhoPagina titulo={titulo} />
        <Mensagem tipo="erro">{falhaCarregamento}</Mensagem>
        <Link to="/contas" className="botao botao-secundario">
          Voltar para a lista
        </Link>
      </section>
    )
  }

  const opcoesUsuarios = usuarios.map((u) => ({ valor: String(u.id), rotulo: `${u.nome} (${u.email})` }))

  return (
    <section>
      <CabecalhoPagina
        titulo={titulo}
        descricao={ehEdicao ? 'Altere os dados cadastrais da conta' : 'Preencha os dados da nova conta'}
      />

      <form className="cartao formulario" onSubmit={aoEnviar} noValidate>
        <Mensagem tipo="erro" onFechar={() => setErro('')}>
          {erro}
        </Mensagem>

        <div className="formulario-grade">
          <CampoFormulario
            rotulo="Titular"
            nome="idUsuario"
            tipo="select"
            valor={formulario.idUsuario}
            onChange={alterarCampo}
            erro={errosCampos.idUsuario}
            opcoes={opcoesUsuarios}
            disabled={ehEdicao}
            ajuda={ehEdicao ? 'O titular não pode ser alterado depois da criação.' : undefined}
            largo
          />

          <CampoFormulario
            rotulo="Banco"
            nome="nomeBanco"
            valor={formulario.nomeBanco}
            onChange={alterarCampo}
            erro={errosCampos.nomeBanco}
            placeholder="Ex.: Nubank"
            maxLength={100}
          />

          <CampoFormulario
            rotulo="Tipo de conta"
            nome="tipo"
            tipo="select"
            valor={formulario.tipo}
            onChange={alterarCampo}
            erro={errosCampos.tipo}
            opcoes={OPCOES_TIPO_CONTA}
          />

          <CampoFormulario
            rotulo="Agência"
            nome="agencia"
            valor={formulario.agencia}
            onChange={alterarCampo}
            erro={errosCampos.agencia}
            placeholder="0001"
            maxLength={10}
          />

          <CampoFormulario
            rotulo="Número da conta"
            nome="numeroConta"
            valor={formulario.numeroConta}
            onChange={alterarCampo}
            erro={errosCampos.numeroConta}
            placeholder="12345-6"
            maxLength={20}
          />

          {ehEdicao ? (
            <div className="campo campo-largo">
              <span className="campo-rotulo">Saldo atual</span>
              <strong className="valor-destaque">{formatarMoeda(saldoAtual)}</strong>
              <span className="campo-ajuda">O saldo muda apenas por depósito, saque ou investimento.</span>
            </div>
          ) : (
            <>
              <CampoFormulario
                rotulo="Saldo inicial (R$)"
                nome="saldoInicial"
                tipo="number"
                valor={formulario.saldoInicial}
                onChange={alterarCampo}
                erro={errosCampos.saldoInicial}
                ajuda="Opcional. Se ficar em branco, a conta abre com saldo zero."
                min="0"
                step="0.01"
              />

              <CampoFormulario
                rotulo="Data de abertura"
                nome="dataAbertura"
                tipo="date"
                valor={formulario.dataAbertura}
                onChange={alterarCampo}
                erro={errosCampos.dataAbertura}
                ajuda="Opcional. Se ficar em branco, usa a data de hoje."
              />
            </>
          )}
        </div>

        <div className="formulario-acoes">
          <Link to="/contas" className="botao botao-secundario">
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

export default FormularioConta
