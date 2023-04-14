const common = require('../../../config/common');
var con = require('../../../config/database');

var auth = {

    validateUser: function (request, callback) {

        auth.checkUserEmail(request, function (isExist) {
            if (isExist) {
                callback('0', "reset_keyword_unique_email_message", null);
            } else {
                var otp_code = common.randomeOTPGenerator();
                common.sendEmail(request.email, "email Verification", `<h4>Your OTP is : <h1>${otp_code}</h1></h4>`, function (isSent) {
                    if (isSent) {
                        callback("1", "reset_keyword_otp_send", otp_code)
                    } else {
                        callback("0", "reset_keyword_something_wrong_message", null);
                    }
                })
            }
        })
    },

    signup: function (request, callback) {
        var userDetail = {
            login_type: request.login_type,
            social_id: request.social_id,
            first_name: request.first_name,
            last_name: request.last_name,
            email: request.email,
            mobile_number: request.mobile_number,
            otp: "1234",
            password: request.password,
            lattitude: (request.lattitude == undefined) ? '0.0' : request.lattitude,
            longitude: (request.lattitude == undefined) ? '0.0' : request.lattitude,
            user_profile: (request.user_profile == undefined) ? 'user.jpg' : request.user_profile
        }
        con.query(`INSERT INTO tbl_user SET ?`, [userDetail], function (error, result) {
            if (!error) {
                var id = result.insertId;
                common.checkUpdateToken(id, request, function (token) {
                    if (token) {
                        auth.getUserDetail(id, function (user_data) {
                            user_data[0].token = token;
                            common.sendEmail(request.email, "Welcome to Hotel", `<h4>${request.first_name}You are signup successfully in Hotel</h4>`, function (isSent) {
                                callback('1', 'reset_keyword_add_message', user_data);
                            })
                        })
                    } else {
                        callback("0", 'reset_keyword_something_wrong_message', error);
                    }
                })
            } else {
                console.log(error);
                callback('0', "reset_keyword_something_wrong_message", null);
            }
        })
    },

    loginUser: function (request, callback) {
        auth.checkUserEmail(request, function (isExist) {
            if (isExist) {
                con.query(`SELECT * FROM tbl_user WHERE email = ?`, [request.email], function (error, result) {
                    if (result[0].verification_status == 'verified') {
                        if (!error && result.length > 0) {
                            auth.loginStatusUpdate(result[0].id, function (isUpdate) {
                                if (isUpdate) {
                                    common.sendEmail(request.email, "Login to Hotel", `${result[0].first_name} login successfully`, function (isSent) {
                                        if (isSent) {
                                            var id = result[0].id;
                                            common.checkUpdateToken(id, request, function (token) {
                                                result[0].login_status = "online";
                                                result[0].token = token;
                                                callback("1", "reset_keyword_login_message", result);
                                            });
                                        } else {
                                            console("BBBB", error)
                                            callback("0", "reset_keyword_login_faile_message", null);
                                        }
                                    })
                                } else {
                                    callback("0", "status not update", null)
                                }
                            })
                        } else {
                            console.log("CCCCCC", error)
                            callback("0", "reset_keyword_login_faile_message", null);
                        }
                    } else {
                        callback("0", "reset_keyword_something_wrong_message", null);
                    }
                })
            } else {
                callback("0", "reset_keyword_sigup_first", null)
            }
        })
    },

    checkUserEmail: function (request, callback) {
        con.query(`SELECT * FROM tbl_user WHERE email = ?`, [request.email], function (error, result) {
            if (!error && result.length > 0) {
                callback(true);
            } else {
                callback(false);
            }
        })
    },

    getUserDetail: function (id, callback) {
        con.query(`SELECT * FROM tbl_user WHERE id = ?`, [id], function (error, result) {
            if (!error && result.length > 0) {
                callback(result);
            } else {
                callback(null);
            }
        })
    },

    forgotpassword: function (req, callback) {
        var request = req.body;
        con.query(`SELECT * FROM tbl_user WHERE email = ? AND is_active = 1`, [request.email], function (error, result) {
            if (!error && result.length > 0) {
                require('../../../config/template').forgotPass(result, function (forgottemplate) {
                    common.sendEmail(request.email, "Forgot Password", forgottemplate, function (isSent) {
                        if (isSent) {
                            var onetime = {
                                is_forgot: "1",
                                token_time: new Date()
                            }
                            // console.log(onetime.token_time);
                            con.query(`UPDATE tbl_user SET is_forgot = ?, token_time = ? WHERE id = ? `, [onetime.is_forgot, onetime.token_time, result[0].id], function (error, result) {
                                if (!error) {
                                    callback("1", "reset_keyword_success_message", result);
                                } else {
                                    callback('0', "reset_keyword_something_wrong_message", error)
                                }
                            });
                        } else {
                            // console.log(error);
                            callback('0', "reset_keyword_something_wrong_message", error)
                        }
                    })
                })
            } else {
                console.log(error);
                callback("0", "reset_keyword_something_wrong_message", error)
            }
        })
    },

    resetpassword: function (request, id, callback) {
        // console.log("authmodel",request);
        var onetime = {
            is_forgot: "0"
        }
        con.query(`UPDATE tbl_user SET password = ?, is_forgot = ? WHERE id = ${id} `, [request.resetpass, onetime.is_forgot], function (error, result) {
            if (!error) {
                callback("1", "reset_keyword_success_message", null);
            } else {
                console.log(error);
                callback('0', 'reset_keyword_something_wrong_message', error)
            }
        })
    },

    logoutUser: function (request, callback) {
        var id = request.user_id;
        var upddata = {
            token: "",
            device_token: ""
        }
        con.query(`UPDATE tbl_user_deviceinfo SET ? WHERE user_id = ?`, [upddata, id], function (error, result) {
            if (!error) {
                var loginstatus = {
                    login_status: "offline"
                }
                con.query(`UPDATE tbl_user SET ? WHERE id = ?`, [loginstatus, id], function (error, result) {
                    if (!error) {
                        callback('1', "log out", null);
                    } else {
                        callback("0", "something went wrong", null);
                    }
                })
                // callback("1","logo out",null)
            } else {
                console.log(error)
                callback("0", "log out failed", null)
            }
        })
    },

    loginStatusUpdate: function (id, callback) {
        var loginstatus = {
            login_status: "online"
        }
        con.query(`UPDATE tbl_user SET ? WHERE id = ?`, [loginstatus, id], function (error, result) {
            if (!error) {
                callback(true);
            } else {
                callback(false);
            }
        })
    }
}

module.exports = auth;