const common = require('../../../config/common');
var con = require('../../../config/database');

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
                        callback('1', 'Resturant add successfull', resturant_data);
                    // })
                })
            } else {
                callback("0", 'something went wrong', error);
            }
        })
    },

    getRestDetail: function(id,callback){
        con.query(`SELECT * FROM tbl_restaurant WHERE id = ?`,[id],function(error,result){
            if(!error && result.length > 0){
                callback(result);
            }else{
                callback(null);
            }
        })
    },

    restuarantListing: function(request,callback){
        con.query(`SELECT r.*,case when (current_time() between r.open_time and r.close_time) then 'open' else 'close'end as status FROM tbl_restaurant r`, function(error,result){
            if(!error){
                callback("1","success",result);
            }else{
                callback("0","failed",null);
            }
        })
    },

    restuarantRating: function(request,callback){

        // var sql = `UPDATE tbl_restaurant r SET r.total_review = (SELECT COUNT(id) FROM tbl_restuarant_rating rr WHERE rr.resturant_id = r.id),(SELECT AVG(rr.rasturant_rating) FROM tbl_restuarant_rating rr WHERE rr.resturant_id = r.id) WHERE id =(SELECT rr.resturant_id FROM tbl_restuarant_rating rr WHERE rr.resturant_id = r.id)`
        
        con.query(sql,)
        // UPDATE tbl_place p SET p.avg_rating = (SELECT AVG(pr.place_rating) FROM tbl_place_rating pr WHERE pr.place_id = p.id) WHERE id = new.place_id
        // UPDATE tbl_place p SET p.rating_count = (SELECT COUNT(id) FROM tbl_place_rating pr WHERE pr.place_id = p.id) WHERE id = new.place_id
    }
}

module.exports = resturant