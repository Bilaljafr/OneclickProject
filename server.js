const express = require('express'),
    path = require('path'),
    http = require('http'),
    cors = require('cors'),

    con = require('./database/database'),
    general = require('./routes/general'),
    dashboard = require('./routes/dashboard'),
    leadsManagement = require('./routes/leads-management'),
    moment = require('moment'),
    // puppeteer = require('puppeteer'),
    nodemailer = require('nodemailer'),
    pdfkit = require('pdfkit'),
    axios = require('axios');
    fs = require('fs'),
    multer = require('multer'),
    smtpTransport = require('nodemailer-smtp-transport'),

    app = express(),
    session = require('express-session'),
    MySqlStore = require('express-mysql-session')(session),
    credentials = require('./database/database-credentials'),
    bodyParser = require('body-parser'),
    server = http.createServer(app)
;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json());
app.use(session({
    secret: 'sdmkjKHS,^*(&$#*( kjsdhd*/4sd',
    resave: false,
    saveUninitialized: true,
    store: new MySqlStore(credentials),
}));

app.use('/assets', express.static(path.join(__dirname, 'assets')))

function loggedIn(req, res, next) {
    if (req.session && req.session.User) {
        next();
    }
    else {
        res.sendFile(path.join(__dirname,'views/website-pages/sign-in.html'))
    }
}

app.use('/dashboard', loggedIn, dashboard)
app.use('/general', loggedIn, general)
app.use('/leads-management', loggedIn, leadsManagement)

app.get('/logout', function (req, res) {
    req.session.destroy();
    if(!req.session){
        res.redirect('/sign-in')
    }
    else{
        res.redirect('/logout')
    }
})

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname,'views/website-pages/index-1.html'))
})

app.get('/car-insurance', function (req, res) {
    res.sendFile(path.join(__dirname,'views/website-pages/car-insurance.html'))
})

app.get('/bike-insurance', function (req, res) {
    res.sendFile(path.join(__dirname,'views/website-pages/bike-insurance.html'))
})

app.get('/health-insurance', function (req, res) {
    res.sendFile(path.join(__dirname,'views/website-pages/health-insurance.html'))
    // res.sendFile(path.join(__dirname,'views/website-pages/coming-soon.html'))
})

app.get('/travel-insurance', function (req, res) {
    res.sendFile(path.join(__dirname,'views/website-pages/coming-soon.html'))
})

app.get('/life-insurance', function (req, res) {
    res.sendFile(path.join(__dirname,'views/website-pages/life-insurance.html'))
})

app.get('/contact-us', function (req, res) {
    res.sendFile(path.join(__dirname,'views/website-pages/contact.html'))
})

app.get('/about-us', function (req, res) {
    res.sendFile(path.join(__dirname,'views/website-pages/about.html'))
})

app.get('/faq', function (req, res) {
    res.sendFile(path.join(__dirname,'views/website-pages/faq.html'))
})

app.get('/thank-you', function (req, res) {
    res.sendFile(path.join(__dirname,'views/website-pages/thank-you.html'))
})

app.get('/show-certificate-of-registrar-of-company', function (req, res) {
    // Read the image file
    const imagePath = 'assets/website-assets/img/certificate-of-registrar-of-company.jpeg';
    fs.readFile(imagePath, (err, data) => {
        if (err) {
            res.status(404).send('Image not found');
        }
        else {
            // Set appropriate headers for the image response
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Content-Disposition', 'inline; filename="image.jpg"');

            // Send the image data in the response
            res.send(data);
        }
    });
})

app.get('/sign-in', function (req, res) {
    if(req.session.User){
        res.redirect('/dashboard')
    }
    else{
        res.sendFile(path.join(__dirname,'views/website-pages/sign-in.html'))
    }
})

app.get('/sign-up', function (req, res) {
    res.sendFile(path.join(__dirname,'views/website-pages/sign-up.html'))
})

app.get('/car-insurance-offers', function (req, res) {
    res.sendFile(path.join(__dirname,'views/website-pages/car-insurance-offers.html'))
})

app.get('/bike-insurance-offers', function (req, res) {
    res.sendFile(path.join(__dirname,'views/website-pages/bike-insurance-offers.html'))
})

