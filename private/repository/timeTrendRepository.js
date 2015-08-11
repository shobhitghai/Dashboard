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

//bring the ddata in one go and do other manipulation on client

repo._getOpportunityData = function(paramObj, isGlobalObj, triggerNext) {
    var self = this;
    /*daily OOP average*/

    if (paramObj) {
        var queryFilterParam = queryParamHelper.getQueryParam(paramObj, 'tsds');
        var query = "SELECT round(sum(oop.cnt_mac_address)/count(oop.visit_date)) AS 'count(mac_address)', oop.yearmonth from (SELECT tv.visit_date as visit_date, date_format(concat(year(tv.visit_date),'-',month(tv.visit_date),'-01'), '%b %y') AS yearmonth, concat(year(tv.visit_date),'-',month(tv.visit_date), '-01') AS yearofmonth, tv.store_id, count(DISTINCT tv.mac_address) AS cnt_mac_address FROM customer_tracker.t_visit tv LEFT JOIN customer_tracker.t_store_details tsds ON (tv.store_id=tsds.store_id) where " + queryFilterParam + "GROUP BY visit_date, store_id) AS oop GROUP BY oop.yearmonth ORDER BY month(oop.yearofmonth), year(oop.yearofmonth) ASC ";

        this.connection.query(query, function(err, data) {

            if (err) {
                console.log(err)

                self.responseObject.isError = true;
                self.sendResponseCallback(self.responseObject);
            } else {

                if (isGlobalObj) {
                    self.responseObject.filterPanelData.opportunityData = self._buildObjResponse(data)
                } else {
                    self.responseObject.sectionPanelData.opportunityData = self._buildObjResponse(data)
                }

                if (triggerNext) {
                    self._getStoreFrontData(self.filterParam.filterParamObj, true);
                    self._getStoreFrontData(self.filterParam.sectionParamObj, false, true);

                    // self.sendResponseCallback(self.responseObject);
                }
            }
        });

    } else {
        if (triggerNext) {
            self._getStoreFrontData(self.filterParam.filterParamObj, true);
            self._getStoreFrontData(self.filterParam.sectionParamObj, false, true);
        }
    }

}

repo._getStoreFrontData = function(paramObj, isGlobalObj, triggerNext) {
    var self = this;

    if (paramObj) {
        var queryFilterParam = queryParamHelper.getQueryParam(paramObj, 'tsds');
        var query = "select round(walkin.mac_address/walkin.visit_date) as 'count(mac_address)', walkin.yearmonth, walkin.yearofmonth from( SELECT count(distinct tv.visit_date) AS visit_date, Count(tv.mac_address) AS mac_address, Date_format(Concat(Year(tv.visit_date), '-', Month(tv.visit_date), '-01'), '%b %y') AS yearmonth, Concat(Year(tv.visit_date), '-', Month(tv.visit_date)) AS yearofmonth FROM customer_tracker.t_visit tv LEFT JOIN customer_tracker.t_store_details tsds ON ( tv.store_id = tsds.store_id ) LEFT JOIN customer_tracker.t_current_employee_notification tcen ON ( tv.store_id = tcen.store_id AND tv.mac_address = tcen.mac_address ) WHERE  " + queryFilterParam + " AND walk_in_flag = 1 AND ( tcen.is_employee != 1 OR tcen.is_employee IS NULL ) GROUP BY yearmonth) walkin order by yearofmonth;";

        this.connection.query(query, function(err, data) {

            if (err) {
                self.responseObject.isError = true;
            } else {
                console.log(data)

                if (isGlobalObj) {
                    self.responseObject.filterPanelData.storeFrontData = self._buildObjResponse(data);
                } else {
                    self.responseObject.sectionPanelData.storeFrontData = self._buildObjResponse(data);
                }

                if (triggerNext) {
                    self._getDwellTimeData(self.filterParam.filterParamObj, true);
                    self._getDwellTimeData(self.filterParam.sectionParamObj, false, true);
                }

            }
        });
    } else {
        if (triggerNext) {
            self._getDwellTimeData(self.filterParam.filterParamObj, true);
            self._getDwellTimeData(self.filterParam.sectionParamObj, false, true);
        }
    }


}


repo._getDwellTimeData = function(paramObj, isGlobalObj, triggerNext) {
    var self = this;

    if (paramObj) {
        var queryFilterParam = queryParamHelper.getQueryParam(paramObj, 'tsds');
        var query = "SELECT round(Avg(dwell_time)) AS 'count(mac_address)', concat(Year(tv.visit_date), '-', Month(tv.visit_date)) AS yearofmonth, Date_format(Concat(Year(tv.visit_date), '-', Month(tv.visit_date), '-01'), '%b %y') as yearmonth FROM customer_tracker.t_visit tv LEFT JOIN customer_tracker.t_store_details tsds on (tv.store_id=tsds.store_id) LEFT JOIN customer_tracker.t_current_employee_notification tcen ON ( tv.store_id = tcen.store_id AND tv.mac_address = tcen.mac_address ) where " + queryFilterParam + " AND walk_in_flag = 1 AND ( tcen.is_employee != 1 OR tcen.is_employee IS NULL ) GROUP BY yearmonth ORDER BY yearofmonth;";


        this.connection.query(query, function(err, data) {

            if (err) {
                self.responseObject.isError = true;
            } else {
                console.log(data)

                if (isGlobalObj) {
                    self.responseObject.filterPanelData.dwellTimeData = self._buildObjResponse(data);
                } else {
                    self.responseObject.sectionPanelData.dwellTimeData = self._buildObjResponse(data);
                }

                if (triggerNext) {
                    self._getRepeatCustomerData(self.filterParam.filterParamObj, true);
                    self._getRepeatCustomerData(self.filterParam.sectionParamObj, false, true);
                }

            }
        });
    } else {
        if (triggerNext) {
            self._getRepeatCustomerData(self.filterParam.filterParamObj, true, true);
            if (self.filterParam.sectionParamObj) {
                self._getRepeatCustomerData(self.filterParam.sectionParamObj, false, true);
            }
        }
    }


}

repo._getRepeatCustomerData = function(paramObj, isGlobalObj, triggerNext) {
    var self = this;

    if (paramObj) {
        var queryFilterParam = queryParamHelper.getQueryParam(paramObj, 'tsds');
        var query = "select count(tsv.mac_address) as 'count(mac_address)', concat(year(tsv.visit_date),'-',month(tsv.visit_date)) as yearmonth from customer_tracker.t_store_visit tsv left join customer_tracker.t_store_details tsds on (tsv.store_id = tsds.store_id) left join customer_tracker.t_current_employee_notification tcen on (tsv.store_id = tcen.store_id AND tsv.mac_address = tcen.mac_address) where " + queryFilterParam + " and new_customer_flag = 0 and (tcen.is_employee !=1 or tcen.is_employee is null) group by yearmonth; ";

        this.connection.query(query, function(err, data) {

            if (err) {
                self.responseObject.isError = true;
            } else {
                console.log(data)

                if (isGlobalObj) {
                    self.responseObject.filterPanelData.repeatCustData = self._buildObjResponse(data);
                } else {
                    self.responseObject.sectionPanelData.repeatCustData = self._buildObjResponse(data);
                }

                if (triggerNext) {
                    self.sendResponseCallback(self.responseObject);
                }

            }
        });
    }
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
