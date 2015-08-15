var application_root = __dirname,
    express = require("express"),
    mysql = require("mysql"),
    bodyParser = require("body-parser"),
    dataController = require("./private/controllers/dataController.js"),
    constants = require("./private/constants.js"),
    session = require('express-session'),
    path = require('path'),
    querystring = require('querystring'),
    http = require('http'),
    port = constants.getValue('port');

var app = express();

function DataConnectionLayer() {
    var self = this;
    self.connectDB();
};

DataConnectionLayer.prototype.connectDB = function() {
    var self = this
    var pool = mysql.createPool({
        host: constants.getValue('db_host'),
        user: constants.getValue('db_user'),
        password: constants.getValue('db_password'),
        database: constants.getValue('db_database')
    });

    pool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            self.stop(err);
        } else {
            self.configureExpress(connection);
        }
    });
}

DataConnectionLayer.prototype.configureExpress = function(connection) {
    var router = express.Router();

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(express.static('public'));
    app.use('/api', router);

    this._authModule();

    var apiController = new dataController(router, connection);

    this.startServer();
}

DataConnectionLayer.prototype._authModule = function() {

    app.use(session({
        secret: constants.getValue('client_secret'),
        name: constants.getValue('session_name'),
        resave: true,
        saveUninitialized: true
    }));

    app.get('/', function(req, res) {
        res.redirect('/monitoring');
    })

    app.get('/monitoring', function(req, res, next) {
        if (req.session.isLoggedin) {
            res.sendFile(path.join(__dirname + '/views/index.html'));
        } else {
            console.log("redirect called")
            res.redirect(constants.getValue("oauth_url") + "?client_id=" + constants.getValue("client_id") + "&redirect_uri=" + constants.getValue('redirect_uri') + "&response_type=" + constants.getValue('response_type'));
        }
    });

    app.get('/logout', function(req, res) {
        req.session.isLoggedin = false;
        res.redirect('http://accounts.crosslink.co.in/crosslink_auth/public/api/logout?redirect_uri=' + constants.getValue("oauth_url") + "?client_id=" + constants.getValue("client_id") + "&redirect_uri=" + constants.getValue('redirect_uri') + "&response_type=" + constants.getValue('response_type'));
    })


    //route where user will land after logging in from the url
    app.get('/monitoring/auth_token', function(req, res, next) {
        var self = this;
        self.res = res;
        self.auth_token = req.query.code

        var data = querystring.stringify({
            grant_type: 'authorization_code',
            code: self.auth_token,
            redirect_uri: constants.getValue("redirect_uri"),
            client_id: constants.getValue("client_id"),
            client_secret: constants.getValue('client_secret')
        });

        var options = {
            host: constants.getValue("token_req_host"),
            port: 80,
            path: constants.getValue("token_req_path"),
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        var token_req = http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(tokenObj) {
                var tokenObj = JSON.parse(tokenObj);

                if (tokenObj["access_token"]) {

                    var getUserInfoOptions = {
                        host: constants.getValue("token_req_host"),
                        port: 80,
                        path: constants.getValue("user_info_req_path") + "?access_token=" + tokenObj["access_token"],
                        method: 'GET'
                    }

                    var infoReq = http.request(getUserInfoOptions, function(res) {
                        res.setEncoding('utf8');
                        res.on('data', function(userInfo) {

                            if (userInfo.hasOwnProperty("error")) {
                                console.log("error fetching user info");
                                // console.log(userInfo);
                                self.res.redirect('/monitoring');
                            } else {
                                req.session.isLoggedin = true;
                                req.session.userInfo = userInfo;
                                // console.log(userInfo);
                                self.res.redirect('/monitoring');
                            }

                        });

                    })

                    infoReq.on('error', function(err) {
                        console.log("userinfo error " + err)
                    });

                    infoReq.end();
                } else {
                    self.res.redirect('/monitoring');
                }

            });
        });


        token_req.write(data);
        token_req.end();

    });

    app.get('/api/getUserInfo', function(req, res){
        res.end(req.session.userInfo);
    });

}

DataConnectionLayer.prototype.startServer = function() {
    app.listen(port, function() {
        console.log("All right ! I am alive at Port." + port);
    });
}

DataConnectionLayer.prototype.stop = function(err) {
    console.log("ISSUE WITH MYSQL \n" + err);
    process.exit(1);
}

new DataConnectionLayer();