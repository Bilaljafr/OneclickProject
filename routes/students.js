var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    moment = require('moment'),
    router = express.Router(),
    checkAccess = require('../accessControl')
    con = require('../database/database')
;

router.get('/present-students', function (req, res) {
    res.sendFile(path.join(__dirname,'../views/administrator/browseStudent.html'))
})

router.get('/left-students', function (req, res) {
    res.sendFile(path.join(__dirname,'../views/administrator/leftStudent.html'))
})

router.get('/upgrade-profile', function (req, res) {
    res.sendFile(path.join(__dirname,'../views/administrator/upgradeProfile.html'))
})

router.get('/enroll-student', function (req, res) {
    res.sendFile(path.join(__dirname,'../views/administrator/enrollStudent.html'))
})

router.post('/getLeftStudentsByClass', function (req, res) {
    con.query("SELECT * FROM `StudentsRecord` JOIN `StudentClassesHistory` ON `GRNumber` = `StudentGR` WHERE `StudentClassesHistory`.`InstituteCode` = " + req.session.User.InstituteCode + " AND `StudentClassesHistory`.`AcademicSession` = '" + req.body.academicSession + "' AND `PresentClass` = '" + req.body.presentClass + "' AND `DateOfTermination` != '0000-00-00'", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result)
        }
    });
})

router.post('/updateStudentData', function (req, res) {
    // con.query("UPDATE `StudentsRecord` SET `FormNumber` = " + req.body.formNumber + ", `StudentsName` = '" + req.body.studentName + "', `FatherName` = '" + req.body.fatherName + "', `CityOfBirth` = '" + req.body.cityOfBirth + "', `ContactNumber` = " + req.body.contactNumber + ", `ResidentialAddress` = '" + req.body.residentialAddress + "', `Gender` = '" + req.body.gender + "', `DateOfBirth` = '" + req.body.dateOfBirth + "', `ClassOfAdmission` = " + req.body.classofAdmission + ", `AcademicSession` = '" + req.body.academicSessions + "', `Nationality` = '" + req.body.nationality + "', `Religion` = '" + req.body.religion + "', `MotherTongue` = '" + req.body.motherTongue + "' WHERE `GRNumber` = " + req.body.grNumber + " AND `InstituteCode` = " + req.session.User.InstituteCode + "; UPDATE `StudentClassesHistory` SET `StudentGR` = " + req.body.grNumber + ", `PresentClass` = " + req.body.classofAdmission + " WHERE `StudentGR` = " + req.body.grNumber + " AND `AcademicSession` = '" + req.body.academicSessions + "' AND `InstituteCode` = " + req.session.User.InstituteCode, function (err, result) {
    con.query("UPDATE `StudentsRecord` SET `FormNumber` = " + req.body.formNumber + ", `StudentsName` = '" + req.body.studentName + "', `FatherName` = '" + req.body.fatherName + "', `CityOfBirth` = '" + req.body.cityOfBirth + "', `ContactNumber` = " + req.body.contactNumber + ", `ResidentialAddress` = '" + req.body.residentialAddress + "', `Gender` = '" + req.body.gender + "', `DateOfBirth` = '" + req.body.dateOfBirth + "', `Nationality` = '" + req.body.nationality + "', `Religion` = '" + req.body.religion + "', `MotherTongue` = '" + req.body.motherTongue + "' WHERE `GRNumber` = " + req.body.grNumber + " AND `InstituteCode` = " + req.session.User.InstituteCode, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success')
        }
    });
})

