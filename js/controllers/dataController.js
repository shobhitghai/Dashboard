var mysql = require("mysql");
tileDataRepository = require("../repository/tileDataRepository");

function dataController(router, connection) {
    var self = this;
    self.handleRoutes(router, connection);
    var tileDataRepository
}

dataController.prototype.handleRoutes = function(router, connection) {
    var self = this;
    router.get("/", function(req, res) {
        res.json({
            "Message": "Hello World !"
        });
    });


    router.get("/getStoreDetails", function(req, res) {
        self._setResponseHeader(res);
        var query = "select name, city from customer_tracker.t_store_details;"
        connection.query(query, function(err, data) {

            if (err) {
                self._sendErrorResponse(err);
            } else {
                res.end(JSON.stringify(data));
            }
        })

    });

    /* Get Tile data for Opportunity, Storefront, Dwell time */

    router.get("/getTilesData", function(req, res) {
        self._setResponseHeader(res);

        function sendResponse(response) {
            if (response.isError) {
                self._sendErrorResponse(res);
            } else {
                res.end(JSON.stringify(response));
            }
        }

        var repository = new tileDataRepository(connection, sendResponse, req.query);

        repository.getTilesData();

    });

}

dataController.prototype._setResponseHeader = function(res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE ');
}

dataController.prototype._sendErrorResponse = function(res) {
    res.json({
        "Error": true,
        "Message": "Error executing MySQL query"
    });
}

module.exports = dataController;