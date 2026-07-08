'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SuporteSolicitacao extends Model {
    static associate(models) {
      SuporteSolicitacao.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
    }
  }

  SuporteSolicitacao.init({
    tipo: DataTypes.STRING,
    email: DataTypes.STRING,
    assunto: DataTypes.STRING,
    mensagem: DataTypes.TEXT,
    tipo_feedback: DataTypes.STRING,
    status: DataTypes.STRING,
    usuario_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SuporteSolicitacao',
    tableName: 'SuporteSolicitacoes',
    freezeTableName: true
  });

  return SuporteSolicitacao;
};
