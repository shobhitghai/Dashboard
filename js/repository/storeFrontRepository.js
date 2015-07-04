var constants = require('../constants.js');

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
    var query = "select count(mac_address) as cnt, avg(dwell_time) as dt, walk_in_flag from customer_tracker.t_visit where DATE(first_seen) >= " + this.filterParam.sDate + " and DATE(first_seen) < DATE_ADD(" + this.filterParam.sDate + " , INTERVAL 7 DAY) group by walk_in_flag"; //and store_selection = x
    // console.log(query)
    this.connection.query(query, function(err, data) {
        // console.log(data)
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
    var query = "select count(mac_address) as cnt, avg(dwell_time) as dt, walk_in_flag from customer_tracker.t_visit where DATE(first_seen) < " + this.filterParam.sDate + " and DATE(first_seen) >= DATE_SUB(" + this.filterParam.sDate + " , INTERVAL 7 DAY) group by walk_in_flag"; //and store_selection = x
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
        avg_1 = dataObj.storeFrontData[1].cnt / 7;
        total_1 = dataObj.storeFrontData[0].cnt + dataObj.storeFrontData[1].cnt;

        avg_2 = dataObj.comparisonData[1].cnt / 7;
        total_2 = dataObj.comparisonData[0].cnt + dataObj.comparisonData[1].cnt;

        sfc = (((dataObj.storeFrontData[1].cnt / total_1) - (dataObj.comparisonData[1].cnt / total_2)) / ((avg_2 * 7) / total_2)) * 100;
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