var mysql = require("mysql");
constants = require('../constants.js');
tileDataRepository = require("../repository/tileDataRepository");
shopperEngagementRepository = require("../repository/shopperEngagementRepository");
campaignImpactRepository = require("../repository/campaignImpactRepository");

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

    /* Get store name - city list for dropdown */

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

    /* Get shopper engagement for current and past month */

    router.get("/getShopperEngagement", function(req, res) {
        self._setResponseHeader(res);

        function sendResponse(response) {
            if (response.isError) {
                self._sendErrorResponse(res);
            } else {
                res.end(JSON.stringify(response));
            }
        }

        var repository = new shopperEngagementRepository(connection, sendResponse, req.query);

        repository.getData();

    });

    /* Get right now section people data */

    router.get("/getRightNowData", function(req, res) {
        self._setResponseHeader(res);
        
        var query = constants.getValue('right_now_people');
        // var query = constants.getValue('campaign_impact_query2');

        connection.query(query, function(err, data) {
            if (err) {
                self._sendErrorResponse(err);
            } else {
                res.end(JSON.stringify(data));
            }
        })

    });

    /* Get campaign impact data */

    router.get("/getCampaignImpact", function(req, res) {
        self._setResponseHeader(res);

        function sendResponse(response) {
            if (response.isError) {
                self._sendErrorResponse(res);
            } else {
                res.end(JSON.stringify(response));
            }
        }

        var repository = new campaignImpactRepository(connection, sendResponse, req.query);

        repository.getData();

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