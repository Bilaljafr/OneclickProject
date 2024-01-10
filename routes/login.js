const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    MySqlStore = require('express-mysql-session')(session),

    con = require('../database/database'),
    credentials = require('../database/database-credentials'),
    router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(session({
    secret: 'myKey',
    resave: false,
    saveUninitialized: false,
    store: new MySqlStore(credentials),
}));

router.get('/', function (req, res) {
    if(req.session.User){
        res.redirect('/dashboard')
    }
    else{
        res.sendFile(path.join(__dirname,'../views/sign-in.html'))

        
    }
    
})

router.post('/', function (req, res) {
    if(req.body.loginType == 'Staff'){
        const query = "SELECT * FROM `UserLoginDetails` JOIN `UserBioData` ON UserLoginDetails.EmpID = UserBioData.StaffID JOIN InstituteDetails On UserLoginDetails.InstituteCode = InstituteDetails.InstituteCode JOIN `SoftwareConfiguration` On SoftwareConfiguration.InstituteCode = InstituteDetails.InstituteCode WHERE UserEmail = '" + req.body.email + "' AND UserPassword = '" + req.body.password + "'"
        con.query(query, function (err, result) {
            if (err){
                res.json(err.sqlMessage);
            }
            else{
                if(result.length > 0){
                    if(result[0].ServiceStatus == 'Active' && result[0].EmploymentStatus == 'Active'){
                        con.query("SELECT * FROM Modules WHERE FIND_IN_SET(ModuleID, (SELECT ModuleAccess FROM UserLoginDetails WHERE UserEmail = '" + req.body.email + "' AND UserPassword = '" + req.body.password + "'))", function (err, result1) {
                            if (!err){
                                req.session.User = Object.assign({}, result[0], {'access': result1});
                                res.json('Success')
                            }
                        });
                    }
                    else if(result[0].ServiceStatus != 'Active'){
                        res.json('Your service status is ' + result[0].ServiceStatus + '.<br>Please contact eIMS Sales & Support Depart.')
                    }
                    else{
                        res.json('Your employement status is ' + result[0].EmploymentStatus + '.<br>Please contact your management.')
                    }
                }
                else{
                    res.json('Username or password was found to be incorrect.')
                }
            }
        });
    }
    else{
        var query = "SELECT * FROM `StudentLoginDetails` JOIN `StudentsRecord` ON StudentLoginDetails.GRNumber = StudentsRecord.GRNumber JOIN InstituteDetails On StudentLoginDetails.InstituteCode = InstituteDetails.InstituteCode WHERE UserEmail = '" + req.body.email + "' AND UserPassword = '" + req.body.password + "'"
        con.query(query, function (err, result) {
            if (err){
                res.json(err.sqlMessage);
            }
            else{
                if(result.length > 0){
                    if(result[0].ServiceStatus == 'Active' && result[0].DateOfTermination == '0000-00-00'){
                        con.query("SELECT * FROM Modules WHERE FIND_IN_SET(ModuleID, (SELECT ModuleAccess FROM StudentLoginDetails WHERE UserEmail = '" + req.body.email + "' AND UserPassword = '" + req.body.password + "'))", function (err, result1) {
                            if (!err){
                                const data = result[0];
                                const alteredData = {
                                    ...data,
                                    Name: data.StudentsName,
                                    profilePicture: data.Image,
                                    Type: 'Student'
                                };
                                delete alteredData.StudentsName;
                                delete alteredData.Image;

                                req.session.User = Object.assign({}, alteredData, {'access': result1});
                                res.json('Success')
                            }
                        });
                    }
                    else if(result[0].ServiceStatus != 'Active'){
                        res.json('Your service status is ' + result[0].ServiceStatus + '.<br>Please contact eIMS Sales & Support Depart.')
                    }
                    else{
                        res.json('Your ID has been disabled.<br>Please contact your management.')
                    }
                }
                else{
                    res.json('Username or password was found to be incorrect.')
                }
            }
        });
    }
})

module.exports = router;