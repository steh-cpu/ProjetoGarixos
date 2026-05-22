'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmpresaLimpeza extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  static associate(models) {
    EmpresaLimpeza.hasMany(models.Veiculo, { foreignKey: 'empresa_id' });
    EmpresaLimpeza.hasMany(models.ZonaColeta, { foreignKey: 'empresa_id' });
    EmpresaLimpeza.hasMany(models.Usuario, { foreignKey: 'empresa_id' });
  }
  }
  EmpresaLimpeza.init({
    nome: DataTypes.STRING,
    cnpj: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EmpresaLimpeza',
  });
  return EmpresaLimpeza;
};