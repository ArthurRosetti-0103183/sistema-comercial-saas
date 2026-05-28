# Sistema Comercial Completo 🚀

Sistema completo para gerenciamento comercial, desenvolvido com tecnologias modernas para controle eficiente de vendas, estoque e relatórios.

## 📋 Funcionalidades

*   **Autenticação JWT:** Login seguro e controle de sessão. Controle de acesso por roles (Admin vs. Comum).
*   **Gerenciamento de Usuários:** CRUD completo.
*   **Gerenciamento de Clientes:** Cadastro com máscaras de CPF/CNPJ e Telefone.
*   **Controle de Estoque:** Cadastro de produtos, definição de preço de custo e venda, e limite de estoque mínimo. Alertas visuais para estoque baixo/zerado.
*   **Ponto de Venda (PDV):** Interface ágil para registro de vendas, cálculo de subtotal, total e troco. Baixa automática no estoque em transação atômica.
*   **Relatórios e Dashboard:** Visão geral em tempo real com gráficos numéricos. Filtro de vendas por período e exportação nativa para **PDF** e **Excel**.

## 🛠️ Tecnologias Utilizadas

**Backend:**
*   Node.js com Express
*   SQLite3 (via `better-sqlite3` para alta performance)
*   JWT para autenticação e bcryptjs para hash de senhas

**Frontend:**
*   HTML5, Vanilla CSS3 e Vanilla JavaScript (SPA sem frameworks pesados)
*   Design System customizado (Dark Theme, Glassmorphism, Responsividade)
*   Bibliotecas externas (via CDN): FontAwesome, jsPDF e SheetJS (XLSX)

## ⚙️ Como Instalar e Executar

1.  **Pré-requisitos:** Certifique-se de ter o [Node.js](https://nodejs.org/) instalado na sua máquina (versão 16+ recomendada).
2.  **Instalação de Dependências:**
    Abra o terminal na pasta raiz do projeto e execute:
    \`\`\`bash
    npm install
    \`\`\`
3.  **Configuração de Ambiente:**
    Opcionalmente, você pode criar um arquivo \`.env\` baseado no \`.env.example\` para definir portas e chaves JWT. Por padrão, ele usará a porta \`3000\`.
4.  **Iniciando o Servidor:**
    \`\`\`bash
    npm start
    \`\`\`
    *(O banco de dados SQLite será criado automaticamente e as tabelas serão geradas no primeiro uso)*.
5.  **Acessando o Sistema:**
    Abra o seu navegador e acesse: [http://localhost:3000](http://localhost:3000)

## 🔐 Acesso Padrão

Na primeira execução, o sistema criará o banco de dados local \`database/sistema_comercial.db\` e inserirá o administrador padrão:

*   **Usuário:** Admin
*   **Senha:** 123

> **Aviso:** É altamente recomendável alterar a senha deste usuário ou criar um novo administrador e excluir este após o primeiro acesso.
