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
    port = 3000;

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

    app.get('/', function(req, res, next) {

        if (req.session.isLoggedin) {
            console.log('auth user');
            
            res.sendFile(path.join(__dirname + '/views/index.html'));


        } else {
            //Redirect to login url

            res.redirect('http://52.74.64.83/crosslink_auth/oauth/authorize?client_id=abcde&redirect_uri=http://localhost:3000/auth_token&response_type=code')
        }
    });


    //route where user will land after logging in from the url
    app.get('/auth_token', function(req, res, next) {
        //secret key from config
        //send post call with secret key to get access_token from http://52.74.64.83/crosslink_auth/oauth/access_token
        //get access token

        //get req.param.auth_token
        var self = this;
        self.res = res;

        var data = querystring.stringify({
            grant_type: req.query.code,
            code: 'cuoxPLUrgYPrLCgrg4MwBQfanzPwgQCBnSmtP5hs',
            redirect_uri: 'http://localhost:3000/auth_token',
            client_secret: constants.getValue('client_secret'),
            client_id: 'abcde'
        });

        var options = {
            host: '52.74.64.83',
            port: 80,
            path: '/crosslink_auth/oauth/access_token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        var requestCall = http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                console.log("body: " + chunk);

                //get user info by passing token
                // ? another post call
                //http://52.74.64.83/crosslink_auth/public/api/user?access_token=PS0WysKrSP0iNNl9nG3gbv4Dv0nxeXcURsTnvkxO

                //update the session.isLoggedin
                req.session.isLoggedin = true;
                self.res.redirect('/');

                // self.res.redirect('/');
            });
        });


        requestCall.write(data);
        requestCall.end();

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
