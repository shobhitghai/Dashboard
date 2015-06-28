var application_root = __dirname,
    express = require("express"),
    mysql = require("mysql"),
    bodyParser = require("body-parser"),
    dataController = require("../controllers/dataController.js"),
    constants = require("../constants.js"),
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
    var self = this;
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    var router = express.Router();
    app.use('/api', router);
    var apiController = new dataController(router, connection);
    self.startServer();
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