var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
// var md5 = require('MD5');
var dataController = require("./controllers/dataController.js");
var app = express();

function DataConnectionLayer() {
    var self = this;
    self.connectDB();
};

DataConnectionLayer.prototype.connectDB = function() {
    var self = this;
    var pool = mysql.createPool({
        // connectionLimit : 100,
        host: 'ec2-52-74-25-254.ap-southeast-1.compute.amazonaws.com',
        user: 'root',
        password: 'billion123!',
        database: "test"
        // debug    :  false
    });
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log('error');
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
    var dataController = new dataController(router, connection);
    self.startServer();
}

DataConnectionLayer.prototype.startServer = function() {
    app.listen(3000, function() {
        console.log("All right ! I am alive at Port 3000.");
    });
}

DataConnectionLayer.prototype.stop = function(err) {
    console.log("ISSUE WITH MYSQL \n" + err);
    process.exit(1);
}

new DataConnectionLayer();
