'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ZonaColeta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    ZonaColeta.belongsTo(models.EmpresaLimpeza, { foreignKey: 'empresa_id' });
    ZonaColeta.hasMany(models.HorarioColeta, { foreignKey: 'zona_id' });
    ZonaColeta.hasMany(models.Endereco, { foreignKey: 'zona_id' });
  }
  }
  ZonaColeta.init({
    empresa_id: DataTypes.INTEGER,
    nome_zona: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ZonaColeta',
    tableName: 'ZonaColetas'
  });
  return ZonaColeta;
};