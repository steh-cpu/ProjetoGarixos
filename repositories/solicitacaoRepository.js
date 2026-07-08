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
    const dadosNormalizados = { ...dadosSolicitacao };

    if (!dadosNormalizados.status) {
      dadosNormalizados.status = 'PENDENTE';
    }

    if (dadosNormalizados.veiculo_id !== undefined && dadosNormalizados.veiculo_id !== null && dadosNormalizados.veiculo_id !== '') {
      const veiculoId = Number(dadosNormalizados.veiculo_id);
      if (!Number.isInteger(veiculoId) || veiculoId <= 0) {
        dadosNormalizados.veiculo_id = null;
      } else {
        const veiculo = await Veiculo.findByPk(veiculoId);
        dadosNormalizados.veiculo_id = veiculo ? veiculoId : null;
      }
    } else {
      dadosNormalizados.veiculo_id = null;
    }

    return await SolicitacaoColeta.create(dadosNormalizados);
  } catch (error) {
    console.error('Erro ao salvar solicitação:', error);
    throw new Error('Não foi possível registar a solicitação.');
  }
};

const atualizarSolicitacao = async (id, dadosAtualizados) => {
  try {
    const solicitacao = await SolicitacaoColeta.findByPk(id);
    if (solicitacao) {
      const dadosNormalizados = { ...dadosAtualizados };

      if (dadosNormalizados.veiculo_id !== undefined && dadosNormalizados.veiculo_id !== null && dadosNormalizados.veiculo_id !== '') {
        const veiculoId = Number(dadosNormalizados.veiculo_id);
        if (!Number.isInteger(veiculoId) || veiculoId <= 0) {
          dadosNormalizados.veiculo_id = null;
        } else {
          const veiculo = await Veiculo.findByPk(veiculoId);
          dadosNormalizados.veiculo_id = veiculo ? veiculoId : null;
        }
      } else if (dadosNormalizados.veiculo_id === '') {
        dadosNormalizados.veiculo_id = null;
      }

      await solicitacao.update(dadosNormalizados);
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