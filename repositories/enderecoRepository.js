const { Endereco, ZonaColeta } = require('../models');

const obterEnderecosPorUsuario = async (usuario_id) => {
  try {
    return await Endereco.findAll({
      where: { usuario_id },
      include: [
        {
          model: ZonaColeta,
          attributes: ['nome_zona']
        }
      ]
    });
  } catch (error) {
    console.error('Erro ao buscar endereços do usuário:', error);
    throw new Error('Não foi possível listar os endereços.');
  }
};

const salvarEndereco = async (dadosEndereco) => {
  try {
    const dadosNormalizados = { ...dadosEndereco };

    if (dadosNormalizados.zona_id !== undefined && dadosNormalizados.zona_id !== null && dadosNormalizados.zona_id !== '') {
      const zonaId = Number(dadosNormalizados.zona_id);
      if (!Number.isInteger(zonaId) || zonaId <= 0) {
        dadosNormalizados.zona_id = null;
      } else {
        const zona = await ZonaColeta.findByPk(zonaId);
        dadosNormalizados.zona_id = zona ? zonaId : null;
      }
    } else {
      dadosNormalizados.zona_id = null;
    }

    try {
      return await Endereco.create(dadosNormalizados);
    } catch (erroCriacao) {
      if (erroCriacao.name === 'SequelizeForeignKeyConstraintError' && dadosNormalizados.zona_id !== null) {
        dadosNormalizados.zona_id = null;
        return await Endereco.create(dadosNormalizados);
      }
      throw erroCriacao;
    }
  } catch (error) {
    console.error('Erro ao salvar endereço:', error);
    throw new Error('Não foi possível cadastrar o endereço.');
  }
};

const excluirEndereco = async (id, usuario_id) => {
  try {
    // Exige o usuario_id para garantir que a pessoa só apague o próprio endereço
    const endereco = await Endereco.findOne({ 
      where: { id, usuario_id } 
    });
    
    if (endereco) {
      await endereco.destroy();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao excluir endereço:', error);
    throw new Error('Não foi possível remover o endereço.');
  }
};

const obterTodosEnderecos = async () => {
  try {
    return await Endereco.findAll();
  } catch (error) {
    console.error('Erro ao buscar todos os endereços:', error);
    throw new Error('Não foi possível listar os endereços.');
  }
};

const atualizarEndereco = async (id, dadosAtualizados) => {
  try {
    const endereco = await Endereco.findByPk(id);
    
    if (endereco) {
      await endereco.update(dadosAtualizados);
      return endereco;
    }
    return null;
  } catch (error) {
    console.error('Erro ao atualizar endereço:', error);
    throw new Error('Não foi possível atualizar o endereço.');
  }
};

// Não esqueça de exportar lá embaixo!
module.exports = { 
  obterEnderecosPorUsuario, 
  salvarEndereco, 
  excluirEndereco,
  obterTodosEnderecos, // <-- adicione aqui
  atualizarEndereco
};