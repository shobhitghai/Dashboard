var constants = function() {
    this.obj = {

        //db details
        db_host: 'ec2-52-74-25-254.ap-southeast-1.compute.amazonaws.com',
        db_user: 'webapp',
        db_password: 'billion123!',
        db_database: "customer_tracker",


        //sql queries params
        current_Consecutive_Day: 'DATE(first_seen) = DATE(NOW())',
        current_Consecutive_Week: 'DATE(first_seen) <= DATE(NOW()) and WEEK(first_seen) = WEEK(NOW()) and YEAR(first_seen) = YEAR(NOW())',
        current_Consecutive_Month: 'DATE(first_seen) <= DATE(NOW()) and MONTH(first_seen) = MONTH(NOW()) and YEAR(first_seen) = YEAR(NOW())',
        compare_Consecutive_Day: 'first_seen <= DATE_SUB(NOW(),INTERVAL 1 DAY) and DATE(first_seen) = DATE_SUB(NOW(), INTERVAL 1 DAY)',
        compare_Consecutive_Week: 'first_seen <= DATE_SUB(NOW(),INTERVAL 1 WEEK) and WEEK(first_seen) = WEEK(DATE_SUB(NOW(),INTERVAL 1 WEEK)) and YEAR(first_seen) = YEAR(DATE_SUB(NOW(),INTERVAL 1 WEEK))',
        compare_Consecutive_Month: 'first_seen <= DATE_SUB(NOW(),INTERVAL 1 MONTH) and MONTH(first_seen) = MONTH(DATE_SUB(NOW(),INTERVAL 1 MONTH)) and YEAR(first_seen) = YEAR(DATE_SUB(NOW(),INTERVAL 1 MONTH))',
        current_Like_Day: 'DATE(first_seen) = DATE(NOW())',
        compare_Like_Day: 'first_seen <= DATE_SUB(NOW(),INTERVAL 7 DAY) and DATE(first_seen) = DATE_SUB(NOW(),INTERVAL 7 DAY)',


        //shopper engagement
        shopper_engagement_curr_month: 'select count(mac_address), case when dwell_time >= 10*60 then "gt10" when dwell_time >= 5*60 and dwell_time < 10*60 then "gt5" when dwell_time >= 2*60 and dwell_time < 5*60 then "gt2" else "bounce" end as DT from customer_tracker.t_visit where DATE(first_seen) <= DATE(NOW()) and MONTH(first_seen) =MONTH(NOW()) and YEAR(first_seen) =YEAR(NOW()) and walk_in_flag =1 group by DT',
        shopper_engagement_last_month: 'select count(mac_address), case when dwell_time >= 10*60 then "gt10" when dwell_time >= 5*60 and dwell_time < 10*60 then "gt5" when dwell_time >= 2*60 and dwell_time < 5*60 then "gt2" else "bounce" end as DT from customer_tracker.t_visit where MONTH(first_seen) = MONTH(DATE_SUB(NOW(),INTERVAL 1 MONTH)) and YEAR(first_seen) = YEAR(DATE_SUB(NOW(),INTERVAL 1 MONTH)) and walk_in_flag =1 group by DT',


    };
}

constants.prototype.getValue = function(key) {
    return this.obj[key];
};

module.exports = new constants();