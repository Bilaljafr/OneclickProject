var mysql = require('mysql'),
    credentials = require('./database-credentials'),
    con = mysql.createPool(credentials)
;

var con = mysql.createConnection(credentials);
con.connect(function(err) {
 if (err){
    console.log('An error occured while contacting to database. Error code: ' + err.message)
   }
 });

module.exports = con;