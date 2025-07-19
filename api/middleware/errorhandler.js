const { constant } = require("../Constant");

const errhandler = ((err, req, res, next) => {
   
    if (err.name === 'MongoServerError' && err.code === 11000) {
        res.status(409).json({
            title: "Duplicate Key Error",
            message: "Email or username already exists",
            stacktrace: err.stack
        });
        return;
    }
    const errorcode = res.statusCode ? res.statusCode : 500;
    switch (errorcode) {
        case constant.VALIDATION_ERR:
            res.json({'title':"Validation error",'message':err.message,"stacktrace":err.stack})
            break;
        case constant.UNAUTHORIZED_ERR:
            res.json({'title':"UNAUTHORIZED",'message':err.message,"stacktrace":err.stack})
            break;
        case constant.FORBIDDEN_ERR:
            res.json({'title':"FORBIDDEN",'message':err.message,"stacktrace":err.stack})
            break;
        case constant.NOTFOUND_ERR:
            res.json({'title':"NOT FOUND",'message':err.message,"stacktrace":err.stack})
            break;
        case constant.SERVER_ERR:
            res.json({'title':"SERVER UNREACHABLE",'message':err.message,"stacktrace":err.stack})
            break;
        default:
            res.status(errorcode).json({
                'title': "Error",
                'message': err.message,
                "stacktrace": err.stack
            });
            break;
    }
});
module.exports = errhandler;