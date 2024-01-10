var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    moment = require('moment'),
    router = express.Router();

const con = require('../database/database');
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/profile', function (req, res) {
    res.sendFile(path.join(__dirname,'../views/profile.html'))
})

router.get('/getProfileDetails', function (req, res) {
    res.json(req.session.User)
})

router.post('/updateProfileDetails', function (req, res) {
    var query = "UPDATE `UserBioData` SET `Name` = '" + req.body.staffName + "', `FatherName` = '" + req.body.fatherName + "', `CityOfBirth` = '" + req.body.cityOfBirth + "', `ContactNumber` = '" + req.body.contactNumber + "', `ResidentialAddress` = '" + req.body.residentialAddress + "', `Gender` = '" + req.body.gender + "', `DateOfBirth` = '" + req.body.dateOfBirth + "', `Qualification` = '" + req.body.qualification + "', `Nationality` = '" + req.body.nationality + "', `Religion` = '" + req.body.religion + "', `MotherTongue` = '" + req.body.motherTongue + "', `MaritalStatus` = '" + req.body.maritalStatus + "' WHERE `StaffID` = '" + req.session.User.EmpID + "' AND `InstituteCode` = '" + req.session.User.InstituteCode + "';UPDATE `UserLoginDetails` SET `UserEmail` = '" + req.body.email + "' WHERE `EmpID` = " + req.session.User.EmpID + " AND `InstituteCode` = " + req.session.User.InstituteCode;
    if(req.session.User.Type == "Student"){
        query = "UPDATE `StudentsRecord` SET `StudentsName` = '" + req.body.staffName + "', `FatherName` = '" + req.body.fatherName + "', `CityOfBirth` = '" + req.body.cityOfBirth + "', `ContactNumber` = '" + req.body.contactNumber + "', `ResidentialAddress` = '" + req.body.residentialAddress + "', `Gender` = '" + req.body.gender + "', `DateOfBirth` = '" + req.body.dateOfBirth + "', `Nationality` = '" + req.body.nationality + "', `Religion` = '" + req.body.religion + "', `MotherTongue` = '" + req.body.motherTongue + "', `MaritalStatus` = '" + req.body.maritalStatus + "' WHERE `GRNumber` = '" + req.session.User.GRNumber + "' AND `InstituteCode` = '" + req.session.User.InstituteCode + "';UPDATE `StudentLoginDetails` SET `UserEmail` = '" + req.body.email + "' WHERE `GRNumber` = " + req.session.User.EmpID + " AND `InstituteCode` = " + req.session.User.InstituteCode;
    }
    con.query(query, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success')
        }
    });
})

router.post('/updatePassword', function (req, res) {
    var query = "UPDATE `UserLoginDetails` SET `UserPassword` = '" + req.body.password + "' WHERE `EmpID` = " + req.session.User.EmpID + " AND `InstituteCode` = " + req.session.User.InstituteCode;
    if(req.session.User.Type == "Student"){
        query = "UPDATE `StudentLoginDetails` SET `UserPassword` = '" + req.body.password + "' WHERE `GRNumber` = " + req.session.User.EmpID + " AND `InstituteCode` = " + req.session.User.InstituteCode;
    }
    con.query(query, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success')
        }
    });
})

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './assets/images/profilePictures/');
    },
    filename: function(req, file, cb) {
        // cb(null, Date.now() + '-' + file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.mimetype.split("/")[1]);
    }
});
const upload = multer({ storage: storage });

router.post('/uploadDP', upload.single('new-dp'), function(req, res) {
    con.query("UPDATE `UserBioData` SET `profilePicture` = '" + req.file.filename + "' WHERE `StaffID` = '" + req.session.User.EmpID + "' AND `InstituteCode` = '" + req.session.User.InstituteCode + "'", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success')
        }
    });
});

module.exports = router;