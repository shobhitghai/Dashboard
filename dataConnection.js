var application_root = __dirname,
    express = require("express"),
    mysql = require("mysql"),
    bodyParser = require("body-parser"),
    dataController = require("./private/controllers/dataController.js"),
    constants = require("./private/constants.js"),
    session = require('express-session'),
    path = require('path'),
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
    var sess;

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
        secret: 'Sess10nSecret',
        name: 'acton_ops',
        resave: true,
        saveUninitialized: true
    }));

    app.get('/', function(req, res, next) {
        if (req.session.isLoggedin) {
            //send to get auth token

            console.log('auth user');
            res.redirect('/auth_token');
        } else {
            //Redirect to login url

            console.log('unauth user')

            //test
            res.redirect('/app');
        }
    });

    app.get('/auth_token', function(req, res) {
        //send call to other url to get auth token details
        //http://52.74.64.83/crosslink_auth/oauth/access_token
        //get access token
        //success callback
        //res.redirect('/app')

    });

    app.get('/app', function(req, res) {
        //get user info by passing token
        //http://52.74.64.83/crosslink_auth/public/api/user?access_token=PS0WysKrSP0iNNl9nG3gbv4Dv0nxeXcURsTnvkxO

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