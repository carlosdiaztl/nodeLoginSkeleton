const Knex = require('knex');
require('dotenv').config();
const knex = Knex({
  client: 'pg',
  connection: {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    port: process.env.POSTGRES_PORT,
    ssl: {
      rejectUnauthorized: false,  // To enable SSL if required by the server
    },
  },
});

// Test the connection (optional)
knex.raw('SELECT 1+1 AS result')
  .then(() => {
    console.log('Connected to PostgreSQL using Knex');
  })
  .catch((err) => {
    console.error('Error connecting to PostgreSQL', err);
  });

  module.exports = knex;