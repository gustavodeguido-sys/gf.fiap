# Sistema M1 — Fintech FIAP

Sistema para gerenciar usuários, suas contas bancárias e os investimentos de cada conta.

- **backend/**: API REST em Spring Boot 4 (Java 21) com banco Oracle
- **frontend/**: aplicação React 19 criada com Vite

```
Usuario 1 ──── N ContaBancaria 1 ──── N Investimento
```

## Usuário de teste (login)

| Campo  | Valor                     |
|--------|---------------------------|
| E-mail | `gustavodeguido@gmail.com` |
| Senha  | `Senha@123`               |

Esse usuário já existe no banco Oracle do aluno. Se o projeto for executado com **outro** usuário Oracle, as tabelas começam sem ele. Nesse caso, crie-o pela API, como mostra a seção [Criar o usuário de teste](#4-criar-o-usuário-de-teste-só-se-ele-não-existir-no-banco), e depois faça o login.

> Os usuários de exemplo inseridos pelo `create_tables.sql` (Ana, Bruno, Carla) **não conseguem fazer login**: a senha deles no script não está no formato BCrypt que a API exige.

## Pré-requisitos

- **JDK 21** (ex.: Eclipse Temurin 21), com a variável `JAVA_HOME` configurada
- **Node.js 20.19 ou superior** (recomendado 22 LTS) e npm
- Acesso a um banco **Oracle 12c ou superior** (ex.: `oracle.fiap.com.br`)

O Maven não precisa ser instalado: o projeto usa o Maven Wrapper (`mvnw`).

## Como executar

Os passos abaixo usam o PowerShell (Windows). Os comandos equivalentes para Linux/macOS estão em cada passo.

### 1. Criar as tabelas no Oracle

Execute o script [backend/sql/create_tables.sql](backend/sql/create_tables.sql) no Oracle (por exemplo, no SQL Developer, com **Run Script / F5**).

> **Atenção:** o script começa apagando as tabelas `T_INVESTIMENTO`, `T_CONTA_BANCARIA` e `T_USUARIO`, se existirem, e depois as recria com dados de exemplo.

### 2. Subir o backend (API)

As credenciais do banco não ficam no código. Elas são lidas das variáveis de ambiente `DB_URL`, `DB_USER` e `DB_PASSWORD`.

**Windows (PowerShell):**

```powershell
cd backend
$env:DB_URL = "jdbc:oracle:thin:@oracle.fiap.com.br:1521:ORCL"
$env:DB_USER = "seu_usuario_oracle"
$env:DB_PASSWORD = "sua_senha_oracle"
.\mvnw.cmd spring-boot:run
```

**Linux/macOS:**

```bash
cd backend
export DB_URL="jdbc:oracle:thin:@oracle.fiap.com.br:1521:ORCL"
export DB_USER="seu_usuario_oracle"
export DB_PASSWORD="sua_senha_oracle"
./mvnw spring-boot:run
```

A API está pronta quando o log mostrar `Started FintechApplication`. Ela fica em **http://localhost:8080/api**. Deixe esse terminal aberto.

A aplicação usa `spring.jpa.hibernate.ddl-auto=validate`: se as tabelas do passo 1 não existirem, ela não sobe e mostra o erro `missing table`.

### 3. Subir o frontend

Em **outro** terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse **http://localhost:5173** e entre com o [usuário de teste](#usuário-de-teste-login).

A URL da API está em [frontend/.env](frontend/.env) (`VITE_API_URL=http://localhost:8080/api`). O backend aceita requisições (CORS) apenas da origem `http://localhost:5173`, que é a porta padrão do Vite.

### 4. Criar o usuário de teste (só se ele não existir no banco)

Com o backend rodando, em outro terminal:

**Windows (PowerShell):**

```powershell
$corpo = @{
  nome = "Usuario de Teste"
  email = "gustavodeguido@gmail.com"
  senha = "Senha@123"
  cpf = "52998224725"
  dataNascimento = "2000-01-15"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/usuarios -ContentType "application/json; charset=utf-8" -Body $corpo
```

**Linux/macOS:**

```bash
curl -X POST http://localhost:8080/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome":"Usuario de Teste","email":"gustavodeguido@gmail.com","senha":"Senha@123","cpf":"52998224725","dataNascimento":"2000-01-15"}'
```

Se a API responder `409`, o usuário já existe e o login já funciona.

## Funcionalidades

- Login (`POST /api/auth/login`) com senha armazenada em hash BCrypt
- Página inicial com resumo: total de contas, de investimentos, saldo e valor investido
- Cadastro, listagem, edição e exclusão de **usuários**, **contas bancárias** e **investimentos**

## Regras de negócio

- E-mail e CPF únicos por usuário, que deve ter pelo menos 18 anos
- O saldo da conta nunca fica negativo
- O valor de um investimento deve ser maior que zero e não pode passar do saldo da conta. Ao aplicar, o valor sai do saldo, e ao excluir o investimento, volta para ele
- Ações e fundos não têm data de vencimento. Os demais tipos exigem vencimento posterior à data de aplicação
- Não é possível excluir um usuário que tem contas, nem uma conta que tem investimentos ou saldo

## Endpoints da API

Base: `http://localhost:8080/api`

| Recurso        | Endpoints |
|----------------|-----------|
| Autenticação   | `POST /auth/login` |
| Usuários       | `GET /usuarios`, `GET /usuarios/{id}`, `POST /usuarios`, `PUT /usuarios/{id}`, `DELETE /usuarios/{id}` |
| Contas         | `GET /contas-bancarias` (filtro opcional `?idUsuario=`), `GET /contas-bancarias/{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`, `POST /{id}/depositos`, `POST /{id}/saques` |
| Investimentos  | `GET /investimentos` (filtro opcional `?idConta=`), `GET /investimentos/{id}`, `POST`, `PUT /{id}`, `DELETE /{id}` |

Respostas: `200` GET/PUT, `201` POST (com header `Location`), `204` DELETE, `400` validação ou regra de negócio, `401` login inválido, `404` não encontrado, `409` dado duplicado (e-mail, CPF ou conta).

Uma collection do Postman com todas as requisições, incluindo os casos de erro, está em [backend/postman/Fintech-FIAP.postman_collection.json](backend/postman/Fintech-FIAP.postman_collection.json). Para usá-la, importe-a no Postman e execute-a pelo Collection Runner, na ordem.

## Estrutura

```
backend/
├── sql/create_tables.sql        DDL do Oracle e dados de exemplo
├── postman/                     collection de testes da API
└── src/main/java/br/com/fiap/fintech/
    ├── model/                   entidades JPA
    ├── repository/              Spring Data JPA
    ├── service/                 regras de negócio
    ├── controller/              endpoints REST
    ├── dto/                     objetos de entrada e saída
    ├── exception/               exceções e tratador global de erros
    └── config/                  CORS e BCrypt

frontend/src/
├── components/                  Navbar, Layout, Tabela, CampoFormulario, Mensagem...
├── pages/                       Login, Home, NotFound e as páginas de cada entidade
├── services/                    chamadas à API (axios)
├── context/                     autenticação (AuthContext)
└── utils/                       formatação de moeda, datas e CPF
```
