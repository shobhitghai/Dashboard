var constants = require('../constants.js');

var tileDataRepository = function(connection, sendResponseCallback, filterParam) {
    this.connection = connection;
    this.filterParam = filterParam;
    this.sendResponseCallback = sendResponseCallback;
    this.responseObject = {};
}

var repo = tileDataRepository.prototype;

repo.getTilesData = function() {
    this._getCurrentOpportunityCount();
};

repo._getCurrentOpportunityCount = function() {
    var self = this;
    var query = "select sum(oop.cnt_mac_address) as 'count(mac_address)' from(select visit_date, count(distinct mac_address) as cnt_mac_address from customer_tracker.t_visit where " + constants.getValue("current_" + this.filterParam.comparison + "_" + this.filterParam.period) + " and store_id = " + this.filterParam.storeName + " group by visit_date) as oop ;";

    this.connection.query(query, function(err, data) {

        if (err) {
            console.log(err);
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
    var query = "select sum(oop.cnt_mac_address) as 'count(mac_address)' from(select visit_date, count(distinct mac_address) as cnt_mac_address from customer_tracker.t_visit where " + constants.getValue("compare_" + this.filterParam.comparison + "_" + this.filterParam.period) + " and store_id = " + this.filterParam.storeName + " group by visit_date) as oop"
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
    var query = "select count(mac_address) as 'count(mac_address)' from customer_tracker.t_visit where " + constants.getValue("current_" + this.filterParam.comparison + "_" + this.filterParam.period) + " and store_id = " + this.filterParam.storeName + " and walk_in_flag =1 and dwell_time < 60*60 and dwell_time > 0";

    this.connection.query(query, function(err, data) {

        if (err) {
            self.responseObject.isError = true;
            self.sendResponseCallback(self.responseObject);
        } else {
            self.responseObject.storefrontData = {};
            self.responseObject.storefrontData.current = (data[0]['count(mac_address)'] / self.responseObject.opportunityData.current) * 100;

            self._getStoreFrontComparison();
        }

    });
}

repo._getStoreFrontComparison = function() {
    var self = this;
    var query = "select count(mac_address) as 'count(mac_address)' from customer_tracker.t_visit where " + constants.getValue("compare_" + this.filterParam.comparison + "_" + this.filterParam.period) + " and store_id = " + this.filterParam.storeName + " and walk_in_flag =1 and dwell_time < 60*60 and dwell_time > 0";

    this.connection.query(query, function(err, data) {

        if (err) {
            self.responseObject.isError = true;
            self.sendResponseCallback(self.responseObject);

        } else {
            var percent = ((self.responseObject.storefrontData.current - (data[0]['count(mac_address)'] * 100/ self.responseObject.opportunityData.comparisonNumber)) / (data[0]['count(mac_address)'] * 100 / self.responseObject.opportunityData.comparisonNumber)) * 100;
            self.responseObject.storefrontData.comparison = percent;
            self._getDwellTimeCount();
        }


    });
}

repo._getDwellTimeCount = function() {
    var self = this;
    var query = "select avg(dwell_time) from customer_tracker.t_visit where " + constants.getValue("current_" + this.filterParam.comparison + "_" + this.filterParam.period) + " and store_id = " + this.filterParam.storeName + " and walk_in_flag = 1 and dwell_time < 60*60 and dwell_time > 0"; // and store_selection = x";

    this.connection.query(query, function(err, data) {

        if (err) {
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
    var query = "select avg(dwell_time) from customer_tracker.t_visit where " + constants.getValue("compare_" + this.filterParam.comparison + "_" + this.filterParam.period) + " and store_id = " + this.filterParam.storeName + " and walk_in_flag = 1 and dwell_time < 60*60 and dwell_time > 0"; // and store_selection = x";

    this.connection.query(query, function(err, data) {

        if (err) {
            self.responseObject.isError = true;
        } else {
            var percent = ((self.responseObject.dwellTimeData.current - data[0]['avg(dwell_time)']) / data[0]['avg(dwell_time)']) * 100;
            self.responseObject.dwellTimeData.comparison = percent;
        }
        self.sendResponseCallback(self.responseObject);


    });
}


module.exports = tileDataRepository;
