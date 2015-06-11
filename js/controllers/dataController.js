var mysql   = require("mysql");

function dataController(router,connection) {
    var self = this;
    self.handleRoutes(router,connection);
}

dataController.prototype.handleRoutes = function(router,connection) {
    var self = this;
    router.get("/",function(req,res){
        res.json({"Message" : "Hello World !"});
    });

    router.get("/getData",function(req,res){
        // var query = "select Name, Population from city where CountryCode='IND' LIMIT 10;";
        // var table = ["user_login"];
        // query = mysql.format(query,table);
        console.log(connection);
        var query = "select * from t_visit";
        connection.query(query,function(err,rows){
            res.header('Access-Control-Allow-Origin', 'http://localhost:8082'); //change to other host and port
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE ');
            // res.header('Access-Control-Allow-Headers', 'Content-Type');
            console.log(err);
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                // res.json({"Error" : false, "Message" : "Success", "Users" : rows});
                res.end(JSON.stringify(rows));
            }
        });
    });
}

module.exports = dataController;
