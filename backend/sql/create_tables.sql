BEGIN
    FOR t IN (
        SELECT table_name
          FROM user_tables
         WHERE table_name IN ('T_INVESTIMENTO', 'T_CONTA_BANCARIA', 'T_USUARIO')
         ORDER BY DECODE(table_name, 'T_INVESTIMENTO', 1, 'T_CONTA_BANCARIA', 2, 3)
    ) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS PURGE';
    END LOOP;
END;
/

CREATE TABLE T_USUARIO (
    id_usuario      NUMBER          GENERATED ALWAYS AS IDENTITY,
    nm_usuario      VARCHAR2(100)   NOT NULL,
    ds_email        VARCHAR2(150)   NOT NULL,
    ds_senha        VARCHAR2(255)   NOT NULL,
    nr_cpf          VARCHAR2(11)    NOT NULL,
    dt_nascimento   DATE            NOT NULL,
    dt_cadastro     TIMESTAMP       DEFAULT SYSTIMESTAMP NOT NULL,

    CONSTRAINT PK_T_USUARIO       PRIMARY KEY (id_usuario),
    CONSTRAINT UK_T_USUARIO_EMAIL UNIQUE (ds_email),
    CONSTRAINT UK_T_USUARIO_CPF   UNIQUE (nr_cpf),
    CONSTRAINT CK_T_USUARIO_CPF   CHECK (LENGTH(nr_cpf) = 11)
);

CREATE TABLE T_CONTA_BANCARIA (
    id_conta        NUMBER          GENERATED ALWAYS AS IDENTITY,
    id_usuario      NUMBER          NOT NULL,
    nm_banco        VARCHAR2(100)   NOT NULL,
    nr_agencia      VARCHAR2(10)    NOT NULL,
    nr_conta        VARCHAR2(20)    NOT NULL,
    tp_conta        VARCHAR2(20)    NOT NULL,
    vl_saldo        NUMBER(15,2)    DEFAULT 0 NOT NULL,
    dt_abertura     DATE            NOT NULL,

    CONSTRAINT PK_T_CONTA_BANCARIA      PRIMARY KEY (id_conta),
    CONSTRAINT FK_T_CONTA_BANCARIA_USU  FOREIGN KEY (id_usuario)
        REFERENCES T_USUARIO (id_usuario),
    CONSTRAINT UK_T_CONTA_BANCARIA_NUM  UNIQUE (nm_banco, nr_agencia, nr_conta),
    CONSTRAINT CK_T_CONTA_BANCARIA_TIPO CHECK (tp_conta IN ('CORRENTE', 'POUPANCA', 'INVESTIMENTO'))
);

CREATE INDEX IX_T_CONTA_BANCARIA_USU ON T_CONTA_BANCARIA (id_usuario);

CREATE TABLE T_INVESTIMENTO (
    id_investimento   NUMBER          GENERATED ALWAYS AS IDENTITY,
    id_conta          NUMBER          NOT NULL,
    nm_investimento   VARCHAR2(100)   NOT NULL,
    tp_investimento   VARCHAR2(20)    NOT NULL,
    vl_aplicado       NUMBER(15,2)    NOT NULL,
    tx_rentabilidade  NUMBER(7,4)     NOT NULL,
    dt_aplicacao      DATE            NOT NULL,
    dt_vencimento     DATE,

    CONSTRAINT PK_T_INVESTIMENTO       PRIMARY KEY (id_investimento),
    CONSTRAINT FK_T_INVESTIMENTO_CONTA FOREIGN KEY (id_conta)
        REFERENCES T_CONTA_BANCARIA (id_conta),
    CONSTRAINT CK_T_INVESTIMENTO_TIPO  CHECK (tp_investimento IN
        ('CDB', 'LCI', 'LCA', 'TESOURO_DIRETO', 'ACOES', 'FUNDO')),
    CONSTRAINT CK_T_INVESTIMENTO_VALOR CHECK (vl_aplicado > 0),
    CONSTRAINT CK_T_INVESTIMENTO_DATAS CHECK (dt_vencimento IS NULL OR dt_vencimento > dt_aplicacao)
);

CREATE INDEX IX_T_INVESTIMENTO_CONTA ON T_INVESTIMENTO (id_conta);

INSERT INTO T_USUARIO (nm_usuario, ds_email, ds_senha, nr_cpf, dt_nascimento)
VALUES ('Ana Souza', 'ana.souza@email.com', 'trocar-por-hash', '12345678901', DATE '1995-03-12');

