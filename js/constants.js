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
        compare_Consecutive_Day: 'first_seen <= DATE_SUB(NOW(),INTERVAL 1 DAY) and DATE(first_seen) = DATE(DATE_SUB(NOW(),INTERVAL 1 DAY))',
        compare_Consecutive_Week: 'first_seen <= DATE_SUB(NOW(),INTERVAL 1 WEEK) and WEEK(first_seen) = WEEK(DATE_SUB(NOW(),INTERVAL 1 WEEK)) and YEAR(first_seen) = YEAR(DATE_SUB(NOW(),INTERVAL 1 WEEK))',
        compare_Consecutive_Month: 'first_seen <= DATE_SUB(NOW(),INTERVAL 1 MONTH) and MONTH(first_seen) = MONTH(DATE_SUB(NOW(),INTERVAL 1 MONTH)) and YEAR(first_seen) = YEAR(DATE_SUB(NOW(),INTERVAL 1 MONTH))',
        current_Like_Day: 'DATE(first_seen) = DATE(NOW())',
        compare_Like_Day: 'first_seen <= DATE_SUB(NOW(),INTERVAL 7 DAY) and DATE(first_seen) = DATE_SUB(NOW(),INTERVAL 7 DAY)',

        repeat_current_Consecutive_Day: 'DATE(left_store) = DATE(NOW())',
        repeat_current_Consecutive_Week: 'DATE(left_store) <= DATE(NOW()) and WEEK(left_store) = WEEK(NOW()) and YEAR(left_store) = YEAR(NOW())',
        repeat_current_Consecutive_Month: 'DATE(left_store) <= DATE(NOW()) and MONTH(left_store) = MONTH(NOW()) and YEAR(left_store) = YEAR(NOW())',
        repeat_compare_Consecutive_Day: 'left_store <= DATE_SUB(NOW(),INTERVAL 1 DAY) and DATE(left_store) = DATE(DATE_SUB(NOW(),INTERVAL 1 DAY))',
        repeat_compare_Consecutive_Week: 'left_store <= DATE_SUB(NOW(),INTERVAL 1 WEEK) and WEEK(left_store) = WEEK(DATE_SUB(NOW(),INTERVAL 1 WEEK)) and YEAR(left_store) = YEAR(DATE_SUB(NOW(),INTERVAL 1 WEEK))',
        repeat_compare_Consecutive_Month: 'left_store <= DATE_SUB(NOW(),INTERVAL 1 MONTH) and MONTH(left_store) = MONTH(DATE_SUB(NOW(),INTERVAL 1 MONTH)) and YEAR(left_store) = YEAR(DATE_SUB(NOW(),INTERVAL 1 MONTH))',
        repeat_current_Like_Day: 'DATE(left_store) = DATE(NOW())',
        repeat_compare_Like_Day: 'left_store <= DATE_SUB(NOW(),INTERVAL 7 DAY) and DATE(left_store) = DATE_SUB(NOW(),INTERVAL 7 DAY)',



        //shopper engagement
        // shopper_engagement_curr_month: 'select count(mac_address), case when dwell_time >= 10*60 then "gt10" when dwell_time >= 5*60 and dwell_time < 10*60 then "gt5" when dwell_time >= 2*60 and dwell_time < 5*60 then "gt2" else "bounce" end as DT from customer_tracker.t_visit where DATE(first_seen) <= DATE(NOW()) and MONTH(first_seen) =MONTH(NOW()) and YEAR(first_seen) =YEAR(NOW()) and walk_in_flag =1 group by DT',
        // shopper_engagement_last_month: 'select count(mac_address), case when dwell_time >= 10*60 then "gt10" when dwell_time >= 5*60 and dwell_time < 10*60 then "gt5" when dwell_time >= 2*60 and dwell_time < 5*60 then "gt2" else "bounce" end as DT from customer_tracker.t_visit where MONTH(first_seen) = MONTH(DATE_SUB(NOW(),INTERVAL 1 MONTH)) and YEAR(first_seen) = YEAR(DATE_SUB(NOW(),INTERVAL 1 MONTH)) and walk_in_flag =1 group by DT',
        shopper_engagement_curr_month1: 'select count(mac_address), case when dwell_time >= 10*60 then "gt10" when dwell_time >= 5*60 and dwell_time < 10*60 then "gt5" when dwell_time >= 2*60 and dwell_time < 5*60 then "gt2" else "bounce" end as DT from customer_tracker.t_visit where DATE(first_seen) <= DATE(NOW()) and MONTH(first_seen) =MONTH(NOW()) and YEAR(first_seen) =YEAR(NOW()) and store_id = ',
        shopper_engagement_curr_month2: ' and walk_in_flag =1 and dwell_time < 60*60 and dwell_time > 0 group by DT',
        shopper_engagement_last_month1: 'select count(mac_address), case when dwell_time >= 10*60 then "gt10" when dwell_time >= 5*60 and dwell_time < 10*60 then "gt5" when dwell_time >= 2*60 and dwell_time < 5*60 then "gt2" else "bounce" end as DT from customer_tracker.t_visit where MONTH(first_seen) = MONTH(DATE_SUB(NOW(),INTERVAL 1 MONTH)) and YEAR(first_seen) = YEAR(DATE_SUB(NOW(),INTERVAL 1 MONTH)) and store_id = ',
        shopper_engagement_last_month2: ' and walk_in_flag =1 and dwell_time < 60*60 and dwell_time > 0 group by DT',

        right_now_people: 'select count(mac_address) as cnt, walk_in_flag from customer_tracker.t_visit where last_seen >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) and last_seen <= NOW() and DATE(first_seen) = DATE(NOW()) group by walk_in_flag',

        //campaign impact
        // campaign_impact_query1: 'select count(mac_address) as cnt, DATEDIFF(day,start_date_var,end_date_var) + 1 AS DiffDate, avg(dwell_time) as dwt from customer_tracker.t_visit where DATE(first_seen) <= end_date_var and DATE(first_seen) >= start_date_var and walk_in_flag = 1',
        campaign_impact_query1: "select count(mac_address) as cnt, DATEDIFF('2015-07-20','2015-07-30') + 1 AS DiffDate, avg(dwell_time) as dwt from customer_tracker.t_visit where DATE(first_seen) <= '2015-07-30' and DATE(first_seen) >= '2015-07-20' and walk_in_flag = 1",

        // campaign_impact_query2: 'select count(mac_address) as cnt, DATEDIFF(day,DATE_SUB(start_date_var, INTERVAL 1 MONTH),start_date_var) AS DiffDate, avg(dwell_time) as dwt from customer_tracker.t_visit where DATE(first_seen) >= DATE_SUB(start_date_var, INTERVAL 1 MONTH) and DATE(first_seen) < start_date_var and walk_in_flag = 1',
        campaign_impact_query2: "select count(mac_address) as cnt, DATEDIFF(DATE_SUB('2015-07-20', INTERVAL 1 MONTH),'2015-07-20') AS DiffDate, avg(dwell_time) as dwt from customer_tracker.t_visit where DATE(first_seen) >= DATE_SUB('2015-07-20', INTERVAL 1 MONTH) and DATE(first_seen) < '2015-07-20' and walk_in_flag = 1",


    };
}

constants.prototype.getValue = function(key) {
    return this.obj[key];
};

module.exports = new constants();