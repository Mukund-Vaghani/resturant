var express = require('express');
const { request } = require('http');
var router = express.Router();
var middleware = require('../../../middleware/validation');
var multer = require('multer');
var path = require('path');
var auth = require('./resturant')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../resturant/public/rest')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({
    storage: storage,
    limits: {
        fileSize: (12 * 1024 * 1024)
    }
}).single('rest_image');


router.post('/uploadrestpicture', function (req, res) {
    upload(req, res, function (error) {
        if (error) {
            console.log(error);
            middleware.send_response(req, res, "0", "fail to upload restaurant image", null);
        } else {
            middleware.send_response(req, res, "1", "upload success", { image: req.file.filename });
        }
    })
})




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
        require: req.language.reset_keyword_required_message
    }

    if (middleware.checkValidationRules(res, request, rules, message)) {
        auth.addresturant(request, function (code, message, data) {
            middleware.send_response(req, res, code, message, data)
        })
    }
})

router.get('/restuarantlisting', function (req, res) {
    var request = req.body;
    var page = req.query.page;
    var limit = req.query.limit;
    auth.restuarantListing(page, limit, function (code, message, data) {
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
        require: req.language.reset_keyword_required_message
    }
    if (middleware.checkValidationRules(res, request, rules, message)) {
        auth.restuarantRating(request, function (code, message, data) {
            middleware.send_response(req, res, code, message, data);
        })
    }
})

router.post('/addfood',function(req,res){
    var request = req.body;

    var rules = {
        restaurant_id:'required',
        category_id:'required',
        name:'required',
        image:'required',
        description:'required',
        prize:'required',
        quantity:'required'
    }

    var message = {
        require: req.language.reset_keyword_required_message
    }

    if(middleware.checkValidationRules(res,request,rules,message)){
        auth.addFood(request,function(code,message,data){
            middleware.send_response(req,res,code,message,data);
        })
    }
})

router.post('/resdetail',function(req,res){
    var request = req.body;

    var rules = {
        id: 'required'
    }

    var message ={
        require:req.language.reset_keyword_required_message
    }

    if(middleware.checkValidationRules(res,request,rules,message)){
        auth.resDetail(request,function(code,message,data){
            middleware.send_response(req,res,code,message,data);
        })
    }

})

router.post('/search', function(req,res){
    var request = req.body
    auth.searchItem(request,function(code,message,data){
        middleware.send_response(req,res,code,message,data);
    })
})



module.exports = router;