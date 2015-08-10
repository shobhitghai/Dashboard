var constants = require('../constants.js');
var queryParamHelper = require('../queryParamHelper.js');

var campaignImpactRepository = function(connection, sendResponseCallback, filterParam) {
    this.connection = connection;
    this.filterParam = filterParam;
    this.sendResponseCallback = sendResponseCallback;
    this.responseObject = {
        campaignData: {},
        lastMonthData: {},
        newWalkinData: {}
    };

}

var repo = campaignImpactRepository.prototype;

repo.getData = function() {
    this._getCampaignPeriodData();
};

repo._getCampaignPeriodData = function() {
    var self = this;
    
    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tsds');
    var query = "select count(tv.mac_address) as cnt, count(distinct tv.visit_date) as DiffDate, avg(tv.dwell_time) as dwt from customer_tracker.t_visit tv left join customer_tracker.t_store_details tsds on (tv.store_id=tsds.store_id) left join customer_tracker.t_current_employee_notification tcen on (tv.store_id = tcen.store_id and tv.mac_address = tcen.mac_address) where visit_date <=" + this.filterParam.eDate + " and visit_date >=" + this.filterParam.sDate + " and " + queryFilterParam + " and (tcen.is_employee !=1 or tcen.is_employee is null) and walk_in_flag = 1";

    this.connection.query(query, function(err, data) {
        if (err) {
            console.log("err from campaignImpactRepository")
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

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tsds');
    var query = "select count(tv.mac_address) as cnt, count(distinct tv.visit_date) as DiffDate, avg(dwell_time) as dwt from customer_tracker.t_visit tv left join customer_tracker.t_store_details tsds on (tv.store_id=tsds.store_id) left join customer_tracker.t_current_employee_notification tcen on (tv.store_id = tcen.store_id and tv.mac_address = tcen.mac_address) where visit_date >= DATE_SUB(" + this.filterParam.sDate + ", INTERVAL 1 WEEK) and visit_date < " + this.filterParam.sDate + " and " + queryFilterParam + " and (tcen.is_employee !=1 or tcen.is_employee is null) and walk_in_flag = 1";

    this.connection.query(query, function(err, data) {

        if (err) {
            self.responseObject.isError = true;
        } else {
            self.responseObject.lastMonthData = data[0];
            self._getNewWalkinDataCurrent();
        }

    });
}

repo._getNewWalkinDataCurrent = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tsds');
    var query = "select count(tsv.mac_address) as cnt, count(distinct tsv.visit_date) as DiffDate from customer_tracker.t_store_visit tsv left join customer_tracker.t_store_details tsds on (tsv.store_id = tsds.store_id) left join customer_tracker.t_current_employee_notification tcen on (tsv.store_id = tcen.store_id and tsv.mac_address = tcen.mac_address) where visit_date <=" + this.filterParam.eDate + " and visit_date >=" + this.filterParam.sDate + " and " + queryFilterParam + " and (tcen.is_employee !=1 or tcen.is_employee is null) and new_customer_flag = 1;"

    this.connection.query(query, function(err, data) {

        if (err) {
            self.responseObject.isError = true;
        } else {
            self.responseObject.newWalkinData.current = data[0];
            self._getNewWalkinDataComparison();
        }

    });
}

repo._getNewWalkinDataComparison = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tsds');
    var query = "select count(tsv.mac_address) as cnt, count(distinct tsv.visit_date) as DiffDate from customer_tracker.t_store_visit tsv left join customer_tracker.t_store_details tsds on (tsv.store_id = tsds.store_id) left join customer_tracker.t_current_employee_notification tcen on (tsv.store_id = tcen.store_id and tsv.mac_address = tcen.mac_address) where visit_date >= DATE_SUB(" + this.filterParam.sDate + ", INTERVAL 1 WEEK) and visit_date < " + this.filterParam.sDate + " and " + queryFilterParam + " and (tcen.is_employee !=1 or tcen.is_employee is null) and new_customer_flag = 1;"

    this.connection.query(query, function(err, data) {

        if (err) {
            self.responseObject.isError = true;
        } else {
            self.responseObject.newWalkinData.comparison = data[0];
        }

        self.sendResponseCallback(self.responseObject);


    });
}

module.exports = campaignImpactRepository;