app.post('/sign-up', function (req, res) {
    con.query("INSERT INTO `UserData` (`FirstName`, `LastName`, `EmailAddress`, `PhoneNumber`, `Password`) VALUES ('" + req.body.firstName + "', '" + req.body.lastName + "', '" + req.body.emailAddress + "', '" + req.body.phoneNumber + "', '" + req.body.password + "')", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success')
        }
    });
})

app.post('/sign-in', (req, res) => {
    con.query("SELECT * FROM `UserData` WHERE EmailAddress = '" + req.body.emailAddress + "' AND Password = '" + req.body.password + "' AND `AccountStatus` = 'Active'", function(err, result){
        if (err) {
            res.json({ 'Error': err.sqlMessage });
        }
        else {
            if (result.length > 0) {
                con.query("SELECT * FROM Modules WHERE FIND_IN_SET(ModuleID, (SELECT ModuleAccess FROM UserData WHERE EmailAddress = '" + req.body.emailAddress + "' AND Password = '" + req.body.password + "'))", function (err, result1) {
                    if (!err){
                        req.session.User = Object.assign({}, result[0], {'Access': result1});
                        res.json('Success')
                    }
                });
            }
            else {
                res.json('Username or password is incorrect or your account is inactive.');
            }
        }
    });
});

app.post('/getManufacturer', function (req, res) {
    con.query("SELECT ID, Brand, Engine, Year FROM BikesDetails", function (err, result) {
        if (err){
            res.json({'Error': err.sqlMessage});
        }
        else{
            res.json(result)
        }
    });
})

app.post('/getCarDetails', function (req, res) {
    con.query("SELECT ID, Brand, Model, ManufacturingYear FROM CarsDetails", function (err, result) {
        if (err){
            res.json({'Error': err.sqlMessage});
        }
        else{
            res.json(result)
        }
    });
})

app.post('/getBikeDetails', function (req, res) {
    con.query("SELECT ID, Brand, Engine, ManufacturingYear FROM BikesDetails", function (err, result) {
        if (err){
            res.json({'Error': err.sqlMessage});
        }
        else{
            res.json(result)
        }
    });
})

app.post('/getCarInsuranceOffers', (req, res) => {
    con.query("SELECT * FROM `InsuranceRates` JOIN `IncuranceCompany` ON `InsuranceRates`.`InsuranceCompanyID` = `IncuranceCompany`.ID WHERE InsuranceRates.InsuranceID = " + req.body.insuranceID + ' ORDER BY `IncuranceCompany`.Priority ASC', function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result)
        }
    });
});

app.post('/getBikeInsuranceOffers', (req, res) => {
    con.query("SELECT * FROM `InsuranceRates` JOIN `IncuranceCompany` ON `InsuranceRates`.`InsuranceCompanyID` = `IncuranceCompany`.ID WHERE InsuranceRates.InsuranceID = " + req.body.insuranceID + ' ORDER BY `IncuranceCompany`.Priority ASC', function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json(result)
        }
    });
});

app.post('/uploadCarInsuranceLead', (req, res) => {
    con.query("INSERT INTO `Leads` (`InsuranceType`, `Name`, `PhoneNumber`, `EmailAddress`, `ManufacturerID`, `CarModel`, `ManufacturingYear`, `CarPrice`) VALUES ('" + req.body.insuranceType + "', '" + req.body.userName + "', '" + req.body.phoneNumber + "', '" + req.body.emailAddress + "', '" + req.body.manufacturer + "', '" + req.body.model + "', '" + req.body.year + "', '" + req.body.price.replace(/[^\d]/g, '') + "')", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            sendEmail(req.body.emailAddress, req.body.userName)
            res.json({ message: 'Success', leadID: result.insertId });
        }
    });
});

app.post('/uploadBikeInsuranceLead', (req, res) => {
    con.query("INSERT INTO `Leads` (`InsuranceType`, `Name`, `PhoneNumber`, `EmailAddress`, `ManufacturerID`, `CarModel`, `ManufacturingYear`, `CarPrice`) VALUES ('" + req.body.insuranceType + "', '" + req.body.userName + "', '" + req.body.phoneNumber + "', '" + req.body.emailAddress + "', '" + req.body.manufacturer + "', '" + req.body.engine + "', '" + req.body.year + "', '" + req.body.price.replace(/[^\d]/g, '') + "')", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            sendEmail(req.body.emailAddress, req.body.userName)
            res.json({ message: 'Success', leadID: result.insertId });
        }
    });
});

