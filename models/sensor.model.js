const Sequelize = require('sequelize')
const db = require('../config/sqlConnect')
let vtiTable = db.define('sensor', {
    sensorId: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    isletmeId: {
        type: Sequelize.STRING,
        allowNull: false
    },
    labId: {
        type: Sequelize.STRING,
        allowNull: false
    },
    roomId: {
        type: Sequelize.STRING,
        allowNull: false
    },
    istasyonId: {
        type: Sequelize.STRING,
        allowNull: false
    },
    channelDescription: {
        type: Sequelize.STRING,
        allowNull: false
    },
    dataType: {
        type: Sequelize.STRING,
        allowNull: false
    },
    hardwareType: {
        type: Sequelize.STRING,
        allowNull: false
    },
    connectionType: {
        type: Sequelize.STRING,
        allowNull: false
    },
    connectionParameters: {
        type: Sequelize.STRING(1234),
        allowNull: false
    },
    calA: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    calB: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    used: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    unit: {
        type: Sequelize.STRING,
        allowNull: true
    },
    isActive: {
        type: Sequelize.BOOLEAN
    }
},

    {
        indexes: [{
            fields: ['sensorId']

        }],
        logging: false


    });
module.exports = vtiTable


