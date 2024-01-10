var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    moment = require('moment'),
    router = express.Router(),
    checkAccess = require('../accessControl')
    con = require('../database/database')
;

router.get('/students-attendance', function (req, res) {
    res.sendFile(path.join(__dirname,'../views/administrator/studentAttendance.html'))
})

router.get('/staffs-attendance', function (req, res) {
    res.sendFile(path.join(__dirname,'../views/administrator/staffAttendance.html'))
})

router.post('/uploadStudentAttendance', function (req, res) {
    con.query("SELECT * FROM `StudentAttendanceRecord` WHERE `InstituteCode` = " + req.session.User.InstituteCode + " AND `Date` = '" + req.body.dated + "' AND ClassID = " + req.body.classID, function (err, result) {
        if (!err){
            var query = "INSERT INTO `StudentAttendanceRecord` (`InstituteCode`, `Session`, `ClassID`,`StudentGR`, `Date`) VALUES('" + req.session.User.InstituteCode + "', '" + req.body.session + "', '" + req.body.classID + "', '" + req.body.presentStudents + "', '" + req.body.dated + "');"
            if(result.length > 0){
                query = "UPDATE `StudentAttendanceRecord` SET `StudentGR` = '" + req.body.presentStudents + "' WHERE `InstituteCode` = " + req.session.User.InstituteCode + " AND `Date` = '" + req.body.dated + "' AND `ClassID` = '" + req.body.classID + "'" 
            }
            con.query(query, function (err, result) {
                if (err){
                    res.json(err.sqlMessage);
                }
                else{
                    res.json('Success')
                }
            });
        }
    });
})

router.post('/getStudentAttendanceReport', function (req, res) {
    if(req.body.generateFor == 'students' && req.body.students != ''){
        var query = "SELECT * FROM `ExpenseRecord` JOIN `UserBioData` ON `UserBioData`.`StaffID` = `ExpenseRecord`.`UploadedBy` WHERE `Date` >= '" + req.body.dateFrom + "' AND `DATE` <= '" + req.body.dateTill + "' AND `ExpenseRecord`.`InstituteCode` = '" + req.session.User.InstituteCode + "'";
        con.query(query, function (err, result) {
            if (err){
                res.json(err.sqlMessage);
            }
            else{
                res.json(result)
            }
        });
    }
    else if(req.body.generateFor == 'classes' && req.body.classes != ''){
        var query = "SELECT * FROM `ExpenseRecord` JOIN `UserBioData` ON `UserBioData`.`StaffID` = `ExpenseRecord`.`UploadedBy` WHERE `Date` >= '" + req.body.dateFrom + "' AND `DATE` <= '" + req.body.dateTill + "' AND `ExpenseRecord`.`InstituteCode` = '" + req.session.User.InstituteCode + "'";
        con.query(query, function (err, result) {
            if (err){
                res.json(err.sqlMessage);
            }
            else{
                res.json(result)
            }
        });
    }
    else{
        res.json('Please select all parameters to generate report.')
    }
})

module.exports = router;