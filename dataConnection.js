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
        sessionVar = req.session.isLoggedin;

        if (sessionVar) {
            console.log('auth user');
            res.redirect('/app');
        } else {
            //Redirect to login url

            // res.redirect('url provided');
            res.redirect('/app'); //to be removed
        }
    });


    //route where user will land after logging in from the url
    //check with biplav to get the name of the route
    app.get('/auth_token', function(req, res) {
        //secret key from config
        //send post call with secret key to get access_token from http://52.74.64.83/crosslink_auth/oauth/access_token
        //get access token

        var data = querystring.stringify({
            authorization_code: '', //????
            code: 'cuoxPLUrgYPrLCgrg4MwBQfanzPwgQCBnSmtP5hs',
            redirect_uri: 'http://localhost',
            client_secret: constants.getValue('client_secret'),
            client_id: 'abcde'
        });

        var options = {
            host: 'http://52.74.64.83/crosslink_auth/oauth/access_token',
            port: 80,
            path: '/login', //????
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        var req = http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                console.log("body: " + chunk);

                //get user info by passing token
                // ? another post call
                //http://52.74.64.83/crosslink_auth/public/api/user?access_token=PS0WysKrSP0iNNl9nG3gbv4Dv0nxeXcURsTnvkxO

                //update the session.isLoggedin
                sessionVar = true;
                //res.redirect('/app')
            });
        });

        req.write(data);
        req.end();

    });

    app.get('/app', function(req, res) {
        // if (req.session.isLoggedin) {
        res.sendFile(path.join(__dirname + '/views/index.html'));
        // }
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
