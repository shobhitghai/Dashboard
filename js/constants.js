var constants = function() {
    this.obj = {
        current_Consecutive_Day: 'DATE(first_seen) = DATE(NOW())',
        current_Consecutive_Week: 'DATE(first_seen) <= DATE(NOW()) and WEEK(first_seen) = WEEK(NOW()) and YEAR(first_seen) = YEAR(NOW())',
        current_Consecutive_Month: 'DATE(first_seen) <= DATE(NOW()) and MONTH(first_seen) = MONTH(NOW()) and YEAR(first_seen) = YEAR(NOW())',
        compare_Consecutive_Day: 'first_seen <= DATE_SUB(NOW(),INTERVAL 1 DAY) and DATE(first_seen) = DATE_SUB(NOW(), INTERVAL 1 DAY)',
        compare_Consecutive_Week: 'first_seen <= DATE_SUB(NOW(),INTERVAL 1 WEEK) and WEEK(first_seen) = WEEK(DATE_SUB(NOW(),INTERVAL 1 WEEK)) and YEAR(first_seen) = YEAR(DATE_SUB(NOW(),INTERVAL 1 WEEK))',
        compare_Consecutive_Month: 'first_seen <= DATE_SUB(NOW(),INTERVAL 1 MONTH) and MONTH(first_seen) = MONTH(DATE_SUB(NOW(),INTERVAL 1 MONTH)) and YEAR(first_seen) = YEAR(DATE_SUB(NOW(),INTERVAL 1 MONTH))',
        current_Like_Day: 'DATE(first_seen) = DATE(NOW())',
        compare_Like_Day: 'first_seen <= DATE_SUB(NOW(),INTERVAL 7 DAY) and DATE(first_seen) = DATE_SUB(NOW(),INTERVAL 7 DAY)',


    };
}

constants.prototype.getValue = function(key) {
    return this.obj[key];
};

module.exports = new constants();