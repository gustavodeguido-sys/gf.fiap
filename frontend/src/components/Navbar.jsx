import { NavLink } from 'react-router-dom'

function Navbar({ titulo, sigla, links = [], nomeUsuario, onSair }) {
  return (
    <header className="navbar">
      <NavLink to="/" className="marca">
        <span className="marca-icone" aria-hidden="true">{sigla}</span>
        {titulo}
      </NavLink>

      {links.length > 0 && (
        <nav className="navbar-links" aria-label="Navegação principal">
          {links.map((link) => (
            <NavLink
              key={link.para}
              to={link.para}
              end={link.para === '/'}
              className={({ isActive }) => (isActive ? 'navbar-link ativo' : 'navbar-link')}
            >
              {link.rotulo}
            </NavLink>
          ))}
        </nav>
      )}

      {(nomeUsuario || onSair) && (
        <div className="navbar-usuario">
          {nomeUsuario && (
            <span className="navbar-saudacao">
              Olá, <strong>{nomeUsuario}</strong>
            </span>
          )}
          {onSair && (
            <button type="button" className="botao botao-secundario" onClick={onSair}>
              Sair
            </button>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar
