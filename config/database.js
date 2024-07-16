// const { Sequelize } = require('sequelize');

// // config/database.js
// const sequelize = new Sequelize('employee_supply', 'postgres', 'postgres', {
//     host: 'localhost',
//     dialect: 'postgres'
// });

// sequelize.authenticate()
//     .then(() => {
//         console.log('Connection to the database has been established successfully.');
//     })
//     .catch((error) => {
//         console.error('Unable to connect to the database:', error);
//     });

// module.exports = sequelize;;

const { Sequelize } = require('sequelize');
require('dotenv').config();
// config/database.js
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432, // Default port for PostgreSQL
    dialectOptions: {
        ssl: {
            require: true, // Optional: require SSL connection
            rejectUnauthorized: false // Optional: disable rejecting unauthorized SSL certificates
        }
    }
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection to the database has been established successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });

module.exports = sequelize;

