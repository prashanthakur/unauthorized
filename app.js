const express = require('express');
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const PORT= process.env.PORT || 5000;
const {MONGOURI} = require('./config/keys')

app.use(cors())

app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin','*');
    next();
});


mongoose.connect(MONGOURI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
mongoose.connection.on('connected',()=>{
    console.log("connected to mongoDb Yeah!")
})
mongoose.connection.on('error',()=>{
    console.log("Error in connecting")
})

require('./models/user')
require('./models/post')

app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))


// if(process.env.NODE_ENV=="production"){
//     app.use(express.static('client/build'))
//     const path = require('path')
//     app.get("*",(req,res)=>{
//         res.send(path.resolve(__dirname,'client','build','index.html'))
//     })
// }

app.listen(PORT,()=>{
    console.log("server is running on",PORT)
})