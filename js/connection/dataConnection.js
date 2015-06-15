var application_root = __dirname,
    express = require("express"),
    mysql = require("mysql"),
    bodyParser = require("body-parser"),
    dataController = require("../controllers/dataController.js");
    port = process.env.PORT || 3000;

var app = express();

function DataConnectionLayer() {
    var self = this;
    self.connectDB();
};

DataConnectionLayer.prototype.connectDB = function() {
    var self = this;
    var pool = mysql.createPool({
        // connectionLimit : 100,
        // host: 'localhost',
        // user: 'root',
        // password: 'shobhit',
        // database: 'world'

        host: 'ec2-52-74-25-254.ap-southeast-1.compute.amazonaws.com',
        user: 'webapp', //modify user name
        password: 'billion123!', //modify pwd
        database: "test" // make sure world table exist on ur db
            // debug    :  false
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
    app.use('/', express.static(application_root + '/views'));
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
