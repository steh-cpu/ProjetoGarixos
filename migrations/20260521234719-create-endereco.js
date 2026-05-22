'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Enderecos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        references: {
        model: 'Usuarios',
        key: 'id'
      },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // ou 'CASCADE'

      },
      cep: {
        type: Sequelize.STRING
      },
      logradouro: {
        type: Sequelize.STRING
      },
      bairro: {
        type: Sequelize.STRING
      },
      numero: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Enderecos');
  }
};