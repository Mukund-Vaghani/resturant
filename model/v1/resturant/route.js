var express = require('express');
const { request } = require('http');
var router = express.Router();
var middleware = require('../../../middleware/validation');
var auth = require('./resturant')


router.post('/addresturant', function (req, res) {
    var request = req.body;

    var rules = {
        name: 'required',
        description: 'required',
        address: 'required',
        open_time: 'required',
        close_time: 'required'
    }

    var message = {
        require: 'You forgot the :attr field'
    }

    if (middleware.checkValidationRules(res, request, rules, message)) {
        auth.addresturant(request, function (code, message, data) {
            middleware.send_response(req, res, code, message, data)
        })
    }
})

router.get('/restuarantlisting', function (req, res) {
    var request = req.body;
    auth.restuarantListing(request, function (code, message, data) {
        middleware.send_response(req, res, code, message, data);
    })
});

router.post('/addreting', function (req, res) {
    var request = req.body;

    var rules = {
        resturant_id: 'required',
        user_id: 'required',
        rasturant_rating: 'required'
    }

    var message = {
        require: 'You forgot the :attr field'
    }
    if (middleware.checkValidationRules(res, request, rules, message)) {
        auth.restuarantRating(request, function (code, message, data) {
            middleware.send_response(req, res, code, message, data);
        })
    }
})

module.exports = router;