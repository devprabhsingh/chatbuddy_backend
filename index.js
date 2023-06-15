const express = require('express');
const port = 3000;
const app = express();
const bodyParser = require('body-parser');

require('./db');
require('./models/User');

app.use(bodyParser.json());


app.use(require("./routes/authRoutes"));


app.listen(port, () => {
    console.log('server running')
})