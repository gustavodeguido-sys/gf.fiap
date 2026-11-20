import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CabecalhoPagina from '../../components/CabecalhoPagina.jsx'
import CampoFormulario from '../../components/CampoFormulario.jsx'
import Mensagem from '../../components/Mensagem.jsx'
import { useAuth } from '../../context/contextoAuth.js'
import { extrairMensagemErro, interpretarErroApi } from '../../services/api'
import { atualizarUsuario, buscarUsuario, criarUsuario } from '../../services/usuarioService'
import { textoOuNulo } from '../../utils/formularios'

const FORMULARIO_VAZIO = {
  nome: '',
  email: '',
  senha: '',
  cpf: '',
  dataNascimento: '',
}

function FormularioUsuario() {
  const { id } = useParams()
  const ehEdicao = Boolean(id)
  const navegar = useNavigate()
  const { usuario: usuarioLogado, atualizarSessao } = useAuth()

  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO)
  const [carregando, setCarregando] = useState(ehEdicao)
  const [falhaCarregamento, setFalhaCarregamento] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [errosCampos, setErrosCampos] = useState({})

  useEffect(() => {
    if (!ehEdicao) return
    let cancelado = false

    buscarUsuario(id)
      .then((usuario) => {
        if (cancelado) return
        setFormulario({
          nome: usuario.nome,
          email: usuario.email,
          senha: '',
          cpf: usuario.cpf,
          dataNascimento: usuario.dataNascimento,
        })
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
      nome: textoOuNulo(formulario.nome),
      email: textoOuNulo(formulario.email),
      senha: formulario.senha === '' ? null : formulario.senha,
      cpf: textoOuNulo(formulario.cpf),
      dataNascimento: textoOuNulo(formulario.dataNascimento),
    }

    try {
      if (ehEdicao) {
        const atualizado = await atualizarUsuario(id, dados)
        if (atualizado.id === usuarioLogado.id) {
          atualizarSessao(atualizado)
        }
        navegar('/usuarios', { state: { mensagemSucesso: 'Usuário atualizado com sucesso.' } })
      } else {
        await criarUsuario(dados)
        navegar('/usuarios', { state: { mensagemSucesso: 'Usuário criado com sucesso.' } })
      }
    } catch (falha) {
      const { mensagem, campos } = interpretarErroApi(falha)
      setErro(mensagem)
      setErrosCampos(campos)
      setEnviando(false)
    }
  }

  const titulo = ehEdicao ? 'Editar usuário' : 'Novo usuário'

  if (carregando) {
    return <p className="texto-suave">Carregando usuário...</p>
  }

  if (falhaCarregamento) {
    return (
      <section>
        <CabecalhoPagina titulo={titulo} />
        <Mensagem tipo="erro">{falhaCarregamento}</Mensagem>
        <Link to="/usuarios" className="botao botao-secundario">
          Voltar para a lista
        </Link>
      </section>
    )
  }

  return (
    <section>
      <CabecalhoPagina
        titulo={titulo}
        descricao={ehEdicao ? 'Altere os dados e salve' : 'Preencha os dados do novo usuário'}
      />

      <form className="cartao formulario" onSubmit={aoEnviar} noValidate>
        <Mensagem tipo="erro" onFechar={() => setErro('')}>
          {erro}
        </Mensagem>

        <div className="formulario-grade">
          <CampoFormulario
            rotulo="Nome completo"
            nome="nome"
            valor={formulario.nome}
            onChange={alterarCampo}
            erro={errosCampos.nome}
            maxLength={100}
            largo
          />

          <CampoFormulario
            rotulo="E-mail"
            nome="email"
            tipo="email"
            valor={formulario.email}
            onChange={alterarCampo}
            erro={errosCampos.email}
            maxLength={150}
            autoComplete="off"
          />

          <CampoFormulario
            rotulo={ehEdicao ? 'Senha (atual ou nova)' : 'Senha'}
            nome="senha"
            tipo="password"
            valor={formulario.senha}
            onChange={alterarCampo}
            erro={errosCampos.senha}
            ajuda={ehEdicao ? 'A API exige a senha também na edição. Mínimo de 8 caracteres.' : 'Mínimo de 8 caracteres.'}
            autoComplete="new-password"
          />

          <CampoFormulario
            rotulo="CPF"
            nome="cpf"
            valor={formulario.cpf}
            onChange={alterarCampo}
            erro={errosCampos.cpf}
            placeholder="000.000.000-00"
            maxLength={14}
          />

          <CampoFormulario
            rotulo="Data de nascimento"
            nome="dataNascimento"
            tipo="date"
            valor={formulario.dataNascimento}
            onChange={alterarCampo}
            erro={errosCampos.dataNascimento}
          />
        </div>

        <div className="formulario-acoes">
          <Link to="/usuarios" className="botao botao-secundario">
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

export default FormularioUsuario
