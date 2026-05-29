const { Veiculo } = require('../models'); 

const obterVeiculos = async () => {
  try {
    return await Veiculo.findAll();
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    throw new Error('Não foi possível listar os veículos.');
  }
};

const salvarVeiculo = async (dadosVeiculo) => {
  try {
    return await Veiculo.create(dadosVeiculo);
  } catch (error) {
    console.error('Erro ao salvar veículo:', error);
    throw new Error('Não foi possível registar o veículo.');
  }
};

const atualizarVeiculo = async (id, dadosAtualizados) => {
  try {
    const veiculo = await Veiculo.findByPk(id);
    if (veiculo) {
      await veiculo.update(dadosAtualizados);
      return veiculo;
    }
    return null;
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    throw new Error('Não foi possível atualizar o veículo.');
  }
};

const excluirVeiculo = async (id) => {
  try {
    const veiculo = await Veiculo.findByPk(id);
    if (veiculo) {
      await veiculo.destroy();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao excluir veículo:', error);
    throw new Error('Não foi possível remover o veículo.');
  }
};

module.exports = {
  obterVeiculos,
  salvarVeiculo,
  atualizarVeiculo,
  excluirVeiculo
};