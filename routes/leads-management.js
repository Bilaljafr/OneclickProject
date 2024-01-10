const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    MySqlStore = require('express-mysql-session')(session),

    con = require('../database/database'),
    credentials = require('../database/database-credentials'),
    router = express.Router();

router.get('/browse-leads', function (req, res) {
    res.sendFile(path.join(__dirname,'../views/administrator/browseLeads.html'))
})

router.post('/getAggregates', function (req, res) {
    con.query("SELECT * FROM `IncuranceCompany`", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result)
        }
    });
})

router.post('/getLeadsByDate', function (req, res) {
    con.query("SELECT `Leads`.*, CoverageType.CoverageType FROM `Leads` JOIN CoverageType ON InsuranceType = CoverageType.ID WHERE DATE(Dated) >= '" + req.body.dateFrom + "' AND DATE(Dated) <= '" + req.body.dateTill + "'", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result);
        }
    });
})

router.post('/updateCarInsuranceLeadDetails', function (req, res) {
    con.query("UPDATE `Leads` SET `Name`='" + req.body.applicantName + "',`PhoneNumber`='" + req.body.phone + "',`EmailAddress`='" + req.body.emailAddress + "', `Tracker`='" + req.body.tracker + "',`AggregateID`='" + req.body.aggrigateForCarInsurance + "',`LeadStatus`='Responded',`ManageBy`='" + req.session.User.ID + "' WHERE ID = " + req.body.leadIDForCarInsurance, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success');
        }
    });
})

router.post('/updateBikeInsuranceLeadDetails', function (req, res) {
    con.query("UPDATE `Leads` SET `Name`='" + req.body.applicantNameForBikeInsurance + "',`PhoneNumber`='" + req.body.phoneForBikeInsurance + "',`EmailAddress`='" + req.body.emailAddressForBikeInsurance + "', `AggregateID`='" + req.body.aggrigateForBikeInsurance + "',`LeadStatus`='Responded',`ManageBy`='" + req.session.User.ID + "' WHERE ID = " + req.body.leadIDForBikeInsurance, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success');
        }
    });
})

router.post('/getLeadDetails', function (req, res) {
    con.query("SELECT `Leads`.*, CoverageType.CoverageType FROM `Leads` JOIN CoverageType ON InsuranceType = CoverageType.ID WHERE Leads.ID = " + req.body.leadID, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result);
        }
    });
});

router.post('/deleteLead', function (req, res) {
    con.query("DELETE FROM `Leads` WHERE ID = " + req.body.leadID, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success');
        }
    });
});

module.exports = router;