router.post('/enableStudentProfile', function (req, res) {
    con.query("UPDATE `StudentsRecord` SET `DateOfTermination` = '0000-00-00' WHERE `GRNumber` = " + req.body.grNumber + " AND `InstituteCode` = " + req.session.User.InstituteCode + "; DELETE FROM `StudentClassesHistory` WHERE StudentGR = " + req.body.grNumber + " AND `InstituteCode` = " + req.session.User.InstituteCode + " AND AcaemicSession = '" + req.body.academicSessionsForEnable + "'; INSERT INTO `StudentClassesHistory`(`StudentGR`, `InstituteCode`, `PresentClass`, `AcademicSession`) VALUES (" + req.body.grNumber + ", " + req.session.User.InstituteCode + ", " + req.body.classofAdmissionForEnable + ", '" + req.body.academicSessionsForEnable + "')", function (err, results) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success')
        }
    });
})

router.post('/disableStudentProfile', function (req, res) {
    con.query("UPDATE `StudentsRecord` SET `DateOfTermination` = '" + req.body.studentDisableDate + "', `DisableReason` = '" + req.body.disableReason + "' WHERE `GRNumber` = " + req.body.disableStudentID + " AND `InstituteCode` = " + req.session.User.InstituteCode, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success')
        }
    });
})

router.get('/getUpcomingGR', function (req, res) {
    con.query("SELECT `GRNumber` FROM `StudentsRecord` WHERE InstituteCode = " + req.session.User.InstituteCode + " ORDER BY `GRNumber` DESC", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result)
        }
    });
})

router.post('/enrollNewStudent', function (req, res) {
    con.query("INSERT INTO `StudentsRecord`(`InstituteCode`, `GRNumber`, `StudentsName`, `FatherName`, `CityOfBirth`, `ContactNumber`, `AlternateContactNumber`, `Email`, `ResidentialAddress`, `Gender`, `DateOfBirth`, `Nationality`, `Religion`, `MotherTongue`, `DateOfAdmission`) VALUES (" + req.session.User.InstituteCode + ", '" + req.body.grNumber + "', '" + req.body.studentName + "', '" + req.body.fatherName + "', '" + req.body.cityOfBirth + "', '" + req.body.contactNumber + "', '" + req.body.alternateContact + "', '" + req.body.emailAddress + "', '" + req.body.residentialAddress + "', '" + req.body.gender + "', '" + req.body.dateOfBirth + "', '" + req.body.nationality + "', '" + req.body.religion + "', '" + req.body.motherTongue + "', '" + req.body.dateOfAdmission + "'); INSERT INTO `StudentClassesHistory` (`StudentGR`, `InstituteCode`, `PresentClass`, `AcademicSession`) VALUES('" + req.body.grNumber + "', '" + req.session.User.InstituteCode + "', '" + req.body.classofAdmission + "', '" + req.body.academicSession + "')", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success')
        }
    });
})

router.post('/upgradeProfiles', function (req, res) {
    var a = 1, isError = false, errorMessage = '';
    req.body.IDs.forEach(element => {
        con.query("SELECT * FROM `StudentClassesHistory` WHERE `StudentGR` = " + element + " AND `InstituteCode` = " + req.session.User.InstituteCode + " AND `AcademicSession` = '" + req.body.upgradeToSession + "'", function (err, result) {
            if (!err){
                var query = "INSERT INTO `StudentClassesHistory` (`StudentGR`, InstituteCode, PresentClass, AcademicSession) VALUES (" + element + ", " + req.session.User.InstituteCode + ", '" + req.body.upgradeToClass + "', '" + req.body.upgradeToSession + "')";
                if(result.length > 0){
                    var query = "UPDATE `StudentClassesHistory` SET PresentClass = " + req.body.upgradeToClass + " WHERE `StudentGR` = " + element + " AND InstituteCode = " + req.session.User.InstituteCode + " AND AcademicSession = '" + req.body.upgradeToSession + "'";
                }
                con.query(query, function (err1, result1) {
                    if (err1){
                        errorMessage = err1.sqlMessage;
                        isError = true;
                    }
                });

                if(a == req.body.IDs.length && !isError){
                    res.json('Success')
                }
                else if(a == req.body.IDs.length && isError){
                    res.json(errorMessage)
                }
                a++;
            }
        });
    });
})

module.exports = router;