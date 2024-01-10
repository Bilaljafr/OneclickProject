var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    moment = require('moment'),
    router = express.Router()
    con = require('../database/database')
;

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/onlineExam', function (req, res) {
    res.sendFile(path.join(__dirname,'../views/administrator/onlineExam.html'))
})

router.post('/getStudentAttendance', function (req, res) {
    con.query("SELECT * FROM `StudentAttendanceRecord` WHERE `InstituteCode` = " + req.session.User.InstituteCode + " AND `Date` = '" + req.body.dated + "' AND ClassID = " + req.body.classID, function (err, result) {
        if (!err){
            res.json(result)
        }
    });
})

router.get('/getSeatsDetails', function (req, res) {
    con.query("SELECT * FROM `StudentsSeatsManagement` WHERE `InstituteCode` = " + req.session.User.InstituteCode + " AND AcademicSession = '" + req.query.academicSession + "'", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result)
        }
    });
})

router.post('/addNewClass', function (req, res) {
    var query = '', sections = '' , maxClassID = 0;
    req.body.sections.forEach(element => {
        sections += element + ','
    });

    query = "SELECT MAX(CAST(JSON_EXTRACT(ClassesList, CONCAT('$[', indices.index, '].ClassID')) AS UNSIGNED)) AS max_class_id FROM SoftwareConfiguration, (SELECT @row_number:=@row_number+1 AS `index` FROM (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t, (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t2, (SELECT @row_number:=0) r) AS indices WHERE JSON_EXTRACT(ClassesList, CONCAT('$[', indices.index, '].ClassID')) IS NOT NULL AND InstituteCode = '" + req.session.User.InstituteCode + "' AND AcademicSession = '" + req.body.academicSession + "';"
    con.query(query, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            query = '', maxClassID = result[0].max_class_id;
            if(maxClassID == null){
                maxClassID = 1
            }
            req.body.classTitle.forEach(element => {
                query += `   SET @newClassName = '` + element + `';
                                SET @newSection ='` + sections.slice(0, -1) + `';
                                UPDATE SoftwareConfiguration
                                SET ClassesList = JSON_MERGE_PRESERVE(
                                        IFNULL(ClassesList, JSON_ARRAY(JSON_OBJECT('ClassID', ` + maxClassID + `, 'ClassName', @newClassName, 'Section', @newSection))
                                    ),
                                    JSON_ARRAY(
                                        JSON_OBJECT('ClassID', ` + maxClassID + ` + 1, 'ClassName', @newClassName, 'Section', @newSection)
                                    )
                                )
                                WHERE InstituteCode = ` + req.session.User.InstituteCode + ` AND AcademicSession = '` + req.body.academicSession + `' AND NOT JSON_CONTAINS(ClassesList, JSON_OBJECT('ClassName', @newClassName));
                            `
                ;
                maxClassID++;
            });
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

router.post('/addSeatsDetails', function (req, res) {
    var queries = [];
    req.body.section.forEach(element => {
        queries.push(new Promise((resolve, reject) => {
            con.query("SELECT * FROM `StudentsSeatsManagement` WHERE `InstituteCode` = " + req.session.User.InstituteCode + " AND `AcademicSession` = '" + req.body.academicSession + "' AND `ClassID` = " + req.body.classID + " AND `Section` = '" + element + "'", function (err, result) {
                if (!err){
                    if(result.length == 0){
                        resolve("INSERT INTO `StudentsSeatsManagement`(`InstituteCode`, `AcademicSession`, `ClassID`, `Section`, `TotalSeats`) VALUES (" + req.session.User.InstituteCode + ", '" + req.body.academicSession + "', " + req.body.classID + ", '" + element + "', " + req.body.totalSeats + ");");
                    }
                    else {
                        resolve(null); // resolve with null if the record already exists
                    }
                }
                else {
                    reject(err);
                }
            });
        }));
    });

    Promise.all(queries).then(values => {
        var query = values.filter(val => val !== null).join(''); // join the queries that are not null
        if (query !== "") {
            con.query(query, function (err, result) {
                if (err){
                    res.json(err.sqlMessage);
                }
                else{
                    res.json('Success')
                }
            });
        }
        else {
            res.json('This class & section has already been added.');
        }
    }).catch(err => {
        res.json(err);
    });

    // var query = "";
    // req.body.section.forEach(element => {
    //     con.query("SELECT * FROM `StudentsSeatsManagement` WHERE `InstituteCode` = " + req.session.User.InstituteCode + " AND `AcademicSession` = '" + req.body.academicSession + "' AND `ClassID` = " + req.body.classID + " AND `Section` = '" + element + "'", function (err, result) {
    //         if (!err){
    //             if(result.length == 0){
    //                 query += "INSERT INTO `StudentsSeatsManagement`(`InstituteCode`, `AcademicSession`, `ClassID`, `Section`, `TotalSeats`) VALUES (" + req.session.User.InstituteCode + ", '" + req.body.academicSession + "', " + req.body.classID + ", '" + element + "', " + req.body.totalSeats + ");"
    //             }
    //         }
    //     });
    // });

    // con.query(query, function (err, result) {
    //     if (err){
    //         if(err.sqlMessage == 'Query was empty'){
    //             res.json('This class & section has already been added.');
    //         }
    //         else{
    //             res.json(err.sqlMessage);
    //         }
    //     }
    //     else{
    //         res.json('Success')
    //     }
    // });
})

router.post('/getSeatsDetailsByClassID', function (req, res) {
    con.query("SELECT * FROM `StudentsSeatsManagement` WHERE InstituteCode = " + req.session.User.InstituteCode + " AND ClassID = " + req.body.classID, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result)
        }
    });
})