app.post('/updateCarInsuranceLead', (req, res) => {
    con.query("UPDATE `Leads` SET `Tracker` = '" + req.body.addTracker + "', `AggregateID` = '" + req.body.aggregateID + "' WHERE `ID` = " + req.body.leadID, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success');
        }
    });
});

app.post('/initiate-payment', async (req, res) => {
    var mapString = '', hashName = 'RequestHash';

    // Retrieve payment details from the request
    const cardNumber = req.body.card_number;
    const expirationDate = req.body.expiration_date;
    const cvv = req.body.cvv;

    // Create a payload with the payment details
    const paymentDetails = {
        "HS_ChannelId":"1002"
        ,"HS_MerchantId":"23550"
        ,"HS_StoreId":"031817"
        ,"HS_ReturnURL":"https://theoneclickdigital.com/thank-you"
        ,"HS_MerchantHash":"OUU362MB1uoEG9E7Ns1DrpxnRQdh+UIyEnOKpiOINpEeypXOuhqdnhvyEufqYsFu"      
        ,"HS_MerchantUsername":"esazyd"
        ,"HS_MerchantPassword":"QaKylUuBlWBvFzk4yqF7CA=="
        ,"HS_TransactionReferenceNumber":""
        ,"HS_RequestHash":"c2aKETqeaz9tHgXteGRqrXKAk73uHc9chE3HlFPwlE9C/ck1vuA7kOQ8xKBJi6EI/vsBnbq91kM8B5/CCE2yWKo4KBAy1B3/+3IzQVodr8w2rdeKl/xjxin0YCuWv7Nb7IIBMdogaqrbnpIVD8v6EAQJ8sSnq9at7XEtPoEEyTzyDOD9F6zUXoxbrXwV4+BlS+WiQAaBEt7mYW8wgEMo/g3rm3pm8etJm8xarbfZBraIZdNkTAbM1hMgVbDibCAnyLsf4+ymMnqWne8i/1HglZD0xaK/scg0oR5fcr1qD5rlNEgAVkKXHHocY3ii3E088V7AU+ajbI8PJAO80MPQ4HvKMpxwAvTvz8Apjr2ZoOS510ujdIqSeAm6IKA6oNKF/p71vV4X69BzgaW8BkqB8PNMrDmbgvj8IDphP7gSaYiVixDJ/f1rFqHXz+cJ/1AdAQAeWY9m2CmM6lmrzxSSYXbjPWy1GB4l7a2VEJ844Z337cY9rWi4rkI7MWX9O6H54ySKBf4fafw3JRSBRA/yLXlg/tQ8TeLKdK0loSVu+nMfDwyde5MFX42Ki30CzS+q3oVp/4cExTP8vmxhSGk0K0CpL+T+LnoKdLWKx0sGs8JJjBcZXjZRCE3PRJuoG79RFgctpbLb9xnS82KMybJOVQ==",

        // card_number: cardNumber,
        // expiration_date: expirationDate,
        // cvv: cvv,
        // amount: 800,
    };

    // URL to Bank Alfalah's payment gateway endpoint
    const apiUrl = 'https://sandbox.bankalfalah.com/HS/api/HSAPI/HSAPI'; // Staging Environment

    try {
        // Make a POST request to the payment gateway using axios
        const response = await axios.post(apiUrl, paymentDetails);

        // Handle the response from the payment gateway
        console.log('Payment Response:', response.data);
        // Process the response as needed
        res.send('Payment Complete');
    } catch (error) {
        // Handle error
        console.error('Error initiating payment:', error);
        res.status(500).send('Payment Error');
    }
});

app.get('/get-authentication-token', (req, res) => {
    res.json(req.query)
});

app.post('/get-authentication-token', (req, res) => {
    res.json(req.body)
});

app.post('/uploadLifeInsuranceLead', (req, res) => {
    con.query("INSERT INTO `Leads`(`InsuranceType`, `Name`, `PhoneNumber`, `EmailAddress`, `DateOfBirth`, `MaritalStatus`, `AgesOfChild`, `IncomeSource`) VALUES (3, '" + req.body.name + "', '" + req.body.phone + "', '" + req.body.email + "', '" + moment(req.body.dateOfBirth, 'DDDD, MMM DD, YYYY').format('YYYY-MM-DD') + "', '" + req.body.maritalStatus + "', '" + req.body.childAges + "', '" + req.body.incomeSource + "')", function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            sendEmail(req.body.emailAddress, req.body.name)
            res.json('Success');
        }
    });
});

