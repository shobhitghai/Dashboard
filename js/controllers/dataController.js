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

    /* Get Outside Opportunity Data */

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

    /* Get Storefront conversion Data */

    // router.get("/getStorefrontData", function(req, res) {
    //     self._setResponseHeader(res);

    //     var repository = new tileDataRepository(connection, req.query);

    //     function sendResponse(response) {
    //         if (response.isError) {
    //             self._sendErrorResponse(res);
    //         } else {
    //             res.end(JSON.stringify(response));
    //         }
    //     }

    //     repository.getOpportunityData(sendResponse, isStoreFront);

    // });
}

dataController.prototype._setResponseHeader = function(res) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8082');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE ');
}

dataController.prototype._sendErrorResponse = function(res) {
    res.json({
        "Error": true,
        "Message": "Error executing MySQL query"
    });
}

module.exports = dataController;