router.post('/editSeatsDetails', function (req, res) {
    con.query("UPDATE `StudentsSeatsManagement` SET `TotalSeats`= " + req.body.seatsCount + " WHERE `InstituteCode` = " + req.session.User.InstituteCode + " AND AcademicSession = '" + req.body.academicSession + "' AND ClassID = " + req.body.classID + " AND Section = '" + req.body.section + "'", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success')
        }
    });
})


router.post('/deleteSeatsRecord', function (req, res) {
    con.query("DELETE FROM `StudentsSeatsManagement` WHERE InstituteCode = " + req.session.User.InstituteCode + " AND AcademicSession = '" + req.body.academicSession + "' AND ClassID = " + req.body.classID + " AND Section = '" + req.body.section + "'", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success')
        }
    });
})

router.post('/modifyClassDetails', function (req, res) {
    const query = `UPDATE SoftwareConfiguration SET ClassesList = '${JSON.stringify(req.body.classesList)}' WHERE InstituteCode = 123456789 AND AcademicSession = '2022-23'`;
    con.query(query, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success')
        }
    });
})

router.post('/deleteClass', function (req, res) {
    con.query("SELECT * FROM `StudentClassesHistory` WHERE `InstituteCode` = '" + req.session.User.InstituteCode + "' AND PresentClass = '" + req.body.classToDelete + "' AND AcademicSession = '" + req.body.academicSession + "'", function (err, result) {
        if (!err){
            if(result.length == 0){
                const query = `UPDATE SoftwareConfiguration SET ClassesList = '${JSON.stringify(req.body.classesList)}' WHERE InstituteCode = 123456789 AND AcademicSession = '${req.body.academicSession}'`;
                con.query(query, function (err, result) {
                    if (!err){
                        con.query("DELETE FROM `StudentsSeatsManagement` WHERE InstituteCode = " + req.session.User.InstituteCode + " AND AcademicSession = '" + req.body.academicSession + "' AND ClassID = " + req.body.classToDelete, function (err, result) {
                            if (err){
                                res.json(err.sqlMessage);
                            }
                            else{
                                res.json('Success')
                            }
                        });
                    }
                });
            }
            else{
                res.json('You cannot delete such class in which student(s) are enrolled.')
            }
        }
    });
})

module.exports = router;