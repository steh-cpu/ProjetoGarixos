'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Endereco extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    Endereco.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
    Endereco.belongsTo(models.ZonaColeta, { foreignKey: 'zona_id' });
    Endereco.hasMany(models.SolicitacaoColeta, { foreignKey: 'endereco_id' });
  }
  }
  Endereco.init({
    usuario_id: DataTypes.INTEGER,
    cep: DataTypes.STRING,
    logradouro: DataTypes.STRING,
    bairro: DataTypes.STRING,
    numero: DataTypes.STRING,
    zona_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Endereco',
  });
  return Endereco;
};