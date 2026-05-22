'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HorarioColetas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      zona_id: {
        type: Sequelize.INTEGER,
        references: {
        model: 'ZonaColetas',
        key: 'id'
      },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // ou 'CASCADE'

      },
      dia_semana: {
        type: Sequelize.ENUM('CLIENTE', 'ADMIN_INTERNO'),
        defaultValue: 'CLIENTE'
      },
      periodo: {
        type: Sequelize.ENUM('MANHA', 'TARDE', 'NOITE')
      },
      tipo_lixo: {
        type: Sequelize.ENUM('ORGANICO', 'RECICLAVEL', 'ELETRONICO', 'PODA', 'ENTULHO')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('HorarioColetas');
  }
};