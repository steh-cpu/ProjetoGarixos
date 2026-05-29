const { ZonaColeta } = require('../models'); // Ajuste o caminho se necessário para os seus modelos do Sequelize

const obterZonas = async () => {
  try {
    return await ZonaColeta.findAll();
  } catch (error) {
    console.error('Erro ao buscar zonas de coleta:', error);
    throw new Error('Não foi possível listar as zonas de coleta.');
  }
};

const salvarZona = async (dadosZona) => {
  try {
    return await ZonaColeta.create(dadosZona);
  } catch (error) {
    console.error('Erro ao salvar zona de coleta:', error);
    throw new Error('Não foi possível cadastrar a zona de coleta.');
  }
};

const atualizarZona = async (id, dadosAtualizados) => {
  try {
    const zona = await ZonaColeta.findByPk(id);
    if (zona) {
      await zona.update(dadosAtualizados);
      return zona;
    }
    return null;
  } catch (error) {
    console.error('Erro ao atualizar zona de coleta:', error);
    throw new Error('Não foi possível atualizar a zona de coleta.');
  }
};

const excluirZona = async (id) => {
  try {
    const zona = await ZonaColeta.findByPk(id);
    if (zona) {
      await zona.destroy();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao excluir zona de coleta:', error);
    throw new Error('Não foi possível remover a zona de coleta.');
  }
};

module.exports = {
  obterZonas,
  salvarZona,
  atualizarZona,
  excluirZona
};