const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require("path");

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'views')));

app.use(express.urlencoded({extended:true}));
var registerMess = require("./routes/registerMess");
var recommendMess = require("./routes/searchMess");

app.use('/',registerMess);
app.use('/',recommendMess);

app.get("/",(req,res)=>{
    res.render("indexN.ejs");
})

app.listen(80,()=>{
    console.log("Server is running at port 80");
})

