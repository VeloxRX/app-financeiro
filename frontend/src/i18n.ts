import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  'pt-BR': {
    translation: {
      common: {
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        edit: 'Editar',
        create: 'Criar',
        search: 'Buscar',
        filter: 'Filtrar',
        export: 'Exportar',
        loading: 'Carregando...',
        noData: 'Nenhum dado encontrado',
        confirm: 'Confirmar',
        back: 'Voltar',
      },
      nav: {
        dashboard: 'Dashboard',
        transactions: 'Transações',
        categories: 'Categorias',
        goals: 'Metas',
        reports: 'Relatórios',
        alerts: 'Alertas',
        settings: 'Configurações',
      },
      auth: {
        login: 'Entrar',
        register: 'Cadastrar',
        logout: 'Sair',
        email: 'E-mail',
        password: 'Senha',
        name: 'Nome',
        forgotPassword: 'Esqueceu a senha?',
        noAccount: 'Não tem conta?',
        hasAccount: 'Já tem conta?',
        welcome: 'Bem-vindo ao FinAI',
        subtitle: 'Seu assistente financeiro inteligente',
      },
      dashboard: {
        balance: 'Saldo',
        income: 'Receitas',
        expenses: 'Despesas',
        savings: 'Taxa de Poupança',
        cashflow: 'Fluxo de Caixa',
        topExpenses: 'Maiores Despesas',
        goals: 'Metas Financeiras',
        insights: 'Insight do Mês',
        level: 'Nível',
      },
      transactions: {
        title: 'Transações',
        new: 'Nova Transação',
        income: 'Receita',
        expense: 'Despesa',
        transfer: 'Transferência',
        description: 'Descrição',
        amount: 'Valor',
        date: 'Data',
        category: 'Categoria',
        type: 'Tipo',
      },
      goals: {
        title: 'Metas Financeiras',
        new: 'Nova Meta',
        target: 'Valor Alvo',
        current: 'Valor Atual',
        deadline: 'Prazo',
        deposit: 'Depositar',
        progress: 'Progresso',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'pt-BR',
  interpolation: { escapeValue: false },
});

export default i18n;
