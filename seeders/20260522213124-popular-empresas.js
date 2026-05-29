'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Insere duas empresas na tabela 'EmpresaLimpezas'
    await queryInterface.bulkInsert('EmpresaLimpezas', [
      {
        nome: 'Garixos Rio Limpeza Urbana LTDA',
        cnpj: '12.345.678/0001-90',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nome: 'EcoZeladoria Carioca S.A.',
        cnpj: '98.765.432/0001-10',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // Remove os dados caso precise limpar o banco
    await queryInterface.bulkDelete('EmpresaLimpezas', null, {});
  }
};
