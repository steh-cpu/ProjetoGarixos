const { Sequelize } = require('sequelize');
const config = require('./config/config.json').development;
const sequelize = new Sequelize(config.database, config.username, config.password, { host: config.host, dialect: config.dialect });

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SuporteSolicitacoes" (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        assunto VARCHAR(255) NOT NULL,
        mensagem TEXT NOT NULL,
        tipo_feedback VARCHAR(255),
        status VARCHAR(255) DEFAULT 'aberto',
        usuario_id INTEGER REFERENCES "Usuarios"(id) ON UPDATE CASCADE ON DELETE SET NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `);
    console.log('Tabela criada');
  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
})();