INSERT INTO T_USUARIO (nm_usuario, ds_email, ds_senha, nr_cpf, dt_nascimento)
VALUES ('Bruno Lima', 'bruno.lima@email.com', 'trocar-por-hash', '98765432100', DATE '1988-07-25');

INSERT INTO T_USUARIO (nm_usuario, ds_email, ds_senha, nr_cpf, dt_nascimento)
VALUES ('Carla Mendes', 'carla.mendes@email.com', 'trocar-por-hash', '45678912300', DATE '2000-11-03');

INSERT INTO T_CONTA_BANCARIA (id_usuario, nm_banco, nr_agencia, nr_conta, tp_conta, vl_saldo, dt_abertura)
SELECT id_usuario, 'Banco do Brasil', '1234', '56789-0', 'CORRENTE', 5200.50, DATE '2020-01-15'
  FROM T_USUARIO WHERE ds_email = 'ana.souza@email.com';

INSERT INTO T_CONTA_BANCARIA (id_usuario, nm_banco, nr_agencia, nr_conta, tp_conta, vl_saldo, dt_abertura)
SELECT id_usuario, 'Nubank', '0001', '1122334-5', 'INVESTIMENTO', 15000.00, DATE '2021-06-10'
  FROM T_USUARIO WHERE ds_email = 'ana.souza@email.com';

INSERT INTO T_CONTA_BANCARIA (id_usuario, nm_banco, nr_agencia, nr_conta, tp_conta, vl_saldo, dt_abertura)
SELECT id_usuario, 'Itaú', '4321', '98765-4', 'CORRENTE', 3100.00, DATE '2019-09-01'
  FROM T_USUARIO WHERE ds_email = 'bruno.lima@email.com';

INSERT INTO T_CONTA_BANCARIA (id_usuario, nm_banco, nr_agencia, nr_conta, tp_conta, vl_saldo, dt_abertura)
SELECT id_usuario, 'Caixa', '0555', '00012345-6', 'POUPANCA', 800.75, DATE '2023-02-20'
  FROM T_USUARIO WHERE ds_email = 'carla.mendes@email.com';

INSERT INTO T_INVESTIMENTO (id_conta, nm_investimento, tp_investimento, vl_aplicado, tx_rentabilidade, dt_aplicacao, dt_vencimento)
SELECT id_conta, 'CDB Banco do Brasil 2027', 'CDB', 2000.00, 11.5000, DATE '2024-03-01', DATE '2027-03-01'
  FROM T_CONTA_BANCARIA WHERE nm_banco = 'Banco do Brasil' AND nr_agencia = '1234' AND nr_conta = '56789-0';

INSERT INTO T_INVESTIMENTO (id_conta, nm_investimento, tp_investimento, vl_aplicado, tx_rentabilidade, dt_aplicacao, dt_vencimento)
SELECT id_conta, 'Tesouro Selic 2029', 'TESOURO_DIRETO', 5000.00, 10.7500, DATE '2024-05-10', DATE '2029-03-01'
  FROM T_CONTA_BANCARIA WHERE nm_banco = 'Nubank' AND nr_agencia = '0001' AND nr_conta = '1122334-5';

INSERT INTO T_INVESTIMENTO (id_conta, nm_investimento, tp_investimento, vl_aplicado, tx_rentabilidade, dt_aplicacao, dt_vencimento)
SELECT id_conta, 'Fundo Imobiliário XPML11', 'FUNDO', 3000.00, 8.2000, DATE '2024-08-15', NULL
  FROM T_CONTA_BANCARIA WHERE nm_banco = 'Nubank' AND nr_agencia = '0001' AND nr_conta = '1122334-5';

INSERT INTO T_INVESTIMENTO (id_conta, nm_investimento, tp_investimento, vl_aplicado, tx_rentabilidade, dt_aplicacao, dt_vencimento)
SELECT id_conta, 'LCI Itaú 2026', 'LCI', 1500.00, 9.8000, DATE '2024-01-20', DATE '2026-12-20'
  FROM T_CONTA_BANCARIA WHERE nm_banco = 'Itaú' AND nr_agencia = '4321' AND nr_conta = '98765-4';

INSERT INTO T_INVESTIMENTO (id_conta, nm_investimento, tp_investimento, vl_aplicado, tx_rentabilidade, dt_aplicacao, dt_vencimento)
SELECT id_conta, 'Ações PETR4', 'ACOES', 1000.00, 0.0000, DATE '2025-02-05', NULL
  FROM T_CONTA_BANCARIA WHERE nm_banco = 'Itaú' AND nr_agencia = '4321' AND nr_conta = '98765-4';

COMMIT;
