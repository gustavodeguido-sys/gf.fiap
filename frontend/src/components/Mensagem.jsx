function Mensagem({ tipo = 'erro', children, onFechar }) {
  if (!children) {
    return null
  }

  const ehSucesso = tipo === 'sucesso'

  return (
    <div className={`mensagem mensagem-${ehSucesso ? 'sucesso' : 'erro'}`} role={ehSucesso ? 'status' : 'alert'}>
      <span className="mensagem-icone" aria-hidden="true">
        {ehSucesso ? '✓' : '!'}
      </span>
      <div className="mensagem-texto">{children}</div>
      {onFechar && (
        <button type="button" className="mensagem-fechar" onClick={onFechar} aria-label="Fechar mensagem">
          ×
        </button>
      )}
    </div>
  )
}

export default Mensagem
