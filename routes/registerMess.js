const express=require("express");
require("dotenv").config();
const app = express();
var router = express.Router();
const Pool = require("pg").Pool;
const request = require("request");
const {v4 : uuidv4} = require('uuid');


const pool = new Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB_DATABASE,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT
})


router.get('/register',function(req,res,next){
    res.render("messRegN.ejs");
});

router.post('/register',function(req,res,next){
    var name = req.body.name;
    var cuisine = req.body.cui;
    var address = req.body.add1+","+req.body.add2;
    var state = req.body.stat;
    var country = req.body.coun;
    var tablecnt = req.body.tableCnt;
    var phoneNo = req.body.phoneno

    var url="https://api.opencagedata.com/geocode/v1/json?q=" + address+","+state+","+country +"&key=f9d4c3ced3904ebd9f05802bd651534b";
    // console.log(url);
    var latitude,longitude;
    var mess_id = uuidv4();
    
    // console.log(name,cuisine,address,state,country,tablecnt);
    request(url,{json:true},(err,resonse,body)=>{
        if(err){
            console.log(err);
        }else{
            latitude = body.results[0].geometry.lat;
            longitude = body.results[0].geometry.lng;
            pool.query("insert into mess_registered values($1,$2,$3,$4,$5,$6,$7)",[mess_id,name,cuisine,address+","+state+","+country,latitude,longitude,phoneNo],(err,result)=>{
                if(err){
                    console.log(err);
                }else{
                    // console.log("mess_registered succesfully");
                }
            });
        }
    });

    // console.log(typeof req.body.cost1);
    var d = "dish";
    var c = "cost";
    var js = req.body;
    var j=1;
    for(var j=1;j<=tablecnt;j++){
        var dis=d+j,cos=c+j;
        pool.query("insert into menu_cards values($1,$2,$3)",[mess_id,js[dis],js[cos]],(err,result)=>{
            if(err){
                console.log(err);
            }else{
                // console.log("menm");
            }
        })
    }
    
    res.render("messRegN.ejs",{alertMsg:"Mess Registered Successfully"});
});

module.exports = router;