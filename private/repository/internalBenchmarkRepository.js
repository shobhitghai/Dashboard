var constants = require('../constants.js');
var queryParamHelper = require('../queryParamHelper.js');

var internalBenchmarkRepository = function(connection, sendResponseCallback, filterParam) {
    this.connection = connection;
    this.filterParam = filterParam;
    this.sendResponseCallback = sendResponseCallback;
    this.responseObject = {};
}

var repo = internalBenchmarkRepository.prototype;

repo.getData = function() {
    this._getStoreData();
};

repo._getStoreWalkin = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tsds');
    var query = "SELECT csv.crossstorevisit/csv.totalvisit as CrossStoreVisitPercent FROM( SELECT COUNT(tsv.subsequent_to_store_id) as crossstorevisit, COUNT(tsv.mac_address) as totalvisit from t_store_visit tsv left join t_store_details tsds on (tsv.store_id = tsds.store_id) left join customer_tracker.t_current_employee_notification tcen on (tsv.store_id = tcen.store_id and tsv.mac_address = tcen.mac_address) where " + queryFilterParam + " AND visit_date > DATE_SUB(NOW(), INTERVAL 3 MONTH) and (tcen.is_employee !=1 or tcen.is_employee is null)) csv;"
    this.connection.query(query, function(err, data) {

        if (err) {
            console.log(err);
            self.responseObject.isError = true;
            self.sendResponseCallback(self.responseObject);
        } else {
            self.responseObject.crossVisit = {};
            self.responseObject.crossVisit.store = data[0]['CrossStoreVisitPercent'] * 100;

            self._getBrandAverageData();
        }

    });
}

repo._getCityWalkin = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.brandObj, 'tsds');
    var query = "SELECT csv.crossstorevisit/csv.totalvisit as CrossStoreVisitBrandPercent FROM( SELECT COUNT(tsv.subsequent_to_store_id) as crossstorevisit, COUNT(tsv.mac_address) as totalvisit from t_store_visit tsv left join t_store_details tsds on (tsv.store_id = tsds.store_id) left join customer_tracker.t_current_employee_notification tcen on (tsv.store_id = tcen.store_id and tsv.mac_address = tcen.mac_address) where " + queryFilterParam + " AND visit_date > DATE_SUB(NOW(), INTERVAL 3 MONTH) AND (tcen.is_employee !=1 or tcen.is_employee is null) ) csv;";

    this.connection.query(query, function(err, data) {

        if (err) {
            console.log(err)
            self.responseObject.isError = true;
        } else {
            self.responseObject.crossVisit.brand = data[0]['CrossStoreVisitBrandPercent'] * 100;
        }

        self.sendResponseCallback(self.responseObject);
    });
}


module.exports = crossVisitRepository;