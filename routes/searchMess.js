var express=require("express");
var request = require("request");
var router = express.Router();
const Pool = require("pg").Pool;

const pool = new Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB_DATABASE,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT
})


router.get("/search",function(req,res){
    res.render("userRegN.ejs");
})

router.post("/search",function(req,res){
    var loc = req.body.add1+","+req.body.add2+","+req.body.stat+","+req.body.coun;
    var url = "https://api.opencagedata.com/geocode/v1/json?q=" + loc +"&key=f9d4c3ced3904ebd9f05802bd651534b";
    var latitude,longitude;

    var mp = new Map();
    request(url,{json:true},(err,result,body)=>{
        if(err){
            
        }else{
            var arr=[];
            latitude = body.results[0].geometry.lat;
            // latitude = 16.696;
            longitude = body.results[0].geometry.lng;
            // longitude = 74.232;
            pool.query("select * from mess_registered",[],(err,result)=>{
                if(err){
                    console.log(err);
                }else{
                    for(var i=0;i<result.rowCount;i++){
                        var lat = parseFloat(result.rows[i].latitude);
                        var lng = parseFloat(result.rows[i].longitude);
                        var distance = getDistanceFromLatLonInKm(latitude,longitude,lat,lng);
                        arr.push({details:result.rows[i],distance:distance});
                    }
                    arr.sort(function(a,b){
                        if(a.distance<b.distance){
                            return -1;
                        }else if(a.distance>b.distance){
                            return 1;
                        }
                        return 0;
                    });
                    // console.log(arr);
                    res.render("resultDisplay.ejs",{list:arr});
                }
            });
            
        }
    })
})

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }


router.get("/search/(:mess_id)",function(req,res,next){
    var arr=[];
    pool.query("select * from menu_cards where mess_id=$1",[req.params.mess_id],(err,result1)=>{
        if(err){
            console.log(err);
        }else{
            var arr=result1.rows;
            pool.query("select * from mess_registered where mess_id=$1",[req.params.mess_id],(err,result2)=>{
                var details = result2.rows;
                // console.log(result2.rows);
                res.render("messOneDetails.ejs",{list:arr,details:details});
            })
        }
    })
    
})

module.exports = router;