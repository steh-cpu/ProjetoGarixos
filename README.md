
# Garixos - Sistema de Gestão de Zeladoria e Coleta de Resíduos

Este projeto é uma plataforma fullstack desenvolvida como projeto acadêmico para gerenciar a logística de coleta de resíduos, conectando cidadãos a empresas de limpeza urbana. Inicialmente concebido como um protótipo visual, o sistema agora conta com uma camada robusta de dados em Node.js e banco de dados relacional.

## 👥 Equipe do Projeto
- **Product Owner (PO):** Thiago Oliveira
- **Scrum Master:** Accioli
- **Front-end:** Natã e Stefany
- **Back-end:** João e Diego
- **Banco de Dados:** Caue e Edu

---

## 🖥️ Camada Front-end (Interface)
A interface foi estruturada para ser simples e intuitiva para o usuário final:
- `index.html`: Página para fazer login com CPF e senha.
- `criarcadastro.html`: Página para criar uma conta nova.
- `principal.html`: Página principal com informações e opções de coleta.
- `css/`, `js/` e `assets/`: Arquivos de estilização, scripts visuais e imagens.

> **Nota de Evolução:** Nas versões iniciais, os dados eram guardados apenas no `localStorage` do navegador e funções como mapa e login social eram apenas visuais. A versão atual integra o sistema a um banco de dados real, garantindo segurança e persistência das informações.

---

## ⚙️ Camada Back-end e Banco de Dados
O backend é construído em Node.js com a ORM Sequelize para gerenciar toda a operação do sistema de coleta. A arquitetura suporta perfis de acesso, dividindo as jornadas entre o Portal do Cidadão e o Painel Administrativo Interno.

### Estrutura de Diretórios
- `package.json`: Dependências do Node e scripts.
- `config/config.json`: Configuração de conexão com o banco de dados.
- `models/`: Definições das entidades Sequelize e arquivo de inicialização (`index.js`).
- `migrations/`: Arquivos de migração para criar as tabelas no banco de dados.
- `seeders/`: Diretórios para carregamento de dados fictícios ou iniciais.

### Modelos Principais
- `EmpresaLimpeza` (`models/empresalimpeza.js`)
- `ZonaColeta` (`models/zonacoleta.js`)
- `Veiculo` (`models/veiculo.js`)
- `Usuario` (`models/usuario.js`)
- `HorarioColeta` (`models/horariocoleta.js`)
- `Endereco` (`models/endereco.js`)
- `SolicitacaoColeta` (`models/solicitacaocoleta.js`)
- `HistoricoSolicitacao` (`models/historicosolicitacao.js`)

---

## 📊 Diagrama Entidade-Relacionamento (DER)
A arquitetura do banco de dados foi normalizada utilizando restrições de chaves estrangeiras (`FK`) e `ENUMs` para garantir a integridade do histórico operacional.

```mermaid
erDiagram
    EMPRESAS_LIMPEZA {
        int id PK
        varchar nome
        varchar cnpj
        timestamp created_at
    }
    ZONAS_COLETA {
        int id PK
        int empresa_id FK
        varchar nome_zona
    }
    HORARIOS_COLETA {
        int id PK
        int zona_id FK
        enum dia_semana
        enum periodo
        enum tipo_lixo
    }
    VEICULOS {
        int id PK
        int empresa_id FK
        varchar placa
        varchar marca
        varchar modelo
        varchar ano
        timestamp created_at
    }
    USUARIOS {
        int id PK
        int empresa_id FK
        varchar nome
        varchar email
        varchar senha
        date data_nascimento
        enum perfil
        timestamp created_at
    }
    ENDERECOS {
        int id PK
        int usuario_id FK
        varchar cep
        varchar logradouro
        varchar bairro
        varchar numero
        int zona_id FK
    }
    SOLICITACOES_COLETA {
        int id PK
        int usuario_id FK
        int endereco_id FK
        int veiculo_id FK
        enum tipo_lixo
        enum status
        timestamp data_solicitacao
    }
    HISTORICO_SOLICITACOES {
        int id PK
        int solicitacao_id FK
        int usuario_id FK
        enum status_anterior
        enum status_novo
        timestamp data_alteracao
    }

    EMPRESAS_LIMPEZA ||--o{ ZONAS_COLETA : "gerencia"
    EMPRESAS_LIMPEZA ||--o{ VEICULOS : "possui"
    ZONAS_COLETA ||--o{ HORARIOS_COLETA : "possui"
    ZONAS_COLETA ||--o{ ENDERECOS : "abrange"
    VEICULOS ||--o{ SOLICITACOES_COLETA : "atende"
    USUARIOS ||--o{ ENDERECOS : "cadastra"
    USUARIOS ||--o{ SOLICITACOES_COLETA : "abre"
    USUARIOS ||--o{ HISTORICO_SOLICITACOES : "registra"
    ENDERECOS ||--o{ SOLICITACOES_COLETA : "local_da"
    SOLICITACOES_COLETA ||--o{ HISTORICO_SOLICITACOES : "possui"
    EMPRESAS_LIMPEZA |o--o{ USUARIOS : "emprega"

```
## 🚀 Instalação e Uso
 1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/steh-cpu/ProjetoGarixos.git](https://github.com/steh-cpu/ProjetoGarixos.git)
   cd garixos
   
   ```
 2. **Instale as dependências:**
   ```bash
   npm install
   
   ```
 3. **Configure o Banco de Dados:**
   Ajuste o arquivo config/config.json com as credenciais do seu banco PostgreSQL local.
 4. **Execute as Migrações para criar as tabelas:**
   ```bash
   npx sequelize-cli db:migrate
   
   ```
 5. **Carregue dados iniciais (Opcional):**
   ```bash
   npx sequelize-cli db:seed:all
   
   ```
## 📌 Observações Finais
 * O projeto usa sequelize e pg para conectar ao PostgreSQL.
 * O arquivo models/index.js contém a inicialização do Sequelize e a importação automática de todos os modelos.
 * Atualmente, o repositório tem foco consolidado na camada de dados e migrações. A configuração completa das rotas do servidor HTTP está em andamento.
 * **Licença:** ISC
```

```
