var constants = require('../constants.js');
var queryParamHelper = require('../queryParamHelper.js');

var storeFrontRepository = function(connection, sendResponseCallback, filterParam) {
    this.connection = connection;
    this.filterParam = filterParam;
    this.sendResponseCallback = sendResponseCallback;
    this.dataObj = {
        storeFrontData: {},
        comparisonData: {}
    };
    this.responseObj = {};

}

var repo = storeFrontRepository.prototype;

repo.getData = function() {
    this._getstoreFrontData();
};

repo._getstoreFrontData = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tsds');
    var query = "select count(tv.mac_address) as cnt, avg(tv.dwell_time) as dt, tv.walk_in_flag as walk_in_flag, count(distinct tv.visit_date) as DiffDate from customer_tracker.t_visit tv left join customer_tracker.t_store_details tsds on (tv.store_id=tsds.store_id) left join customer_tracker.t_current_employee_notification tcen on (tv.store_id = tcen.store_id and tv.mac_address = tcen.mac_address) where DATE(first_seen) >= " + this.filterParam.sDate + "  and DATE(first_seen) < DATE_ADD(" + this.filterParam.sDate + " , INTERVAL 7 DAY) and " + queryFilterParam + " group by walk_in_flag ";

    this.connection.query(query, function(err, data) {
        if (err) {
            self.responseObj.isError = true;
            self.sendResponseCallback(self.dataObj);
        } else {
            self.dataObj.storeFrontData = data;
            self._getstoreFrontComparisonData();
        }

    });
}

repo._getstoreFrontComparisonData = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tsds');
    var query = " select count(tv.mac_address) as cnt, avg(tv.dwell_time) as dt, tv.walk_in_flag as walk_in_flag, count(distinct tv.visit_date) as DiffDate from customer_tracker.t_visit tv left join customer_tracker.t_store_details tsds on (tv.store_id=tsds.store_id) left join customer_tracker.t_current_employee_notification tcen on (tv.store_id = tcen.store_id and tv.mac_address = tcen.mac_address) where DATE(first_seen) < " + this.filterParam.sDate + " and DATE(first_seen) >= DATE_SUB(" + this.filterParam.sDate + " , INTERVAL 7 DAY) and " + queryFilterParam + " group by walk_in_flag";
    // console.log(query)
    this.connection.query(query, function(err, data) {
        // console.log(data)
        if (err) {
            self.responseObj.isError = true;
        } else {
            self.dataObj.comparisonData = data;
        }

        self._formatdataObj(self.dataObj);
        self.sendResponseCallback(self.responseObj);

    });
}

repo._formatdataObj = function(dataObj) {
    var avg_1, total_1, avg_2, total_2, sfc, walk_in, dwell_time;
    var responseObj

    if (dataObj.storeFrontData.length && dataObj.comparisonData.length) {
        avg_1 = dataObj.storeFrontData[1].cnt / dataObj.storeFrontData[1].DiffDate;
        total_1 = dataObj.storeFrontData[0].cnt + dataObj.storeFrontData[1].cnt;

        avg_2 = dataObj.comparisonData[1].cnt / dataObj.comparisonData[1].DiffDate;
        total_2 = dataObj.comparisonData[0].cnt + dataObj.comparisonData[1].cnt;

        sfc = (((dataObj.storeFrontData[1].cnt / total_1) - (dataObj.comparisonData[1].cnt / total_2)) / (dataObj.comparisonData[1].cnt / total_2)) * 100;
        walk_in = ((avg_1 - avg_2) / avg_2) * 100;
        dwell_time = ((dataObj.storeFrontData[1].dt - dataObj.comparisonData[1].dt) / dataObj.comparisonData[1].dt) * 100;

        this.responseObj = {
            conversionChange: sfc.toFixed(1),
            walkIn: walk_in.toFixed(1),
            dwellTime: dwell_time.toFixed(1)
        }
    }
}

module.exports = storeFrontRepository;