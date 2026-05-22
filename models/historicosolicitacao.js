'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HistoricoSolicitacao extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    HistoricoSolicitacao.belongsTo(models.SolicitacaoColeta, { foreignKey: 'solicitacao_id' });
    HistoricoSolicitacao.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
  }
  }
  HistoricoSolicitacao.init({
    solicitacao_id: DataTypes.INTEGER,
    usuario_id: DataTypes.INTEGER,
    status_anterior: DataTypes.STRING,
    status_novo: DataTypes.STRING,
    data_alteracao: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'HistoricoSolicitacao',
  });
  return HistoricoSolicitacao;
};