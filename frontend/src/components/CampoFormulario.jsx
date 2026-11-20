import { useId } from 'react'

function CampoFormulario({
  rotulo,
  nome,
  tipo = 'text',
  valor,
  onChange,
  erro,
  ajuda,
  opcoes = [],
  largo = false,
  ...resto
}) {
  const id = useId()
  const idDescricao = `${id}-descricao`

  const propsDoCampo = {
    id,
    name: nome,
    value: valor ?? '',
    onChange,
    'aria-invalid': erro ? true : undefined,
    'aria-describedby': erro || ajuda ? idDescricao : undefined,
    ...resto,
  }

  const opcoesNormalizadas = opcoes.map((opcao) =>
    typeof opcao === 'string' ? { valor: opcao, rotulo: opcao } : opcao,
  )

  const classes = ['campo', erro && 'campo-com-erro', largo && 'campo-largo'].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <label htmlFor={id}>{rotulo}</label>

      {tipo === 'select' ? (
        <select {...propsDoCampo}>
          <option value="">Selecione...</option>
          {opcoesNormalizadas.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
      ) : (
        <input type={tipo} {...propsDoCampo} />
      )}

      {erro ? (
        <span id={idDescricao} className="campo-erro">
          {erro}
        </span>
      ) : (
        ajuda && (
          <span id={idDescricao} className="campo-ajuda">
            {ajuda}
          </span>
        )
      )}
    </div>
  )
}

export default CampoFormulario
