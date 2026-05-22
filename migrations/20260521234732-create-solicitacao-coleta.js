'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SolicitacaoColetas', {
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
      endereco_id: {
        type: Sequelize.INTEGER,
        references: {
        model: 'Enderecos',
        key: 'id'
      },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // ou 'CASCADE'

      },
      veiculo_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
        model: 'Veiculos',
        key: 'id'
      },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // ou 'CASCADE'

      },
      tipo_lixo: {
        type: Sequelize.ENUM('ORGANICO', 'RECICLAVEL', 'ELETRONICO', 'PODA', 'ENTULHO')
      },
      status: {
        type: Sequelize.ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'),
        defaultValue: 'PENDENTE'
      },
      data_solicitacao: {
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
    await queryInterface.dropTable('SolicitacaoColetas');
  }
};