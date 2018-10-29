//Dependencias
const rp = require('request-promise')
var request = require('request')
const express = require('express')
const app = express()
const mysql = require('mysql')
const morgan = require('morgan')
var uuid = require('node-uuid');
var httpContext = require('express-http-context');
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
  host: 'mysql-datos-2.cyufope5fgiy.us-east-1.rds.amazonaws.com',
  port: 3306,
  user: 'root',
  password: 'root1234',
  database: 'MySQL_Datos_2'
})


app.get("/test", (req, res) => {
  
})

app.get('/history/:userId', (req, res) => {
  console.log("Fetching history by userId")
   const queryString = "SELECT fecha, topic FROM user_logs where usuario = ? "
  connection.query(queryString, [req.params.userId], (err, rows, fields) => {
    if (err) {
      console.log("Failed to query for users: " + err)
      res.sendStatus(500)
      return
      // throw err
    }
    var historyUser = rows.map((row) => {
      return {"Date": row.fecha, "Topic": row.topic, "URL": "http://localhost:3003/search/" + row.topic + "/" + req.params.userId};
    })
    res.json(historyUser)
  })
})

// localhost:3005
app.listen(3005, () => {
  console.log("Server is up and listening on 3005...")
})

app.get('/', (req, res) => {
  res.json("Datos2 API");
})
