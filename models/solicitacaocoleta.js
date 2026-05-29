'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SolicitacaoColeta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    SolicitacaoColeta.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
    SolicitacaoColeta.belongsTo(models.Endereco, { foreignKey: 'endereco_id' });
    SolicitacaoColeta.belongsTo(models.Veiculo, { foreignKey: 'veiculo_id' });
    SolicitacaoColeta.hasMany(models.HistoricoSolicitacao, { foreignKey: 'solicitacao_id' });
  }
  }
  SolicitacaoColeta.init({
    usuario_id: DataTypes.INTEGER,
    endereco_id: DataTypes.INTEGER,
    veiculo_id: DataTypes.INTEGER,
    tipo_lixo: DataTypes.STRING,
    status: DataTypes.STRING,
    data_solicitacao: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'SolicitacaoColeta',
    tableName: 'SolicitacaoColetas'
  });
  return SolicitacaoColeta;
};