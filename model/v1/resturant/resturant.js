const common = require('../../../config/common');
var con = require('../../../config/database');
var global = require('../../../config/constant');
var asyncLoop = require('node-async-loop');

var resturant = {

    addresturant: function (request, callback) {
        var resturantDetail = {
            name: request.name,
            image: (request.image == undefined) ? 'resturant.jpg' : request.image,
            description: request.description,
            address: request.address,
            lattitude: (request.lattitude == undefined) ? '0.0' : request.lattitude,
            longitude: (request.lattitude == undefined) ? '0.0' : request.lattitude,
            open_time: request.open_time,
            close_time: request.close_time
        }
        con.query(`INSERT INTO tbl_restaurant SET ?`, [resturantDetail], function (error, result) {
            if (!error) {
                var id = result.insertId;
                resturant.getRestDetail(id, function (resturant_data) {
                    // common.sendEmail(request.email, "Welcome to Hotel", `<h4>${request.first_name}You are signup successfully in Hotel</h4>`, function (isSent) {
                    callback('1', 'reset_keyword_success_message', resturant_data);
                    // })
                })
            } else {
                callback("0", 'reset_keyword_something_wrong_message', error);
            }
        })
    },

    getRestDetail: function (id, callback) {
        con.query(`SELECT r.*,case when (current_time() between r.open_time and r.close_time) then 'open' else 'close'end as status FROM tbl_restaurant r WHERE r.id = ?`, [id], function (error, result) {
            if (!error && result.length > 0) {
                console.log(result);
                callback(result);
            } else {
                callback(null);
            }
        })
    },

    restuarantListing: function (page, limit, callback) {
        con.query(`SELECT r.*,concat('${global.BASE_URL}','${global.REST_URL}',r.image) as image_url,case when (current_time() between r.open_time and r.close_time) then 'open' else 'close'end as status FROM tbl_restaurant r`, function (error, result) {
            if (!error) {
                callback("1", "reset_keyword_success_message", result);
            } else {
                callback("0", "failed", error);
            }
        })
    },

    restuarantRating: function (request, callback) {
        // console.log(request);
        var resturantRating = {
            resturant_id: request.resturant_id,
            user_id: request.user_id,
            rasturant_rating: request.rasturant_rating
        }

        con.query(`INSERT INTO tbl_restuarant_rating SET ?`, [resturantRating], function (error, result) {
            if (!error) {
                con.query(`UPDATE tbl_restaurant SET total_review = (SELECT COUNT(id) FROM tbl_restuarant_rating WHERE resturant_id = tbl_restaurant.id),average_rating = (SELECT AVG(rasturant_rating) FROM tbl_restuarant_rating WHERE resturant_id = tbl_restaurant.id) WHERE id = (SELECT resturant_id FROM tbl_restuarant_rating WHERE resturant_id = tbl_restaurant.id LIMIT 1)`)
                callback("1", "reset_keyword_add_message", result);
            } else {
                console.log(error);
                callback("0", "rating not add, Pls try againe later", null)
            }
        })
    },

    addFood: function (request, callback) {
        var updFood = {
            restaurant_id: request.restaurant_id,
            category_id: request.category_id,
            name: request.name,
            image: request.image,
            description: request.description,
            prize: request.prize,
            quantity: request.quantity
        }

        con.query(`INSERT INTO tbl_food SET ?`, [updFood], function (error, result) {
            if (!error) {
                callback("1", "reset_keyword_add_message", result);
            } else {
                console.log(error);
                callback("0", "food not add, Pls try againe later", null);
            }
        })
    },

    resDetail: function (request, callback) {
        resturant.getRestDetail(request.id, function (result) {
            if (result.length > 0) {

                con.query(`SELECT f.category_id,ft.food_type FROM tbl_food f JOIN tbl_food_type ft ON f.category_id = ft.id WHERE restaurant_id = ? GROUP BY category_id;`,[request.id],function(error,category){

                    if(!error){
                        result[0].category = category
                        asyncLoop(category, function(item,next){

                            con.query(`SELECT * FROM tbl_food as tf WHERE tf.restaurant_id =? AND category_id = ? GROUP BY tf.id`,[request.id,item.category_id], function(error,foodName){

                                if(!error){
                                    item.foodName = foodName;
                                    next();
                                }else{
                                    next()
                                }
                            })
                        },()=>{
                            callback("1","reset_keyword_success_message", result[0]);
                        })
                    }else{
                        callback("0","reset_keyword_data_not_found",null);
                    }
                })
            } else {
                callback("0", "reset_keyword_something_wrong_message", null);
            }
        })
    },

    searchItem: function(request,callback){
        con.query(`SELECT r.name as restaurant_name, f.name as food_name FROM tbl_restaurant r JOIN tbl_food f ON r.id = f.restaurant_id  WHERE r.name LIKE '%${request.name}%' OR f.name LIKE '%${request.name}%'`,function(error,result){
            if(!error){
                callback("1","reset_keyword_success_message",result);
            }else{
                console.log(error);
                callback("0","reset_keyword_data_not_found",null);
            }
        })
    }
}

module.exports = resturant