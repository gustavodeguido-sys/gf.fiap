export const NOME_SISTEMA = 'Sistema M1'
export const SIGLA_SISTEMA = 'M1'

export const ROTULOS_TIPO_CONTA = {
  CORRENTE: 'Conta corrente',
  POUPANCA: 'Poupança',
  INVESTIMENTO: 'Investimento',
}

export const OPCOES_TIPO_CONTA = Object.entries(ROTULOS_TIPO_CONTA).map(([valor, rotulo]) => ({ valor, rotulo }))

export const TIPOS_SEM_VENCIMENTO = ['ACOES', 'FUNDO']

export const ROTULOS_TIPO_INVESTIMENTO = {
  CDB: 'CDB',
  LCI: 'LCI',
  LCA: 'LCA',
  TESOURO_DIRETO: 'Tesouro Direto',
  ACOES: 'Ações',
  FUNDO: 'Fundo',
}

export const OPCOES_TIPO_INVESTIMENTO = Object.entries(ROTULOS_TIPO_INVESTIMENTO).map(
  ([valor, rotulo]) => ({ valor, rotulo }),
)
