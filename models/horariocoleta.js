'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HorarioColeta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    HorarioColeta.belongsTo(models.ZonaColeta, { foreignKey: 'zona_id' });
  }
  }
  HorarioColeta.init({
    zona_id: DataTypes.INTEGER,
    dia_semana: DataTypes.STRING,
    periodo: DataTypes.STRING,
    tipo_lixo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'HorarioColeta',
  });
  return HorarioColeta;
};