const express = require("express"), bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.get("/", (req, res) => {
   res.status(200).send({message: 'Ucuncu version'});
})
app.listen(8000);
process.on('unhandledRejection', (reason, p) => {
}).on('uncaughtException', err => {
});