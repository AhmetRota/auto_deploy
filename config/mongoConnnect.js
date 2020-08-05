const mongoose = require('mongoose')
require('dotenv').config();
let db = 'mongodb://' + process.env.MONGOURL + '/communication'
mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
module.exports = mongoose