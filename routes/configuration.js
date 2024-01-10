var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    moment = require('moment'),
    queryString = require('querystring'),
    router = express.Router(),
    checkAccess = require('../accessControl')
    con = require('../database/database')
;

router.get('/setup-session', function (req, res) {
    res.sendFile(path.join(__dirname,'../views/administrator/softwareConfiguration.html'))
})

router.get('/access-management', function (req, res) {
    res.sendFile(path.join(__dirname,'../views/administrator/accessManagement.html'))
})

router.get('/course-management', function (req, res) {
    res.sendFile(path.join(__dirname,'../views/administrator/manageCourse.html'))
})

router.post('/setupNewSession', function (req, res) {
    con.query("INSERT INTO `SoftwareConfiguration` (`InstituteCode`, `AcademicSession`, `ClassesList`, `FeeTypes`) SELECT `InstituteCode`, '" + req.body.newSessionTitle + "' AS `AcademicSession`, `ClassesList`, `FeeTypes` FROM `SoftwareConfiguration` WHERE `InstituteCode` = " + req.session.User.InstituteCode + " AND `AcademicSession` = '" + req.body.academicSession + "'", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success')
        }
    });
})

router.get('/getAllModules', function (req, res) {
    con.query("SELECT * FROM `Modules`", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result)
        }
    });
})

router.post('/getAccessbyStaffID', function (req, res) {
    con.query("SELECT * FROM `UserLoginDetails` WHERE `InstituteCode` = " + req.session.User.InstituteCode + " AND `EmpID` = " + req.body.staffID, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result)
        }
    });
})

router.post('/updateProfileAccess', function (req, res) {
    con.query("UPDATE `UserLoginDetails` SET `ModuleAccess` = '" + req.body.modules + "', `SubModuleAccess` = '" + req.body.values + "' WHERE `InstituteCode` = " + req.session.User.InstituteCode + " AND `EmpID` = " + req.body.StaffID, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success')
        }
    });
})

router.post('/getStaffAccessDetails', function (req, res) {
    var query = "SELECT StaffID, Name, FatherName, ContactNumber, UserEmail, ResidentialAddress, Gender, ModuleAccess, SubModuleAccess FROM `UserBioData` JOIN `UserLoginDetails` ON `UserBioData`.`StaffID` = `UserLoginDetails`.`EmpID` WHERE `UserBioData`.`InstituteCode` = " + req.session.User.InstituteCode;
    if(req.body.filter != 'all'){
        query += " AND EmploymentStatus = '" + req.body.filter + "'"
    }
    con.query(query, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result)
        }
    });
})

router.post('/getSubjects', function (req, res) {
    con.query("SELECT * FROM Subjects WHERE `InstituteCode` = " + req.session.User.InstituteCode + " AND `AcademicSession` = '" + req.body.academicSession + "'", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result)
        }
    });
})

router.get('/getTeachersList', function (req, res) {
    con.query("SELECT * FROM `UserBioData` JOIN `UserLoginDetails` ON `UserBioData`.StaffID = `UserLoginDetails`.EmpID WHERE `UserBioData`.`InstituteCode` = " + req.session.User.InstituteCode + " AND `UserLoginDetails`.`InstituteCode` = " + req.session.User.InstituteCode + " AND `EmploymentStatus` = 'Active'", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result)
        }
    });
})

router.post('/getTeachersSubjects', function (req, res) {
    con.query("SELECT * FROM `AssignedSubjectsToTeachers` WHERE `InstituteCode` = " + req.session.User.InstituteCode + " AND `TeacherID` = " + req.body.TeacherID, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result)
        }
    });
})

router.post('/addNewSubject', function (req, res) {
    var params = new URLSearchParams(req.body.subjectTitle);
    var subjectTitles = params.getAll('subjectTitle');
    var a = 1, isError = false, errorMessage = '';
    subjectTitles.forEach(element => {
        con.query("INSERT INTO `Subjects` (`InstituteCode`, `AcademicSession`, `SubjectName`) VALUES (" + req.session.User.InstituteCode + ", '" + req.body.academicSession + "', '" + element + "')", function (err, result) {
            if (err){
                isError = true;
                errorMessage = err.sqlMessage;
            }

            if(a == subjectTitles.length && isError){
                res.json(errorMessage)
            }
            else if (a == subjectTitles.length && !isError){
                res.json('Success')
            }
            a++;
        });
    });
})

router.post('/assignToClass', function (req, res) {
    var params = new URLSearchParams(req.body.details);
    con.query("UPDATE Subjects SET `Classes` = '" + params.getAll('classes').join(',') + "' WHERE ID = " + params.getAll('subjectToAssign') + " AND `InstituteCode` = " + req.session.User.InstituteCode + " AND `AcademicSession` = '" + req.body.academicSession + "'", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success')
        }
    });
})

router.post('/getAssignedTeachers', function (req, res) {
    con.query("SELECT `AssignedSubjectsToTeachers`.*, `UserBioData`.`Name` FROM `AssignedSubjectsToTeachers` JOIN `UserBioData` ON `TeacherID` = `StaffID` WHERE `AssignedSubjectsToTeachers`.`InstituteCode` = " + req.session.User.InstituteCode + " AND `UserBioData`.`InstituteCode` = " + req.session.User.InstituteCode + " AND `AcademicSession` = '" + req.body.academicSession + "'", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result)
        }
    });
})

router.post('/assignCourseToTeachers', function (req, res) {
    var data = queryString.parse(req.body.details);
    var JSONstring = [];
    req.body.subjects.forEach(element => {
        var item = {
            Classes: Array.isArray(data['newSubjectClasses-' + element]) ? data['newSubjectClasses-' + element].join(',') : data['newSubjectClasses-' + element],
            SubjectID: data['newSubject-' + element]
        };
        JSONstring.push(item);
    });
    con.query("DELETE FROM `AssignedSubjectsToTeachers` WHERE `TeacherID` = " + data.teacher + " AND `InstituteCode` = " + req.session.User.InstituteCode + " AND `AcademicSession` = '" + req.body.academicSession + "'; INSERT INTO `AssignedSubjectsToTeachers`(`InstituteCode`, `TeacherID`, `AssignedSubject`, `AcademicSession`) VALUES (" + req.session.User.InstituteCode + ", " + data.teacher + ", '" + JSON.stringify(JSONstring) + "', '" + req.body.academicSession + "');", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success')
        }
    });
})

module.exports = router;