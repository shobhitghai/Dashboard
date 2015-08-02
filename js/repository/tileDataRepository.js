var constants = require('../constants.js');
var queryParamHelper = require('../queryParamHelper.js');

var tileDataRepository = function(connection, sendResponseCallback, filterParam) {
    this.connection = connection;
    this.filterParam = filterParam;
    this.sendResponseCallback = sendResponseCallback;
    this.responseObject = {};
    this.localObject = {};
}

var repo = tileDataRepository.prototype;

repo.getTilesData = function() {
    this._getCurrentOpportunityCount();
};

repo._getCurrentOpportunityCount = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tv');
    var query = "select sum(oop.cnt_mac_address) as 'count(mac_address)' from(select tv.visit_date, tv.store_id, count(distinct tv.mac_address) as cnt_mac_address from customer_tracker.t_visit tv where " + constants.getValue("fs_current_" + this.filterParam.comparison + "_" + this.filterParam.period) + " and " + queryFilterParam + " group by visit_date, store_id) as oop";

    this.connection.query(query, function(err, data) {

        if (err) {
            console.log(query)
            console.log('tile ' + err);
            self.responseObject.isError = true;
            self.sendResponseCallback(self.responseObject);
        } else {
            self.responseObject.opportunityData = {};
            self.responseObject.opportunityData.current = data[0]['count(mac_address)'];

            self._getOpportunityComparison();
        }

    });
}

repo._getOpportunityComparison = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tv');
    var query = "select sum(oop.cnt_mac_address) as 'count(mac_address)' from( select tv.visit_date, tv.store_id, count(distinct tv.mac_address) as cnt_mac_address from customer_tracker.t_visit tv where " + constants.getValue("fs_compare_" + this.filterParam.comparison + "_" + this.filterParam.period) + " and " + queryFilterParam + " group by visit_date, store_id) as oop ;"

    // console.log(query);
    this.connection.query(query, function(err, data) {

        if (err) {
            console.log(err);

            self.responseObject.isError = true;
            self.sendResponseCallback(self.responseObject);
        } else {
            var percent = ((self.responseObject.opportunityData.current - data[0]['count(mac_address)']) / data[0]['count(mac_address)']) * 100;
            self.responseObject.opportunityData.comparison = percent;
            self.responseObject.opportunityData.comparisonNumber = data[0]['count(mac_address)'];

            self._getCurrentStoreFrontCount();
        }

    });
}

repo._getCurrentStoreFrontCount = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tv');
    var query = "select count(tv.mac_address) as 'count(mac_address)' from customer_tracker.t_visit tv left join customer_tracker.t_current_employee_notification tcen on (tv.store_id = tcen.store_id and tv.mac_address = tcen.mac_address) where  " + constants.getValue("es_current_" + this.filterParam.comparison + "_" + this.filterParam.period) + " and " + queryFilterParam + " and walk_in_flag =1 and (tcen.is_employee !=1 or tcen.is_employee is null); ";


    this.connection.query(query, function(err, data) {

        if (err) {
            self.responseObject.isError = true;
            self.sendResponseCallback(self.responseObject);
        } else {
            self.responseObject.storefrontData = {};
            self.localObject.storefrontData = {};
            self.localObject.storefrontData.currentVal = data[0]['count(mac_address)'];
            self.responseObject.storefrontData.current = (data[0]['count(mac_address)'] / self.responseObject.opportunityData.current) * 100;

            self._getStoreFrontComparison();
        }

    });
}

repo._getStoreFrontComparison = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tv');
    var query = "select count(tv.mac_address) as 'count(mac_address)' from customer_tracker.t_visit tv left join customer_tracker.t_current_employee_notification tcen on (tv.store_id = tcen.store_id and tv.mac_address = tcen.mac_address) where  " + constants.getValue("es_compare_" + this.filterParam.comparison + "_" + this.filterParam.period) + " and " + queryFilterParam + " and walk_in_flag =1 and (tcen.is_employee !=1 or tcen.is_employee is null); ";

    this.connection.query(query, function(err, data) {

        if (err) {
            self.responseObject.isError = true;
            self.sendResponseCallback(self.responseObject);

        } else {
            self.localObject.storefrontData.comparisonVal = data[0]['count(mac_address)'];
            var percent = ((self.responseObject.storefrontData.current - (data[0]['count(mac_address)'] * 100 / self.responseObject.opportunityData.comparisonNumber)) / (data[0]['count(mac_address)'] * 100 / self.responseObject.opportunityData.comparisonNumber)) * 100;
            self.responseObject.storefrontData.comparison = percent;
            self._getDwellTimeCount();
        }


    });
}

