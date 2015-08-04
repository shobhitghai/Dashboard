var constants = require('../constants.js');
var queryParamHelper = require('../queryParamHelper.js');

var campaignImpactRepository = function(connection, sendResponseCallback, filterParam) {
    this.connection = connection;
    this.filterParam = filterParam;
    this.sendResponseCallback = sendResponseCallback;
    this.responseObject = {
        campaignData: {},
        lastMonthData: {}
    };

}

var repo = campaignImpactRepository.prototype;

repo.getData = function() {
    this._getCampaignPeriodData();
};

repo._getCampaignPeriodData = function() {
    var self = this;
    
    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj);
    var query = "select count(mac_address) as cnt, DATEDIFF(" + this.filterParam.sDate + "," + this.filterParam.eDate + ") + 1 AS DiffDate, avg(dwell_time) as dwt from customer_tracker.t_visit where DATE(first_seen) <=" + this.filterParam.eDate + "and DATE(first_seen) >=" + this.filterParam.sDate + " and " + queryFilterParam + " and walk_in_flag = 1";

    this.connection.query(query, function(err, data) {
        if (err) {
            self.responseObject.isError = true;
            self.sendResponseCallback(self.responseObject);
        } else {
            self.responseObject.campaignData = data[0];
            self._getLastMonthData();
        }

    });
}

repo._getLastMonthData = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj);
    var query = "select count(mac_address) as cnt, DATEDIFF(DATE_SUB(" + this.filterParam.sDate + ", INTERVAL 1 DAY)," + this.filterParam.sDate + ") AS DiffDate, avg(dwell_time) as dwt from customer_tracker.t_visit where DATE(first_seen) >= DATE_SUB(" + this.filterParam.sDate + ", INTERVAL 1 DAY) and DATE(first_seen) < " + this.filterParam.sDate + " and " + queryFilterParam + " and walk_in_flag = 1";

    this.connection.query(query, function(err, data) {

        if (err) {
            self.responseObject.isError = true;
        } else {
            self.responseObject.lastMonthData = data[0];
        }

        self.sendResponseCallback(self.responseObject);


    });
}

module.exports = campaignImpactRepository;