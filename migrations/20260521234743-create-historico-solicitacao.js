'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HistoricoSolicitacaos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      solicitacao_id: {
        type: Sequelize.INTEGER,
        references: {
        model: 'SolicitacaoColetas',
        key: 'id'
      },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // ou 'CASCADE'

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
      status_anterior: {
        type: Sequelize.ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'),
        defaultValue: 'PENDENTE'
      },
      status_novo: {
        type: Sequelize.ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'),
        defaultValue: 'PENDENTE'
      },
      data_alteracao: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('HistoricoSolicitacaos');
  }
};