repo._getDwellTimeCount = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tv');
    var query = "select avg(dwell_time) from customer_tracker.t_visit tv left join customer_tracker.t_current_employee_notification tcen on (tv.store_id = tcen.store_id AND tv.mac_address = tcen.mac_address) where " + constants.getValue("es_current_" + this.filterParam.comparison + "_" + this.filterParam.period) + " and " + queryFilterParam + " and walk_in_flag = 1 and (tcen.is_employee !=1 or tcen.is_employee is null); ";


    this.connection.query(query, function(err, data) {

        if (err) {
            console.log('_getDwellTimeCount ' + err)
            self.responseObject.isError = true;
            self.sendResponseCallback(self.responseObject);
        } else {
            // console.log(data[0]['avg(dwell_time)'])
            self.responseObject.dwellTimeData = {};
            self.responseObject.dwellTimeData.current = data[0]['avg(dwell_time)'];

            self._getDwellTimeComparison();
        }

    });
}

repo._getDwellTimeComparison = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tv');
    var query = "select avg(dwell_time) from customer_tracker.t_visit tv left join customer_tracker.t_current_employee_notification tcen on (tv.store_id = tcen.store_id AND tv.mac_address = tcen.mac_address) where " + constants.getValue("es_compare_" + this.filterParam.comparison + "_" + this.filterParam.period) + " and " + queryFilterParam + " and walk_in_flag = 1 and (tcen.is_employee !=1 or tcen.is_employee is null); ";


    this.connection.query(query, function(err, data) {

        if (err) {
            self.responseObject.isError = true;
            self.sendResponseCallback(self.responseObject);
        } else {
            var percent = ((self.responseObject.dwellTimeData.current - data[0]['avg(dwell_time)']) / data[0]['avg(dwell_time)']) * 100;
            self.responseObject.dwellTimeData.comparison = percent;

            self._getRepeatCustomerCount();
        }

    });
}

repo._getRepeatCustomerCount = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tsv');
    var query = "select count(tsv.mac_address) as 'sum(rc.cnt_mac_address)' from customer_tracker.t_store_visit tsv left join customer_tracker.t_current_employee_notification tcen on (tsv.store_id = tcen.store_id AND tsv.mac_address = tcen.mac_address) where " + constants.getValue("es_current_" + this.filterParam.comparison + "_" + this.filterParam.period) + " and " + queryFilterParam + " and new_customer_flag = 0 and (tcen.is_employee !=1 or tcen.is_employee is null);";

    // console.log(query); 
    this.connection.query(query, function(err, data) {

        if (err) {
            console.log(err);
            self.responseObject.isError = true;
            self.sendResponseCallback(self.responseObject);
        } else {
            // console.log(data);
            // console.log(data[0]['rc']);
            self.localObject.repeatCustomer = {};
            self.responseObject.repeatCustomer = {};
            self.localObject.repeatCustomer.currentVal = data[0]['sum(rc.cnt_mac_address)'];
            self.responseObject.repeatCustomer.current = data[0]['sum(rc.cnt_mac_address)'] / self.localObject.storefrontData.currentVal * 100;

            self._getRepeatCustomerComparison();
        }

    });
}

repo._getRepeatCustomerComparison = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tsv');
    var query = "select count(tsv.mac_address) as 'sum(rc.cnt_mac_address)' from customer_tracker.t_store_visit tsv left join customer_tracker.t_current_employee_notification tcen on (tsv.store_id = tcen.store_id AND tsv.mac_address = tcen.mac_address) where " + constants.getValue("es_compare_" + this.filterParam.comparison + "_" + this.filterParam.period) + " and " + queryFilterParam + " and new_customer_flag = 0 and (tcen.is_employee !=1 or tcen.is_employee is null);";

    this.connection.query(query, function(err, data) {

        if (err) {
            console.log(err)
            self.responseObject.isError = true;
        } else {
            // console.log(data[0]['sum(rc.cnt_mac_address)']);
            var percent = ((self.localObject.repeatCustomer.currentVal / self.localObject.storefrontData.currentVal) - (data[0]['sum(rc.cnt_mac_address)'] / self.localObject.storefrontData.comparisonVal)) / (data[0]['sum(rc.cnt_mac_address)'] / self.localObject.storefrontData.comparisonVal) * 100;
            self.responseObject.repeatCustomer.comparison = percent;
        }

        self.sendResponseCallback(self.responseObject);
    });
}


module.exports = tileDataRepository;