app.post('/updateBikeInsuranceLead', (req, res) => {
    con.query("UPDATE `Leads` SET `Tracker` = '" + req.body.addTracker + "', `AggregateID` = '" + req.body.aggregateID + "' WHERE `ID` = " + req.body.leadID, function (err, result) {
        if (err){
            res.json(err.sqlMessage);
        }
        else{
            res.json('Success');
        }
    });
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'assets/created-quotations/');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

// Route to handle PDF uploads
app.post('/sendQuotation', upload.single('pdfFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No PDF file uploaded.');
    }
    const userEmail = req.body.email;
    console.log('File uploaded:', req.file);
    console.log('User email:', userEmail);
    res.send('PDF file uploaded successfully.');
});

// app.post('/generatePDF', async (req, res) => {
//     const htmlContent = req.body.htmlContent;
//     const cssContent = req.body.cssContent;
//     const pdfName = 'quote_' + Date.now() + '.pdf';
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     const combinedContent = `<style>${cssContent}</style>${htmlContent}`;
//     await page.setContent(combinedContent, { waitUntil: 'domcontentloaded' });
//     await page.pdf({ path: pdfName, format: 'A4' });
//     await browser.close();
//     res.send({ pdfName });
// });

function sendEmail(sendTo, name){
    const emailTemplatePath = path.join(__dirname, '/views/email-template/welcome-email.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8').replace('{{customerName}}', name);

    // (async () => {
    //     const browser = await puppeteer.launch();
    //     const page = await browser.newPage();
    //     const html = `<table>...</table>`; // Replace with your HTML table content
    //     await page.setContent(html, { waitUntil: 'domcontentloaded' });
    //     await page.pdf({ path: 'quotation.pdf', format: 'A4' });
    //     await browser.close();
    // })();
   
    (async () => {
        const transporter = nodemailer.createTransport(smtpTransport({
            host:'mail.theoneclickdigital.com',
            secureConnection: false,
            tls: {
                rejectUnauthorized: false
            },
            port: 587,
            auth: {
                user: 'info@theoneclickdigital.com',
                pass: 'nT{XA3,XyqH}4',
            }
        }));
        
        const mailOptions = {
            from: 'The OnceClick Digital <info@theoneclickdigital.com>',
            to: sendTo,
            subject: 'Welcome to Oneclick Digital',
            html: emailTemplate,
            attachments: [
                // {
                //     filename: 'quotation.pdf', // Replace with the PDF filename generated in step 3
                //     path: './quotation.pdf', // Replace with the path to the generated PDF file
                // },
                {
                    filename: 'image-1.png',
                    path: './views/email-template/images/email-logo.png',
                    cid: 'logo'
                },
                {
                    filename: 'image-1.png',
                    path: './views/email-template/images/image-1.png',
                    cid: 'image-1'
                },
                {
                    filename: 'image-2.png',
                    path: './views/email-template/images/image-2.png',
                    cid: 'image-2'
                },
                {
                    filename: 'free-icon.png',
                    path: './views/email-template/images/free-icon.png',
                    cid: 'free-icon'
                },
                {
                    filename: 'currency-icon.png',
                    path: './views/email-template/images/currency-icon.png',
                    cid: 'currency-icon'
                },
                {
                    filename: 'claim-icon.png',
                    path: './views/email-template/images/claim-icon.png',
                    cid: 'claim-icon'
                },
                {
                    filename: 'linkedin-icon.png',
                    path: './views/email-template/images/linkedin-icon.png',
                    cid: 'linkedin-icon'
                },
                {
                    filename: 'facebook-icon.png',
                    path: './views/email-template/images/facebook-icon.png',
                    cid: 'facebook-icon'
                }
            ],
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email. ', error);
            }
            else {
                console.log('Email sent successfully. ', info.response);
            }
        });
    })();
}

app.post('/getProfileDetails', function (req, res) {
    res.json(req.session.User)
})

app.get('*', function(req, res){
    // console.log('This is requested URL: ' + req.url)
    res.sendFile(path.join(__dirname,'views/website-pages/404.html'))
});

process.env.TZ = 'Asia/Karachi';
//process.env.NODE_ENV = 'development';
server.listen(300 || process.env.PORT, () => {})