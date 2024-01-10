const path = require('path');

function checkAccess(parentModuleID, subModuleID, next) {
    return function (req, res, next){
        const userPermissions = req.session.User.access;
        const hasAccess = userPermissions.some(permission => 
            permission.ModuleID === parentModuleID && permission.SubModuleID.includes(subModuleID)
        );
    
        if (hasAccess) {
            next();
        }
        else {
            res.sendFile(path.join(__dirname,'./views/401.html'))
        }
    }
}

module.exports = checkAccess;