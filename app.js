/*const express= require('express')
const app= express();
const mongoose= require('mongoose')

mongoose.connect('mongodb+srv://ushar3615:JZ6m5DYxtG0p3r5H@ourtube.fmp8g.mongodb.net/?retryWrites=true&w=majority&appName=ourTube')
.then(res=>{
    console.log('connected with database...')
})
.catch(err=>{
    console.log(err)
})
 

module.exports = app; 

*/

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRoute= require('../api/routes/user')
const videoRoute= require('../api/routes/video')
const commentRoute = require('../api/routes/comment')
const bodyParser= require('body-parser')
const fileUpload = require('express-fileupload')

async function connectDB() {
    try {
        await mongoose.connect('mongodb+srv://ushar3615:JZ6m5DYxtG0p3r5H@ourtube.fmp8g.mongodb.net/?retryWrites=true&w=majority&appName=ourTube');
        console.log('Connected with database...');
    } catch (err) {
        console.log('Database connection error:', err);
    }
}

connectDB();

app.use(bodyParser.json()); 
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

app.use('/user',userRoute)
app.use('/video',videoRoute)
app.use('/comment',commentRoute)
 
module.exports = app;
