const mongoose = require('mongoose')
const thingSchema = new mongoose.Schema({
    protocol: {
        type: String,
        required: true
    },
    container: {
        type: Number,
        required: false
    },
    Ip: {
        type: String,
        required: false
    },
    body: {
        type: String,
        required: false
    },
    testId: {
        type: String,
        required: false
    },
    deviceId: {
        type: Number,
        required: false
    },
    port: {
        type: Number,
        required: false
    },
    timer: {
        type: Number,
        required: false
    },
});
const mongo = mongoose.model('controller', thingSchema);
module.exports = mongo