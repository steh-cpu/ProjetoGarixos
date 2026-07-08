'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ZonaColetas', [
      {
        empresa_id: 1,
        nome_zona: 'Centro',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        empresa_id: 1,
        nome_zona: 'Botafogo',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        empresa_id: 2,
        nome_zona: 'Tijuca',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        empresa_id: 2,
        nome_zona: 'Barra da Tijuca',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ZonaColetas', null, {});
  }
};
