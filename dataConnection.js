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
    port = 80;

// port = process.env.PORT || 3000;

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
    var sessionVar;

    app.use(session({
        secret: constants.getValue('client_secret'),
        name: constants.getValue('session_name'),
        resave: true,
        saveUninitialized: true
    }));

    app.get('/', function(req, res){
        res.redirect('/monitoring');
    })

    app.get('/monitoring', function(req, res, next) {
        console.log('root session' + req.session.isLoggedin)
        if (req.session.isLoggedin) {
            res.sendFile(path.join(__dirname + '/views/index.html'));
        } else {
            console.log("redirect called")
            res.redirect(constants.getValue("oauth_url") + "?client_id=" + constants.getValue("client_id") + "&redirect_uri=" + constants.getValue('redirect_uri') + "&response_type=" + constants.getValue('response_type'));
            // res.redirect('http://52.74.64.83/crosslink_auth/oauth/authorize?client_id=abcde&redirect_uri=http://localhost:3000/auth_token&response_type=code')
        }
    });

    app.get('/logout', function(req, res){
        console.log('logout called')
        req.session.isLoggedin = false;
        console.log("logout session " + req.session.isLoggedin)
        res.redirect('/monitoring');
    })


    //route where user will land after logging in from the url
    app.get('/monitoring/auth_token', function(req, res, next) {
        var self = this;
        self.res = res;
        self.auth_token = req.query.code

        var data = querystring.stringify({
            grant_type: self.auth_token,
            code: constants.getValue("auth_token_code"),
            redirect_uri: constants.getValue("redirect_uri"),
            client_secret: constants.getValue('client_secret'),
            client_id: constants.getValue("client_id")
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
            res.on('data', function(chunk) {
                // console.log("body: " + chunk);

                var param = querystring.stringify({
                    access_token: self.auth_token
                });

                var getUserInfoOptions = {
                    host: constants.getValue("token_req_host"),
                    port: 80,
                    path: constants.getValue("user_info_req_path"),
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(param)
                    }
                }

                var infoReq = http.request(getUserInfoOptions, function(res) {
                    res.setEncoding('utf8');
                    res.on('data', function(data) {

                        // console.log("success " + data);

                        req.session.isLoggedin = true;
                        self.res.redirect('/monitoring');
                    });

                })

                infoReq.on('error', function(err) {
                    console.log(" error called ")
                    console.log(err)
                });

                infoReq.write(param);
                infoReq.end();

                //get user info by passing token
                // ? another post call
                //http://52.74.64.83/crosslink_auth/public/api/user?access_token=PS0WysKrSP0iNNl9nG3gbv4Dv0nxeXcURsTnvkxO

                //update the session.isLoggedin
                // req.session.isLoggedin = true;
                // self.res.redirect('/');
            });
        });


        token_req.write(data);
        token_req.end();

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