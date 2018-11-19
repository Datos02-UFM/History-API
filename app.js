//Dependencias
const rp = require('request-promise')
var request = require('request')
const express = require('express')
const app = express()
const mysql = require('mysql')
const morgan = require('morgan')
var uuid = require('node-uuid');
var httpContext = require('express-http-context');
const endpoint = "http://ec2-34-238-136-29.compute-1.amazonaws.com:3003/search/";
 //logs con timings de requests 
app.use(morgan('short'));
//sessionId
app.use(httpContext.middleware);
// Asigna unique identifier a cada request
app.use(function(req, res, next) {
  httpContext.set('reqId', uuid.v1());
  next();
});

//Define conexion a db
const connection = mysql.createConnection({
  host: 'datos2final.cr0c2d7y40q0.us-east-1.rds.amazonaws.com',
  port: 3306,
  user: 'root',
  password: 'root1234',
  database: 'datosfinal'
})


app.get("/test", (req, res) => {
  
})

app.get('/history/:userId', (req, res) => {
  console.log("Fetching history by userId")
   const queryString = " SELECT fecha, topic FROM history WHERE usuario = ? GROUP BY topic ORDER BY fecha DESC LIMIT 10 "
  connection.query(queryString, [req.params.userId], (err, rows, fields) => {
    if (err) {
      console.log("Failed to query for users: " + err)
      res.sendStatus(500)
      return
      // throw err
    }
    var historyUser = rows.map((row) => {
      return {"Date": row.fecha, "Topic": row.topic, "URL": endpoint + row.topic + "/" + req.params.userId};
    })
    res.json(historyUser)
  })
})

app.get('/notification/:userId/:topic', (req, res) => {
  var userId = req.params.userId;
  var topic = req.params.topic;
  console.log("Comparing results")
  const queryString = " SELECT result FROM history WHERE topic = ? AND usuario = ? ORDER BY fecha DESC LIMIT 1; "
  connection.query(queryString, [topic, userId], (err, rows, fields) => {
    if (err) {
      console.log("Failed to retrieve: " + err)
      res.sendStatus(500)
      return
      // throw err
    }else{
      var result = rows.map((row) => {
       return  row.result
      })
      goFetch(topic, function(returnValue) {
        if (returnValue != 0){
          var apiResponse = returnValue;
          res.json(apiResponse)
        }
      }); 
      console.log("mysql got " + result);
    }
  })
})

function goFetch(topic, callback) {
  rp(endpoint + topic)
  .then(function (parseBody) {
      respo = parseBody;
  })
  .catch(function (err) {
      // Crawling failed...
      console.log("Failed " + err);
      callback(0);
  }).finally(function(){
    console.log("Response api: " + respo);
    callback(respo);
  });
}

// localhost:3005
app.listen(3005, () => {
  console.log("Server is up and listening on 3005...")
})

app.get('/', (req, res) => {
  res.json("Datos2 API");
})
