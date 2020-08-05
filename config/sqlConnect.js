const Sequelize = require('sequelize')
require('dotenv').config()
const db = new Sequelize(process.env.SQL_TABLE,  process.env.SQL_NAME,  process.env.SQL_PASSWORD, {
    host:  process.env.SQL_HOST,
    dialect: 'mssql', 
    operatorsAliases: false,
    logging:false,
    dialectOptions: {
        options: {
            "instanceName": process.env.SQL_INSTANCE
        }
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
module.exports = db

