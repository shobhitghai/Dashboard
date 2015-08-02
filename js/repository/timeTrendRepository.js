var constants = require('../constants.js');
var queryParamHelper = require('../queryParamHelper.js');

var timeTrendRepository = function(connection, sendResponseCallback, filterParam) {
    this.connection = connection;
    this.filterParam = filterParam;
    this.sendResponseCallback = sendResponseCallback;
    this.responseObject = {
        filterPanelData: {},
        sectionPanelData: {}
    };

}

var repo = timeTrendRepository.prototype;

repo.getData = function() {
    this._getOpportunityData(this.filterParam.filterParamObj, true);
    this._getOpportunityData(this.filterParam.sectionParamObj, false, true);
};

repo._getOpportunityData = function(paramObj, isGlobalObj, sendResponse) {
    var self = this;
    console.log(paramObj)
    var queryFilterParam = queryParamHelper.getQueryParam(paramObj, 'tv');
    var query = "select sum(oop.cnt_mac_address) as 'count(mac_address)', oop.yearmonth from( select tv.visit_date, concat(year(tv.visit_date),'-',month(tv.visit_date)) as yearmonth, tv.store_id, count(distinct tv.mac_address) as cnt_mac_address from customer_tracker.t_visit tv where " + queryFilterParam + " group by visit_date, store_id) as oop group by oop.yearmonth order by oop.yearmonth asc";
    console.log(query)
    this.connection.query(query, function(err, data) {

        if (err) {
            console.log(err)

            self.responseObject.isError = true;
            self.sendResponseCallback(self.responseObject);
        } else {
            if (self.filterParam.requestType == 'StoreFront') {

                if(isGlobalObj){
                    self.responseObject.filterPanelData.opportunityData = self._buildObjResponse(data)
                }else{
                    self.responseObject.sectionPanelData.opportunityData = self._buildObjResponse(data)
                }

                self._getStoreFrontData();
            } else {

                if(isGlobalObj){
                    self.responseObject.filterPanelData.data = self._buildObjResponse(data)
                    // console.log(self._buildObjResponse(data))
                }else{
                    self.responseObject.sectionPanelData.data = self._buildObjResponse(data)
                    // console.log(self._buildObjResponse(data))

                }

                if(sendResponse){
                    self.sendResponseCallback(self.responseObject);
                    // console.log(self.responseObject)
                }
            }
        }

    });
}

repo._getStoreFrontData = function() {
    var self = this;

    var queryFilterParam = queryParamHelper.getQueryParam(this.filterParam.filterParamObj, 'tv');
    var query = "select count(tv.mac_address) as 'count(mac_address)' , concat(year(tv.visit_date),'-',month(tv.visit_date)) as yearmonth from customer_tracker.t_visit tv left join customer_tracker.t_current_employee_notification tcen on (tv.store_id = tcen.store_id AND tv.mac_address = tcen.mac_address) where " + queryFilterParam + " and walk_in_flag =1 and (tcen.is_employee !=1 or tcen.is_employee is null) group by yearmonth";

    this.connection.query(query, function(err, data) {

        if (err) {
            self.responseObject.isError = true;
        } else {
            var walkInObjArr = self._buildObjResponse(data);


        }

        self.sendResponseCallback(self.responseObject);


    });
}

repo._buildStoreFrontResponse = function(){
    
}

repo._buildObjResponse = function(data) {

    var opportunityObjArr = [];

    for (var i = 0; i < data.length; i++) {
        opportunityObjArr.push({
            'period': data[i]['yearmonth'],
            'data': data[i]['count(mac_address)']
        });
    }

    return opportunityObjArr;

}


module.exports = timeTrendRepository;