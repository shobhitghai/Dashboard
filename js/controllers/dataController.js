var chalk = require('chalk');
constants = require('../constants.js');
queryParamHelper = require('../queryParamHelper.js');
tileDataRepository = require("../repository/tileDataRepository");
shopperEngagementRepository = require("../repository/shopperEngagementRepository");
campaignImpactRepository = require("../repository/campaignImpactRepository");
storeFrontRepository = require("../repository/storeFrontRepository");
crossVisitRepository = require("../repository/crossVisitRepository");
timeTrendRepository = require("../repository/timeTrendRepository");


function dataController(router, connection) {
    var self = this;
    self.handleRoutes(router, connection);
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

        var query = "select store_id, tsd.name, tsd.city, tsd.brand_id, tbd.brand_name from t_store_details tsd left join t_brand_details tbd on (tsd.brand_id=tbd.brand_id);"
        connection.query(query, function(err, data) {

            if (err) {
                console.log(err)
                self._sendErrorResponse(res);
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

        var queryFilterParam = queryParamHelper.getQueryParam(req.query.filterParamObj);
        var query = "select count(mac_address) as cnt, walk_in_flag from customer_tracker.t_visit where last_seen >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) and last_seen <= NOW() and DATE(first_seen) = DATE(NOW()) and " + queryFilterParam + " group by walk_in_flag";

        connection.query(query, function(err, data) {
            if (err) {
                console.log(err)
                self._sendErrorResponse(res);
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

    /* Get store front modification data */

    router.get("/getStoreFrontChange", function(req, res) {
        self._setResponseHeader(res);

        function sendResponse(response) {
            if (response.isError) {
                self._sendErrorResponse(res);
            } else {
                res.end(JSON.stringify(response));
            }
        }

        var repository = new storeFrontRepository(connection, sendResponse, req.query);

        repository.getData();

    });

    /* Get Hour optimization data */

    router.get("/getHourOptimizationData", function(req, res) {
        self._setResponseHeader(res);

        var queryFilterParam = queryParamHelper.getQueryParam(req.query.filterParamObj);
        var query = "select avg(ty.cnt_mac_address) as avg_walk_by, ty.hour as hour from (select visit_date, hour(time(first_seen)) as hour, count(distinct(mac_address)) as cnt_mac_address from customer_tracker.t_visit where date(first_seen) < date(now()) and date(first_seen) >=date_sub(date(now()), interval 1 month) and " + queryFilterParam + " group by visit_date, hour) as ty where hour > 2 and hour < 18 group by hour "

        connection.query(query, function(err, data) {
            if (err) {
                console.log(err)

                self._sendErrorResponse(res);
            } else {
                res.end(JSON.stringify(data));
            }
        })

    });

    /* Get Shopper profile data */

    router.get("/getShopperProfile", function(req, res) {
        self._setResponseHeader(res);

        var queryFilterParam = queryParamHelper.getQueryParam(req.query.filterParamObj);
        var query = "select ts.s_profile, count(distinct(tv.mac_address)) from customer_tracker.t_visit tv JOIN customer_tracker.t_shopper_profile ts ON (tv.mac_address = ts.mac_address) where visit_date >= date(date_sub(NOW(), interval 30 day)) and " + queryFilterParam + " and walk_in_flag =1 and dwell_time < 60*60 and dwell_time > 0 group by ts.s_profile order by count(distinct(tv.mac_address)) desc;"

        connection.query(query, function(err, data) {
            if (err) {
                console.log(err)

                self._sendErrorResponse(res);
            } else {
                res.end(JSON.stringify(data));
            }
        })

    });

    /* Get revisit frequency */

    router.get("/getRevisitFrequency", function(req, res) {
        self._setResponseHeader(res);

        var queryFilterParam = queryParamHelper.getQueryParam(req.query.filterParamObj);
        var query = "SELECT category, COUNT(mac_address) FROM t_store_frequency_rate where " + queryFilterParam + " GROUP BY category, store_id ORDER BY category_order;"

        connection.query(query, function(err, data) {
            if (err) {
                console.log(err)
                
                self._sendErrorResponse(res);
            } else {
                res.end(JSON.stringify(data));
                // console.log(data)
            }
        })

    });

    /* Get store front modification data */

    router.get("/getCrossVisitData", function(req, res) {
        self._setResponseHeader(res);

        function sendResponse(response) {
            if (response.isError) {
                self._sendErrorResponse(res);
            } else {
                res.end(JSON.stringify(response));
            }
        }

        var repository = new crossVisitRepository(connection, sendResponse, req.query);

        repository.getData();

    });


    /* Get monthly time trend data */

    router.get("/getMonthlyTimeTrendData", function(req, res) {
        self._setResponseHeader(res);

        function sendResponse(response) {
            if (response.isError) {
                self._sendErrorResponse(res);
            } else {
                res.end(JSON.stringify(response));
            }
        }

        var repository = new timeTrendRepository(connection, sendResponse, req.query);

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