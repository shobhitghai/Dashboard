var constants = require('../constants.js');
var queryParamHelper = require('../queryParamHelper.js');

var timeTrendRepository = function(connection, sendResponseCallback, filterParam) {
    this.connection = connection;
    this.filterParam = filterParam;
    this.sendResponseCallback = sendResponseCallback;
    this.responseObject = {
        
    };

}

var repo = timeTrendRepository.prototype;

repo.getData = function() {
    this._getInitialSelectionData();
};

repo._getInitialSelectionData = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj);
    var query = constants.getValue('shopper_engagement_curr_month1') + queryFilterParam + constants.getValue('shopper_engagement_curr_month2');

    this.connection.query(query, function(err, data) {
        if (err) {
            self.responseObject.isError = true;
            self.sendResponseCallback(self.responseObject);
        } else {

            self._getLastMonthData();
        }

    });
}

repo._getSectionSelectionData = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj);
    var query = constants.getValue('shopper_engagement_last_month1') + queryFilterParam + constants.getValue('shopper_engagement_last_month2');

    this.connection.query(query, function(err, data) {

        if (err) {
            self.responseObject.isError = true;
        } else {

        }

        self.sendResponseCallback(self.responseObject);


    });
}

module.exports = timeTrendRepository;