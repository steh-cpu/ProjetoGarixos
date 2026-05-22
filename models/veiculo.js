'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Veiculo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    Veiculo.belongsTo(models.EmpresaLimpeza, { foreignKey: 'empresa_id' });
    Veiculo.hasMany(models.SolicitacaoColeta, { foreignKey: 'veiculo_id' }); // Pois 1 veículo atende várias solicitações
  }
  }
  Veiculo.init({
    empresa_id: DataTypes.INTEGER,
    placa: DataTypes.STRING,
    marca: DataTypes.STRING,
    modelo: DataTypes.STRING,
    ano: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Veiculo',
  });
  return Veiculo;
};