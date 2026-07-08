const { SuporteSolicitacao, Usuario } = require('../models');

const listarSolicitacoes = async () => {
  try {
    return await SuporteSolicitacao.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: Usuario, attributes: ['id', 'nome', 'email'] }]
    });
  } catch (error) {
    console.error('Erro ao listar suportes:', error);
    throw new Error('Não foi possível listar os registros de suporte.');
  }
};

const criarSolicitacao = async (dados) => {
  try {
    const dadosNormalizados = { ...dados };

    if (dadosNormalizados.usuario_id !== undefined && dadosNormalizados.usuario_id !== null && dadosNormalizados.usuario_id !== '') {
      const usuarioId = Number(dadosNormalizados.usuario_id);
      if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        dadosNormalizados.usuario_id = null;
      } else {
        const existeUsuario = await Usuario.findByPk(usuarioId);
        dadosNormalizados.usuario_id = existeUsuario ? usuarioId : null;
      }
    } else {
      dadosNormalizados.usuario_id = null;
    }

    return await SuporteSolicitacao.create(dadosNormalizados);
  } catch (error) {
    console.error('Erro ao criar solicitação de suporte:', error);
    throw new Error('Não foi possível salvar a solicitação de suporte.');
  }
};

const atualizarStatus = async (id, status) => {
  try {
    const item = await SuporteSolicitacao.findByPk(id);
    if (!item) return null;
    await item.update({ status });
    return item;
  } catch (error) {
    console.error('Erro ao atualizar status do suporte:', error);
    throw new Error('Não foi possível atualizar o status.');
  }
};

const excluirSolicitacao = async (id) => {
  try {
    const item = await SuporteSolicitacao.findByPk(id);
    if (!item) return false;
    await item.destroy();
    return true;
  } catch (error) {
    console.error('Erro ao excluir solicitação de suporte:', error);
    throw new Error('Não foi possível excluir a solicitação.');
  }
};

module.exports = {
  listarSolicitacoes,
  criarSolicitacao,
  atualizarStatus,
  excluirSolicitacao
};
