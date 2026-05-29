const { EmpresaLimpeza } = require('../models'); // Ajuste o caminho da pasta models se necessário

const obterEmpresas = async () => {
  try {
    return await EmpresaLimpeza.findAll({ 
      attributes: ['id', 'nome', 'cnpj'] 
    });
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    throw new Error('Não foi possível listar as empresas.');
  }
};

const salvarEmpresa = async (nome, cnpj) => {
  try {
    // No JS moderno, se a variável tem o mesmo nome da coluna, basta passar uma vez (nome, cnpj)
    const empresa = await EmpresaLimpeza.create({ nome, cnpj }); 
    return empresa;
  } catch (error) {
    console.error('Erro ao salvar empresa:', error);
    throw new Error('Não foi possível criar a empresa.');
  }
};

const excluirEmpresa = async (id) => {
  try {
    const empresa = await EmpresaLimpeza.findByPk(id);
    if (empresa) {
      await empresa.destroy();
      return true; // Retorna true para confirmar que a exclusão deu certo
    }
    return false; // Retorna false caso o ID não exista no banco
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    throw new Error('Não foi possível excluir a empresa.');
  }
};

const atualizarEmpresa = async (id, dadosAtualizados) => {
  try {
    const empresa = await EmpresaLimpeza.findByPk(id);
    
    if (empresa) {
      // O método .update() do Sequelize já salva no banco automaticamente
      await empresa.update(dadosAtualizados);
      return empresa;
    }
    return null; // Retorna nulo se o ID não existir
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    throw new Error('Não foi possível atualizar a empresa.');
  }
};

// Não esqueça de exportar a nova função junto com as outras!
module.exports = { 
  obterEmpresas, 
  salvarEmpresa, 
  excluirEmpresa,
  atualizarEmpresa // <-- Adicionei aqui
};

// Exportação modernizada (Shorthand Property Names)
module.exports = { 
  obterEmpresas, 
  salvarEmpresa, 
  excluirEmpresa,
  atualizarEmpresa
};
