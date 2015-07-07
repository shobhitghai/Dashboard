var constants = require('../constants.js');

var crossVisitRepository = function(connection, sendResponseCallback, filterParam) {
    this.connection = connection;
    this.filterParam = filterParam;
    this.sendResponseCallback = sendResponseCallback;
    this.responseObject = {};
    this.localObject = {};
}

var repo = crossVisitRepository.prototype;

repo.getData = function() {
    this._getStoreData();
};

repo._getStoreData = function() {
    var self = this;
    var query = "SELECT COUNT(subsequent_to_store_id) FROM t_store_visit WHERE subsequent_to_store_id = " + this.filterParam.storeName + " AND visit_date > DATE_SUB(NOW(), INTERVAL 3 MONTH);";

    this.connection.query(query, function(err, data) {

        if (err) {
            console.log(err);
            self.responseObject.isError = true;
            self.sendResponseCallback(self.responseObject);
        } else {
            self.responseObject.crossVisit = {};
            self.responseObject.crossVisit.store = data[0]['COUNT(subsequent_to_store_id)'].toFixed(1);

            self._getBrandAverageData();
        }

    });
}

repo._getBrandAverageData = function() {
    var self = this;
    var query = "SELECT tsv.brand_id, COUNT(tsv.subsequent_to_store_id), (COUNT(tsv.subsequent_to_store_id)/tsd.no_of_stores) FROM t_store_visit tsv, (SELECT brand_id, COUNT(store_id) AS no_of_stores FROM t_store_details GROUP BY brand_id) tsd WHERE tsv.brand_id = tsd.brand_id AND tsv.brand_id = 1001 GROUP BY tsv.brand_id;";

    this.connection.query(query, function(err, data) {

        if (err) {
            console.log(err)
            self.responseObject.isError = true;
        } else {
            self.responseObject.crossVisit.brand = data[0]['(COUNT(tsv.subsequent_to_store_id)/tsd.no_of_stores)'].toFixed(1);
        }

        self.sendResponseCallback(self.responseObject);
    });
}


module.exports = crossVisitRepository;