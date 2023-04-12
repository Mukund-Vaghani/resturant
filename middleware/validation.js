var Validator = require('Validator');
var con = require('../config/database');

var middleware = {

    checkValidationRules: function (res, request, rules, message) {
        const v = Validator.make(request, rules, message);
        if (v.fails()) {
            const errors = v.getErrors();
            for (var key in errors) {
                var error = errors[key][0];
                console.log(error);
                var response_data = {
                    code: '0',
                    message: error
                }
                res.status(200);
                res.send(response_data);
                return false;
            }
        } else {
            return true;
        }
    },

    send_response: function (req, res, code, message, data) {
            if (data == null) {
                var response_data = {
                    code: code,
                    message: message
                }
                res.status(200);
                res.send(response_data);
            } else {
                console.log(data);
                var response_data = {
                    code: code,
                    message: message,
                    data: data
                }
                res.status(200);
                res.send(response_data);
            }
    },

}

module.exports = middleware;