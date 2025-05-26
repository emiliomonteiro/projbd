# Projeto de banco de dados - Sistema de Locadora

## 📝 Sobre o Projeto
Este é um sistema de gerenciamento de locadora desenvolvido em Node.js. O projeto utiliza PostgreSQL como banco de dados para armazenar informações sobre clientes e outras operações do sistema.

## 🎯 Funcionalidades Principais
- Cadastro e gerenciamento de clientes
- Dashboard com visualização de dados
- Integração com banco de dados PostgreSQL
- API REST para comunicação com o frontend

## 💻 Estrutura do Código

### Pasta `routes/`
Contém os arquivos que definem as rotas da API:
- `clientes.js`: Gerencia todas as operações relacionadas aos clientes
  - Lista todos os clientes
  - Adiciona novos clientes
  - Atualiza informações
  - Remove clientes

- `dashboard.js`: Gerencia as informações do painel de controle
  - Fornece dados para gráficos
  - Estatísticas do sistema

### Pasta `services/`
Contém os serviços do sistema:
- `postgre.js`: Configuração da conexão com o banco de dados
  ```javascript
  // Exemplo de como o banco de dados é configurado
  const pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'locadora_dw',
      password: '123456',
      port: 5432
  });
  ```

## 🚀 Como Executar o Projeto

1. **Preparação do Ambiente**
   - Instalar Node.js
   - Instalar PostgreSQL
   - Criar banco de dados `locadora_dw`

2. **Instalação**
   ```bash
   # Instalar dependências
   npm install
   ```

3. **Configuração**
   - Ajustar as configurações do banco de dados em `services/postgre.js`
   - Criar arquivo `.env` com as variáveis de ambiente

4. **Execução**
   ```bash
   npm start
   ```

## 📊 Banco de Dados
O projeto utiliza PostgreSQL, um banco de dados relacional robusto e confiável. A conexão é gerenciada através de um pool de conexões, que permite:
- Melhor performance
- Gerenciamento eficiente de recursos
- Conexões simultâneas

## 🔄 Fluxo de Dados
1. O cliente faz uma requisição para a API
2. A rota correspondente processa a requisição
3. O serviço de banco de dados executa as operações necessárias
4. Os dados são retornados ao cliente

## 👥 Equipe
- Emilio Monteiro - Desenvolvedor


## 📝 Notas de Desenvolvimento
- O projeto está em constante evolução
- Novas funcionalidades serão adicionadas conforme necessário
- Feedback é sempre bem-vindo para melhorias