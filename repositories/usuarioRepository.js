const { Usuario, Endereco } = require('../models');

const obterUsuarios = async () => {
  try {
    return await Usuario.findAll({
      // Exclui a senha do retorno para não vazar dados na API
      attributes: { exclude: ['senha'] },
      include: [
        {
          model: Endereco,
          attributes: ['logradouro', 'bairro', 'cep']
        }
      ]
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw new Error('Não foi possível listar os usuários.');
  }
};

const buscarPorEmail = async (email) => {
  try {
    // Essa função é essencial para a tela de Login do Front-end
    return await Usuario.findOne({ 
      where: { email } 
    });
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    throw new Error('Não foi possível consultar o email.');
  }
};

const salvarUsuario = async (dadosUsuario) => {
  try {
    const usuario = await Usuario.create(dadosUsuario);
    // Remove a senha do objeto antes de devolver como resposta de sucesso
    const { senha, ...usuarioSemSenha } = usuario.toJSON();
    return usuarioSemSenha;
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    throw new Error('Não foi possível cadastrar o usuário.');
  }
};

const atualizarUsuario = async (id, dadosAtualizados) => {
  try {
    const usuario = await Usuario.findByPk(id);
    
    if (usuario) {
      await usuario.update(dadosAtualizados);
      // Removemos a senha do retorno para manter a segurança da API
      const { senha, ...usuarioSemSenha } = usuario.toJSON();
      return usuarioSemSenha;
    }
    return null; // Retorna nulo se o ID não existir
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw new Error('Não foi possível atualizar o usuário.');
  }
};

const excluirUsuario = async (id) => {
  try {
    const usuario = await Usuario.findByPk(id);
    if (usuario) {
      await usuario.destroy();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    throw new Error('Não foi possível remover o usuário.');
  }
};

module.exports = { 
  obterUsuarios, 
  buscarPorEmail, 
  salvarUsuario,
  atualizarUsuario,
  excluirUsuario
};
