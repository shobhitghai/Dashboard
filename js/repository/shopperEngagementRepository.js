var constants = require('../constants.js');

var shopperEngagementRepository = function(connection, sendResponseCallback, filterParam) {
    this.connection = connection;
    this.filterParam = filterParam;
    this.sendResponseCallback = sendResponseCallback;
    this.responseObject = {
        currentMonthArray: [],
        lastMonthMArray: []
    };

}

var repo = shopperEngagementRepository.prototype;

repo.getData = function() {
    this._getCurrentMonthData();
};

repo._getCurrentMonthData = function() {
    var self = this;
    var query = constants.getValue('shopper_engagement_curr_month1') + self.filterParam.storeName + constants.getValue('shopper_engagement_curr_month2');

    this.connection.query(query, function(err, data) {
        if (err) {
            self.responseObject.isError = true;
            self.sendResponseCallback(self.responseObject);
        } else {

            self._pushDataInMonthArray(data, 'gt10', self.responseObject.currentMonthArray);
            self._pushDataInMonthArray(data, 'gt5', self.responseObject.currentMonthArray);
            self._pushDataInMonthArray(data, 'gt2', self.responseObject.currentMonthArray);
            self._pushDataInMonthArray(data, 'bounce', self.responseObject.currentMonthArray);

            self._getLastMonthData();
        }

    });
}

repo._getLastMonthData = function() {
    var self = this;
    var query = constants.getValue('shopper_engagement_last_month1') + self.filterParam.storeName + constants.getValue('shopper_engagement_last_month2');

    this.connection.query(query, function(err, data) {

        if (err) {
            self.responseObject.isError = true;
        } else {

            self._pushDataInMonthArray(data, 'gt10', self.responseObject.lastMonthMArray);
            self._pushDataInMonthArray(data, 'gt5', self.responseObject.lastMonthMArray);
            self._pushDataInMonthArray(data, 'gt2', self.responseObject.lastMonthMArray);
            self._pushDataInMonthArray(data, 'bounce', self.responseObject.lastMonthMArray);
        }
        
        self.sendResponseCallback(self.responseObject);


    });
}

repo._pushDataInMonthArray = function(data, key, array) {
    var self = this;
    var isExist = false;

    for (var i = 0; i <= 3; i++) {
        if (data[i]) {
            if (data[i]['DT'] == key) {
                isExist = true;
                array.push(data[i]['count(mac_address)']);
            }
        }
    };

    if (!isExist) {
        array.push(0);
    }
}

module.exports = shopperEngagementRepository;