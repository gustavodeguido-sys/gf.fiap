import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="pagina-centralizada">
      <div className="cartao cartao-nao-encontrado">
        <span className="codigo-erro">404</span>
        <h1>Página não encontrada</h1>
        <p className="texto-suave">
          O endereço que você acessou não existe ou foi removido.
        </p>
        <Link to="/" className="botao botao-primario">
          Voltar para o início
        </Link>
      </div>
    </div>
  )
}

export default NotFound
