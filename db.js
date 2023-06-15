const mongoose = require('mongoose');
require('dotenv').config();


mongoose.connect(process.env.mongo_URL).then(
    () => {
        console.log('connected to DB')
    }
).catch((err)=>console.log(err))