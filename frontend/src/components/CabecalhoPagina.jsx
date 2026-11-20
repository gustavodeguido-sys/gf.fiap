function CabecalhoPagina({ titulo, descricao, children }) {
  return (
    <div className="cabecalho-pagina">
      <div className="titulo-pagina">
        <h1>{titulo}</h1>
        {descricao && <p className="texto-suave">{descricao}</p>}
      </div>
      {children && <div className="cabecalho-pagina-acoes">{children}</div>}
    </div>
  )
}

export default CabecalhoPagina
