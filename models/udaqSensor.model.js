const Sequelize = require('sequelize');
const sequelize = require('../config/sqlConnect');

const udaqSensor = sequelize.define('udaqSensor', {
    udaqSensorId: {
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
},

    {
        indexes: [{
            fields: ['udaqSensorId']

        }],
        logging: false


    });




module.exports = udaqSensor;