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

        var query = "select * from customer_tracker.t_section_access where user_id = '" + req.query.id + "'";

        connection.query(query, function(err, data) {

            if (err) {
                console.log(err)
                self._sendErrorResponse(res);
            } else {
                var queryString;
                var itemArr = new Array();

                for (var i = data.length - 1; i >= 0; i--) {
                    queryString = "(";
                    var item = data[i];


                    if (item['city']) {
                        queryString = queryString + " tsd.city = " + "'" + item['city'] + "'";
                        if (item['store_id'] || item['brand_id']) {
                            queryString = queryString + " and ";
                        }
                    }

                    if (item['store_id']) {
                        queryString = queryString + " tsd.store_id = " + item['store_id'];
                        if (item['brand_id']) {
                            queryString = queryString + " and ";
                        }
                    }

                    if (item['brand_id']) {
                        queryString = queryString + " tsd.brand_id = " + item['brand_id'];
                    }

                    queryString = queryString + ")";

                    itemArr.push(queryString)

                };


                var filterString = "";
                for (var i = 0; i < itemArr.length; i++) {
                    if (i != itemArr.length - 1) {
                        filterString = itemArr[i] + " or "
                    } else {
                        filterString = filterString + itemArr[i];
                    }
                };

                if(req.query.filterParamObj){
                    var queryFilterParam = queryParamHelper.getQueryParam(req.query.filterParamObj, 'tsd');
                    var query = "select store_id, tsd.name, tsd.city, tsd.brand_id, tbd.brand_name from t_store_details tsd left join t_brand_details tbd on (tsd.brand_id=tbd.brand_id) where " + queryFilterParam;
                }else{
                    var query = "select store_id, tsd.name, tsd.city, tsd.brand_id, tbd.brand_name from t_store_details tsd left join t_brand_details tbd on (tsd.brand_id=tbd.brand_id) where " + filterString;
                }

                connection.query(query, function(err, data) {
                    if (err) {
                        console.log(err)
                        self._sendErrorResponse(res);
                    } else {
                        res.end(JSON.stringify(data));
                    }
                });
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

        var queryFilterParam = queryParamHelper.getQueryParam(req.query.filterParamObj, 'tsds');
        var query = "select count(tv.mac_address) as cnt, tv.walk_in_flag from customer_tracker.t_visit tv left join customer_tracker.t_store_details tsds on (tv.store_id = tsds.store_id) left join customer_tracker.t_current_employee_notification tcen on (tv.store_id = tcen.store_id AND tv.mac_address = tcen.mac_address) where last_seen >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) and last_seen <= NOW() and DATE(first_seen) = DATE(NOW()) and " + queryFilterParam + " and (tcen.is_employee !=1 or tcen.is_employee is null) group by tv.walk_in_flag";

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
        /* The query has a date >= '2015-08-09' hard coded. It was done because timezone was changed on this date from UCT to IST. Hence the hoursly averages would have skewed if data before this date is taken in average) */
        var queryFilterParam = queryParamHelper.getQueryParam(req.query.filterParamObj, 'tsds');
        var query = "select avg(ty.cnt_mac_address) as avg_walk_by, ty.hour as hour from ( select visit_date, hour(time(first_seen)) as hour1, concat (time_format(time(first_seen), '%l'), '-' , time_format(time(date_add(first_seen, interval 1 hour)), '%l %p')) as hour, count(distinct(mac_address)) as cnt_mac_address from customer_tracker.t_visit tv left join customer_tracker.t_store_details tsds on (tv.store_id = tsds.store_id) where date(first_seen) <= date(now()) and date(first_seen) >=date_sub(date(now()), interval 1 month) AND date(first_seen) >='2015-08-09' AND " + queryFilterParam + " group by visit_date, hour1) as ty where hour1 >= 9 and hour1 <= 22 group by hour1 "
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

        var queryFilterParam = queryParamHelper.getQueryParam(req.query.filterParamObj,'tsds');
        var query = "select ts.s_profile, count(distinct(tv.mac_address)) from customer_tracker.t_visit tv LEFT JOIN customer_tracker.t_store_details tsds on (tsds.store_id = tv.store_id) LEFT JOIN t_current_employee_notification tcen on (tcen.store_id = tv.store_id and tcen.mac_address = tv.mac_address) LEFT JOIN customer_tracker.t_shopper_profile ts ON (tv.mac_address = ts.mac_address) where visit_date >= date(date_sub(NOW(), interval 30 day)) and " + queryFilterParam + "  and walk_in_flag =1 and (tcen.is_employee !=1 or tcen.is_employee is null) group by ts.s_profile order by count(distinct(tv.mac_address)) desc;"

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

        var queryFilterParam = queryParamHelper.getQueryParam(req.query.filterParamObj, 'tsds');
        var query = "SELECT tsfr.category, COUNT(tsfr.mac_address) as 'COUNT(mac_address)' FROM t_store_frequency_rate tsfr left join t_store_details tsds on (tsfr.store_id = tsds.store_id) left join customer_tracker.t_current_employee_notification tcen on (tsfr.store_id = tcen.store_id and tsfr.mac_address = tcen.mac_address) where " + queryFilterParam + " and (tcen.is_employee !=1 or tcen.is_employee is null) GROUP BY category ORDER BY category_order;"

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


    /* Get internal benchmark data */

    /*Walk in*/

    router.get("/getBenchmarkWalkinData", function(req, res) {
        self._setResponseHeader(res);

        function sendResponse(response) {
            if (response.isError) {
                self._sendErrorResponse(res);
            } else {
                res.end(JSON.stringify(response));
            }
        }

        var repository = new internalBenchmarkRepository(connection, sendResponse, req.query);

        repository.getWalkinData();

    });

    /*Store front conversion data*/

    router.get("/getBenchmarkStoreFrontData", function(req, res) {
        self._setResponseHeader(res);

        function sendResponse(response) {
            if (response.isError) {
                self._sendErrorResponse(res);
            } else {
                res.end(JSON.stringify(response));
            }
        }

        var repository = new internalBenchmarkRepository(connection, sendResponse, req.query);

        repository.getStoreFrontData();

    });

    /*Dwell time data*/

    router.get("/getBenchmarkDwellTimeData", function(req, res) {
        self._setResponseHeader(res);

        function sendResponse(response) {
            if (response.isError) {
                self._sendErrorResponse(res);
            } else {
                res.end(JSON.stringify(response));
            }
        }

        var repository = new internalBenchmarkRepository(connection, sendResponse, req.query);

        repository.getDwellTimeData();

    });

    /*Engagement level*/

    router.get("/getBenchmarkEngagementData", function(req, res) {
        self._setResponseHeader(res);

        function sendResponse(response) {
            if (response.isError) {
                self._sendErrorResponse(res);
            } else {
                res.end(JSON.stringify(response));
            }
        }

        var repository = new internalBenchmarkRepository(connection, sendResponse, req.query);

        repository.getEngagementData();

    });

    /*Repeat customer*/

    router.get("/getBenchmarkRepeatCustomerData", function(req, res) {
        self._setResponseHeader(res);

        function sendResponse(response) {
            if (response.isError) {
                self._sendErrorResponse(res);
            } else {
                res.end(JSON.stringify(response));
            }
        }

        var repository = new internalBenchmarkRepository(connection, sendResponse, req.query);

        repository.getRepeatCustomerData();

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
