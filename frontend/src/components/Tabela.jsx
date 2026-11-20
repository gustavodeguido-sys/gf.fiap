function Tabela({
  colunas,
  dados,
  onEditar,
  onExcluir,
  chaveLinha = 'id',
  mensagemVazia = 'Nenhum registro encontrado.',
}) {
  const temAcoes = Boolean(onEditar || onExcluir)

  if (!dados || dados.length === 0) {
    return <p className="tabela-vazia">{mensagemVazia}</p>
  }

  function classeAlinhamento(coluna) {
    return coluna.alinhamento === 'direita' ? 'alinhar-direita' : undefined
  }

  return (
    <div className="tabela-container">
      <table className="tabela">
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna.chave} scope="col" className={classeAlinhamento(coluna)}>
                {coluna.titulo}
              </th>
            ))}
            {temAcoes && (
              <th scope="col" className="alinhar-direita">
                Ações
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {dados.map((linha) => (
            <tr key={linha[chaveLinha]}>
              {colunas.map((coluna) => {
                const valor = linha[coluna.chave]
                return (
                  <td key={coluna.chave} className={classeAlinhamento(coluna)}>
                    {coluna.formatar ? coluna.formatar(valor, linha) : (valor ?? '—')}
                  </td>
                )
              })}

              {temAcoes && (
                <td className="tabela-acoes">
                  {onEditar && (
                    <button
                      type="button"
                      className="botao botao-pequeno botao-secundario"
                      onClick={() => onEditar(linha)}
                    >
                      Editar
                    </button>
                  )}
                  {onExcluir && (
                    <button
                      type="button"
                      className="botao botao-pequeno botao-perigo"
                      onClick={() => onExcluir(linha)}
                    >
                      Excluir
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Tabela
