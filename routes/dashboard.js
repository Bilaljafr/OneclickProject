const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    MySqlStore = require('express-mysql-session')(session),

    con = require('../database/database'),
    credentials = require('../database/database-credentials'),
    router = express.Router();

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname,'../views/administrator/index.html'))
})

module.exports = router;