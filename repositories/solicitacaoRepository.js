const { SolicitacaoColeta, Usuario, Endereco, Veiculo } = require('../models');

const obterSolicitacoes = async () => {
  try {
    return await SolicitacaoColeta.findAll({
      include: [
        {
          model: Usuario,
          attributes: ['nome', 'email'] // Trazemos apenas o que importa para a interface
        },
        {
          model: Endereco,
          attributes: ['logradouro', 'numero', 'bairro']
        },
        {
          model: Veiculo,
          attributes: ['placa', 'modelo']
        }
      ]
    });
  } catch (error) {
    console.error('Erro ao buscar solicitações com relacionamentos:', error);
    throw new Error('Não foi possível listar as solicitações de recolha.');
  }
};

const salvarSolicitacao = async (dadosSolicitacao) => {
  try {
    if (!dadosSolicitacao.status) {
      dadosSolicitacao.status = 'PENDENTE';
    }
    return await SolicitacaoColeta.create(dadosSolicitacao);
  } catch (error) {
    console.error('Erro ao salvar solicitação:', error);
    throw new Error('Não foi possível registar a solicitação.');
  }
};

const atualizarSolicitacao = async (id, dadosAtualizados) => {
  try {
    const solicitacao = await SolicitacaoColeta.findByPk(id);
    if (solicitacao) {
      await solicitacao.update(dadosAtualizados);
      return solicitacao;
    }
    return null;
  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error);
    throw new Error('Não foi possível atualizar a solicitação.');
  }
};

const excluirSolicitacao = async (id) => {
  try {
    const solicitacao = await SolicitacaoColeta.findByPk(id);
    if (solicitacao) {
      await solicitacao.destroy();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao excluir solicitação:', error);
    throw new Error('Não foi possível remover a solicitação.');
  }
};

module.exports = {
  obterSolicitacoes,
  salvarSolicitacao,
  atualizarSolicitacao,
  excluirSolicitacao
};