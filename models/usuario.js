'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    Usuario.belongsTo(models.EmpresaLimpeza, { foreignKey: 'empresa_id' });
    Usuario.hasMany(models.Endereco, { foreignKey: 'usuario_id' });
    Usuario.hasMany(models.SolicitacaoColeta, { foreignKey: 'usuario_id' });
    Usuario.hasMany(models.HistoricoSolicitacao, { foreignKey: 'usuario_id' });
  }
  }
  Usuario.init({
    empresa_id: DataTypes.INTEGER,
    nome: DataTypes.STRING,
    email: DataTypes.STRING,
    senha: DataTypes.STRING,
    data_nascimento: DataTypes.DATE,
    perfil: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Usuario',
  });
  return Usuario;
};