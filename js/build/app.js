/*! Fashion_Dashboard 1.0.0 2015-07-23 */
//####js/component/base.js
// Define Namespace
(function() {
    this.app = {};
}).call(this);

// Config
(function() {
    app.config = {
        hello: 'world'
    };
}(app));

//use media queries to determine if what screen size we are using
// Create the state-indicator element
var indicator = document.createElement('div');
indicator.className = 'state-indicator';
document.body.appendChild(indicator);

//function added below - getDeviceState - use this to determine state.
// Create a method which returns device state
function getDeviceState() {
    var state = window.getComputedStyle(
        document.querySelector('.state-indicator'), ':before'
    ).getPropertyValue('content')

    state = state.replace(/"/g, "");
    state = state.replace(/'/g, ""); //fix for update in chrome which returns ''

    return state; //need to replace quotes to support mozilla - which returns a string with quotes inside.

}

//sets host url for ajax call
window.hostUrl = 'http://' + window.location.hostname + ':3000/api/';



// FOR DEBUG
// Cancel out errors in browsers that don't recognise various console functions
(function() {
    if (!window.console) {
        window.console = {};
    }
    // Union of Chrome, FF, IE, and Safari console methods
    var m = [
        "log", "info", "warn", "error", "debug", "trace", "dir", "group",
        "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
        "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
    ];
    // Define undefined methods as noops to prevent errors
    var noops = function() {};
    for (var i = 0; i < m.length; i++) {
        if (!window.console[m[i]]) {
            window.console[m[i]] = noops;
        }
    }
})();

//get unique global method
Array.prototype.getUnique = function() {
    var u = {},
        a = [];
    for (var i = 0, l = this.length; i < l; ++i) {
        if (u.hasOwnProperty(this[i])) {
            continue;
        }
        a.push(this[i]);
        u[this[i]] = 1;
    }
    return a;
}

$(function() {
    getStoreListData(app.util.initModules);
});

function getStoreListData(initModules) {
    var storeDropdown = $('.mod-navbar').find('.store-dropdown');
    window.storeDetail = {
        name: ''
    };

    function successCallback(res) {
        var res = $.parseJSON(res);
        // console.log(res)
        var dropdownMenu = storeDropdown.find('.dropdown-menu');
        var storeSelected = storeDropdown.find('.store-selected .selected-value');

        $.each(res, function(i, v) {
            var id = '10000' + (i + 1);
            dropdownMenu.append('<li><a data-id=' + id + ' href="javascript:void(0)">' + this.name + '</span></a></li>')
        });

        window.storeDetail.name = "100001";
        storeSelected.text(res[0].name);
        dropdownMenu.find('li a').on('click', function(e) {
            e.preventDefault;
            storeSelected.text($(this).text());

            window.storeDetail.name = $(this).data('id');

            $.each(app, function(module, v) {
                if (app[module].refreshData) {
                    app[module].refreshData();
                }
            })
        })

        initModules();
    }

    function errorCallback(err) {
        console.log('navbar' + err || 'err');
    }

    $.ajax({
        url: hostUrl + 'getStoreDetails',
        success: function(res) {
            successCallback(res);
        },
        error: function(err) {
            errorCallback(err);
        }
    })

}

(function() {
    app.util = {
        initModules: function(context) {

            var modules = [],
                unique = [],
                pattern = '[class^="mod-"], [class*=" mod-"]';
            targets = $(pattern, context);

            // NOTE: When calling this function you CAN pass either a selector
            // string or jQuery object as the context, it will handle either.
            context = $(context);

            // No context? Set as the document
            if (context.length === 0) context = $(document);

            // If context is a valid element, add it as a target. This catches
            // instances where the context is also a module
            // NOTE: Context could reference multiple elements, hence the loop
            context.each(function() {
                if (!!$(this).filter(pattern).length) targets = targets.add($(this));
            });

            // Loop through all targets (target are elements with .mod class)
            targets.each(function() {

                // Grab element classes & match pattern mod-{module}
                var matches = $(this).prop('class').match(/mod-([^ ]+)/g);

                // Add module(s) to modules array
                $.each(matches, function(i) {

                    // NOTE: We strip out 'mod-' here as the global tag in the
                    // regex causes the whole match to be returned, not just
                    // the capture group #BangsHeadAgainstWall
                    var module = matches[i].replace('mod-', '');

                    // Add only if module exists
                    if (app[module]) {
                        modules.push(module);

                    }
                });
            });

            // Remove duplicate entries
            $.each(modules, function(i, n) {
                if ($.inArray(n, unique) === -1) unique.push(n);
            });
            modules = unique;

            // Fire init on each module
            var defer = [];
            $.each(modules, function(i) {
                if (app[modules[i]].init) {

                    // Defer till after main init loop?
                    if (app[modules[i]].settings.defer) {
                        defer.push(modules[i]);
                    } else {
                        app[modules[i]].init(context);
                    }
                } else {
                    console.log('initModule: The module \'' + modules[i] + '\' does not have an init method');
                }
            });

            // Fire init on deferred modules
            $.each(defer, function(i) {
                if (app[defer[i]].init) {
                    app[defer[i]].init(context);
                } else {
                    console.log('initModule: The module \'' + defer[i] + '\' does not have an init method');
                }
            });

            // Return list of modules
            return modules;

        },
    }
})(app);
//####js/component/ajax-wrapper.js
(function() {
    app['ajax-wrapper'] = {
        sendAjax: function(api, data, successCallback, errorCallback, showLoader) {

            if (showLoader) {
                NProgress.start(true);
            }

            $.ajax({
                url: hostUrl + api,
                data: data || {},
                cache: true,
                success: function(res) {
                    successCallback(res);
                    if (showLoader) {
                        NProgress.done(true);
                    }
                },
                error: function(err) {
                    errorCallback(err);
                }
            })
        }
    }
})(app);
//####js/component/filter-panel.js
(function() {
    app['filter-panel'] = {
        settings: {
            target: '.mod-filter-panel'
        },
        init: function(context) {
            var s = this.settings;
            app['filter-panel'].fetchData();
            app['filter-panel'].selectionHandler();

        },
        fetchData: function(url, storeDropdown) {
            var self = this;

            function successCallback(res) {
                var res = $.parseJSON(res);
                console.log(res)
                self.response = res;
                app['filter-panel'].renderList(res, '');
                app['filter-panel'].filterListSelection(res);
            }

            function errorCallback(err) {
                console.log(err);
            }

            $.ajax({
                url: hostUrl + 'getStoreDetails',
                success: function(res) {
                    successCallback(res);
                },
                error: function(err) {
                    errorCallback(err);
                }
            })

        },
        renderList: function(res, listType) {
            var s = this.settings;
            var cityContainer = $(s.target).find('#city-dd');
            var storeContainer = $(s.target).find('#name-dd');
            var brandContainer = $(s.target).find('#brand-dd');

            var cityArray = new Array();
            var storeArray = new Array();
            var brandArray = new Array();

            $.each(res, function(i, v) {
                cityArray.push(this.city);
                storeArray.push(this.name);
                brandArray.push(this.brand_name);
            })

            cityArray = cityArray.getUnique();
            storeArray = storeArray.getUnique();
            brandArray = brandArray.getUnique();

            if (listType != 'city')
                app['filter-panel'].appendList(cityArray, cityContainer, 'city', 'by city');

            if (listType != 'name')
                app['filter-panel'].appendList(storeArray, storeContainer, 'name', 'by store');

            if (listType != 'brand_name')
                app['filter-panel'].appendList(brandArray, brandContainer, 'brand_name', 'by brand');

        },
        selectionHandler: function() {
            var self = this;
            var s = this.settings;
            var panel = $(s.target);

            panel.find('.btn-filter').on('click', function() {
                var selectedCityArr = [];
                var selectedStoreArr = [];
                var selectedBrandArr = [];

                var selection = $('.lbjs-item[selected=selected]');

                $.each(selection, function(i, v) {
                    if ($(this).data('list-type') == 'city') {
                        selectedCityArr.push($(this).text());
                    } else if ($(this).data('list-type') == 'name') {
                        selectedStoreArr.push(app['filter-panel'].getStoreId($(this).text()));
                    } else if ($(this).data('list-type') == 'brand_name') {
                        selectedBrandArr.push(app['filter-panel'].getBrandId($(this).text()));
                    }
                });

                window.filterParamObj = {
                    storeId: selectedStoreArr,
                    city: selectedCityArr,
                    brandId: selectedBrandArr
                }

                console.log(selectedCityArr, selectedStoreArr, selectedBrandArr);

                $.each(app, function(module, v) {
                    if (app[module].refreshData) {
                        app[module].refreshData();
                    }
                })

                // console.log(app['filter-panel'].getStoreId('Linking Road Store'));
            });

            panel.find('.btn-reset-filter').on('click', function() {
                panel.find('.lbjs').remove();
                panel.find('.modal-body select option').remove();
                app['filter-panel'].renderList(self.response, '');
                app['filter-panel'].filterListSelection(self.response);
            });

        },
        appendList: function(arrayList, container, listType, searchText) {
            $.each(arrayList, function(i, val) {
                container.append('<option>' + val + '</option>');
            });

            container.listbox({
                'searchbar': true,
                'listType': listType,
                'searchText': searchText
            });
        },
        filterListSelection: function(res) {
            var obj = new Array();

            $('.lbjs-item').on('click', function() {
                if (!($(this).attr('disabled') == 'disabled')) {
                    var self = this;

                    // $(self).attr('data-selected', true);

                    if ($(self).attr('selected')) {
                        $(self).attr('data-selected', true);
                        // $(self).attr('data-disabled', false);
                    } else {
                        $(self).attr('data-selected', false);
                    }

                    var type = $(self).attr('data-list-Type');
                    var value = $(self).text();

                    $.each(res, function(i, v) {
                        if (this[type] === value) {
                            if ($(self).attr('selected')) {
                                obj.push(this);
                            } else {
                                obj.pop(this);
                            }
                        }
                    })

                    console.log(obj, type);
                    app['filter-panel'].enableDisableListSelection(obj, type);
                }

            });
        },
        enableDisableListSelection: function(obj, type) {
            function disbaleItem(key) {
                $.each($('.lbjs-item[data-list-type =' + key + ']'), function(i, v) {
                    var self = this;
                    // if (!$(self).attr('data-selected')) {
                    // $(self).attr('data-disabled', true);
                    $(self).attr('disabled', true);

                    // }

                    $.each(obj, function(ind, val) {
                        if ($(self).text() === this[key]) {
                            // $(self).attr('data-disabled', false);
                            $(self).attr('disabled', false);
                            $(self).attr('data-selected', true);
                        };
                    })
                })
            }

            if (type == 'city') {
                disbaleItem('name');
                disbaleItem('brand_name');
            }

            if (type == 'name') {
                disbaleItem('city');
                disbaleItem('brand_name');
            }

            if (type == 'brand_name') {
                disbaleItem('city');
                disbaleItem('name');
            }
        },
        getStoreId: function(name) {
            var self = this;
            var id;
            $.each(self.response, function(i, v) {
                if (this['name'] == name) {
                    id = this['store_id'];
                    return false;
                }
            });

            return id;
        },
        getBrandId: function(brand) {
            var self = this;
            var id;
            $.each(self.response, function(i, v) {
                if (this['brand_name'] == brand) {
                    id = this['brand_id'];
                    return false;
                }
            });

            return id;
        }
    }
})(app);
//####js/component/tile-section.js
(function() {
    app['tile-section'] = {
        settings: {
            target: '.mod-tile-section',
            metric: {
                comparison: 'Consecutive',
                period: 'Day'
            },
            c: 0
        },
        init: function(context) {
            this.tile_template = App.Template['tile-opportunity'];
            this.tile_repeat_cust = App.Template['tile-repeat-cust'];

            var s = this.settings;

            s.metric.storeName = window.storeDetail.name;
            app['tile-section']._fetchData('getTilesData', s.metric, true);

            $(s.target).find('.btn-metric').off().on('click', function() {

                if ($(this).attr('data-metric-comparison') == 'Like') {
                    $(s.target).find('.grp-timeline .btn-metric[data-metric-period != "Day"]').removeClass('active').addClass('disabled');
                    $(s.target).find('.grp-timeline .btn-metric[data-metric-period="Day"]').addClass('active');
                } else if ($(this).attr('data-metric-comparison') == 'Consecutive') {
                    $(s.target).find('.grp-timeline .btn-metric[data-metric-period != "Day"]').removeClass('disabled');
                }

                if (!$(this).hasClass('active')) {
                    if ($(this).attr('data-metric-comparison')) {
                        s.metric = {
                            comparison: $(this).data('metric-comparison').trim(),
                            period: $('.grp-timeline .active').data('metric-period').trim(),
                            storeName: window.storeDetail.name
                        }
                    } else {
                        s.metric = {
                            comparison: $('.grp-comparison .active').data('metric-comparison').trim(),
                            period: $(this).data('metric-period').trim(),
                            storeName: window.storeDetail.name
                        }
                    }

                    app['tile-section']._fetchData('getTilesData', s.metric, true);

                }

            })

            this.ajaxInterval = setInterval(function() {
                s.metric.storeName = window.storeDetail.name;
                app['tile-section']._fetchData('getTilesData', s.metric);
            }, 5000);

        },
        refreshData: function() {
            var self = this;
            clearInterval(self.ajaxInterval);
            app['tile-section'].init();

        },
        _fetchData: function(url, metric, showLoader) {
            var self = this;
            var s = this.settings;

            function successCallback(data) {
                if (data.Error) {
                    clearInterval(self.ajaxInterval);
                } else {
                    app['tile-section']._bindTemplate(data, metric);
                }
            }

            function errorCallback(err) {
                clearInterval(self.ajaxInterval);
            }

            app['ajax-wrapper'].sendAjax(url, metric, successCallback, errorCallback, showLoader);

        },
        _bindTemplate: function(data, metric) {
            var response = $.parseJSON(data);
            var opportunityData = response.opportunityData;
            var storefrontData = response.storefrontData;
            var dwellTimeData = response.dwellTimeData;
            var repeatCustomer = response.repeatCustomer;

            $('.section-opportunity').html(this.tile_template({
                'tile-name': 'Outside Opportunity',
                'tile-percent': opportunityData['current'] || 'NA',
                'tile-percent-change': (opportunityData['comparison'] ?
                    app['tile-section']._formatComparisonPercent(opportunityData['comparison'].toFixed(1)) : 'NA') + '%',
                'tile-period-param': 'vs last ' + app['tile-section']._formatPeriodParam(metric)
            }));

            $('.section-storeFront').html(this.tile_template({
                'tile-name': 'Storefront Conversion',
                'tile-percent': (storefrontData['current'] ? storefrontData['current'].toFixed(1) : 'NA') + '%',
                'tile-percent-change': (storefrontData['comparison'] ?
                    app['tile-section']._formatComparisonPercent(storefrontData['comparison'].toFixed(1)) : 'NA') + '%',
                'tile-period-param': 'vs last ' + app['tile-section']._formatPeriodParam(metric)
            }));

            $('.section-dwellTime').html(this.tile_template({
                'tile-name': 'Dwell Time (mm:ss)',
                'tile-percent': dwellTimeData['current'] ? app['tile-section']._formatDwellTime(dwellTimeData['current'].toFixed(0)) : 'NA',
                'tile-percent-change': (dwellTimeData['comparison'] ?
                    app['tile-section']._formatComparisonPercent(dwellTimeData['comparison'].toFixed(1)) : 'NA') + '%',
                'tile-period-param': 'vs last ' + app['tile-section']._formatPeriodParam(metric)
            }));

            $('.section-customers').html(this.tile_repeat_cust({
                'tile-name': 'Repeat Customers',
                'tile-percent': repeatCustomer['current'] ? repeatCustomer['current'].toFixed(1) + '%' : 'NA',
                'tile-percent-change': (repeatCustomer['comparison'] ?
                    app['tile-section']._formatComparisonPercent(repeatCustomer['comparison'].toFixed(1)) : 'NA') + '%',
                'tile-period-param': 'vs last ' + app['tile-section']._formatPeriodParam(metric)
            }));

        },
        _formatPeriodParam: function(metric) {
            if (metric.comparison == 'Like') {
                return Date().split(' ')[0];
            } else {
                return metric.period;
            }
        },
        _formatComparisonPercent: function(data) {
            if (data.indexOf('-') == -1) {
                data = '+' + data;
            }
            return data;
        },
        _formatDwellTime: function(seconds) {
            // var hours = parseInt(seconds / 3600) % 24;
            var minutes = parseInt(seconds / 60) % 60;
            var sec = parseInt(seconds) % 60;

            return (minutes < 10 ? "0" + minutes : minutes) + ":" + (sec < 10 ? "0" + sec : sec);
        }
    }
})(app);
//####js/component/shopper-engagement.js
(function() {
    app['shopper-engagement'] = {
        settings: {
            target: '.mod-shopper-engagement'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#shopper-engagement-chart');

            app['shopper-engagement'].fetchData('getShopperEngagement', chartContainer);


        },
        refreshData: function() {
            var self = this;
            app['shopper-engagement'].init();
        },
        fetchData: function(url, chartContainer) {
            function successCallback(res) {
                var res = $.parseJSON(res);
                var dataObj = {};

                dataObj.currentData = app['shopper-engagement'].reformatData(res.currentMonthArray);
                dataObj.pastData = app['shopper-engagement'].reformatData(res.lastMonthMArray);

                app['shopper-engagement'].renderChart(chartContainer, dataObj);

            }

            function errorCallback(err) {
                console.log('navbar' + err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, {
                storeName: window.storeDetail.name
            }, successCallback, errorCallback)
        },
        reformatData: function(data) {
            var total = data[0] + data[1] + data[2] + data[3];
            var res = [];

            $.each(data, function(i, value) {
                res.push(Math.round((value / total) * 100));
            });

            return res;
        },
        renderChart: function(chartContainer, dataObj) {
            chartContainer.highcharts({
                chart: {
                    type: 'bar',
                    style: {
                        fontFamily: 'Arial'
                    },
                    height: 400
                },
                colors: ['#a6a6a6', '#55c6f2'],
                title: {
                    text: ''
                },
                xAxis: {
                    categories: ['>10 mins', '5-20 mins', '2-5 mins', 'bounced'],
                    title: {
                        text: null
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: ''
                    },
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    gridLineColor: 'transparent',
                    labels: {
                        enabled: false
                    }
                },
                tooltip: {
                    valueSuffix: ' %'
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true,
                            format: '{y}%'
                        }
                    }
                },
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom',
                    margin: 30,
                },
                credits: {
                    enabled: false
                },
                series: [{
                    name: 'Last Month',
                    data: dataObj.pastData
                }, {
                    name: 'This Month',
                    data: dataObj.currentData
                }]
            });
        }
    }
})(app);
//####js/component/shopper-profile.js
(function() {
    app['shopper-profile'] = {
        settings: {
            target: '.mod-shopper-profile'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#shopper-profile-chart');

            app['shopper-profile'].fetchData('getShopperProfile', chartContainer);


        },
        refreshData: function() {
            var self = this;
            app['shopper-profile'].init();
        },
        fetchData: function(url, chartContainer) {
            function successCallback(res) {
                var res = $.parseJSON(res);
                var dataObj = new Array();
                var otherObj = ['Others', 0];

                $.each(res, function(i, v) {
                    if (i < 5) {
                        var itemObj = new Array();
                        itemObj.push(this['s_profile']);
                        itemObj.push(Math.round(this['count(distinct(tv.mac_address))']));
                        dataObj.push(itemObj);
                    } else {
                        otherObj[1] = otherObj[1] + Math.round(this['count(distinct(tv.mac_address))']);
                        if (i == res.length - 1) {
                            dataObj.push(otherObj);
                        }
                    }

                });

                app['shopper-profile'].renderChart(chartContainer, dataObj);

            }

            function errorCallback(err) {
                console.log('navbar' + err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, {
                storeName: window.storeDetail.name,
                filterParamObj: window.filterParamObj
            }, successCallback, errorCallback)
        },
        renderChart: function(chartContainer, dataObj) {
            chartContainer.highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                colors: ['#55c6f2', '#a9d18e', '#f7d348', '#c9c9c9', '#b4c7e7', '#767171'],
                title: {
                    text: ""
                },
                tooltip: {
                    pointFormat: '<b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    },
                    series: {
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                return Math.round(this.percentage) + '%';
                            },
                            distance: -30,
                            color: 'white'
                        }
                    }
                },
                legend: {
                    itemMarginBottom: 10
                },
                series: [{
                    type: 'pie',
                    data: dataObj
                }],
                credits: {
                    enabled: false
                },
            });
        }
    }
})(app);
//####js/component/revisit-frequency.js
(function() {
    app['revisit-frequency'] = {
        settings: {
            target: '.mod-revisit-frequency'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#revisit-frequency-chart');
            app['revisit-frequency'].fetchData('getRevisitFrequency', chartContainer);



        },
        refreshData: function() {
            var self = this;
            app['revisit-frequency'].init();
        },
        fetchData: function(url, chartContainer) {
            function successCallback(res) {
                var res = $.parseJSON(res);
                var dataObj = new Array();

                $.each(res, function(i, v) {
                    var itemObj = new Array();
                    itemObj.push(this['category']);
                    itemObj.push(this['COUNT(mac_address)']);
                    dataObj.push(itemObj);
                });
                app['revisit-frequency'].renderChart(chartContainer, dataObj);

            }

            function errorCallback(err) {
                console.log('navbar' + err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, {
                storeName: window.storeDetail.name,
                filterParamObj: window.filterParamObj
            }, successCallback, errorCallback)
        },
        renderChart: function(chartContainer, dataObj) {
            // Highcharts.setOptions({
            //         colors: ['#00b0f0', '#f7d348', '#92d050', '#0070c0', '#ff6d60', '#7030a0']
            //     });
            chartContainer.highcharts({
                chart: {
                    type: 'pie',
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                colors: ['#b4c7e7', '#0070c0', '#a9d18e', '#55c6f2', '#f7d348', '#767171'],
                title: {
                    text: ''
                },
                yAxis: {
                    title: {
                        text: 'Total percent market share'
                    }
                },
                plotOptions: {
                    pie: {
                        shadow: false
                    },
                    series: {
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                return 'test';
                            },
                            distance: -30,
                            color: 'white'
                        }
                    }
                },
                tooltip: {
                    formatter: function() {
                        return '<b>' + this.point.name + '</b>: ' + this.y ;
                    }
                },
                legend: {
                    enabled: true,
                    layout: 'vertical',
                    align: 'right',
                    width: 200,
                    verticalAlign: 'middle',
                    useHTML: true,
                    itemMarginTop: 10,
                    itemMarginBottom: 10,
                    labelFormatter: function() {
                        return '<div style="text-align: left; width:50px;float:right;">' + this.name + '</div>';
                    }
                },
                series: [{
                    name: 'Revisit Freq.',
                    data: dataObj,
                    size: '100%',
                    innerSize: '60%',
                    showInLegend: true,
                    dataLabels: {
                        enabled: false
                    }
                }],
                credits: {
                    enabled: false
                },
            });
        }
    }
})(app);
//####js/component/cross-store.js
(function() {
    app['cross-store'] = {
        settings: {
            target: '.mod-cross-store'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#cross-store-chart');

            app['cross-store'].fetchData('getCrossVisitData', chartContainer);




        },
        refreshData: function() {
            var self = this;
            app['cross-store'].init();
        },
        fetchData: function(url, chartContainer) {
            function successCallback(res) {
                var res = $.parseJSON(res);
                res = res.crossVisit;
                var dataObj = [{
                    y: 0,
                    color: '#a9d18e'
                }, {
                    y: 0,
                    color: '#55c6f2'
                }];

                $.each(res, function(i, v) {
                    if (i == 'store') {
                        dataObj[0].y = parseFloat(v);
                    } else {
                        dataObj[1].y = parseFloat(v);
                    }

                });
                app['cross-store'].renderChart(chartContainer, dataObj);

            }

            function errorCallback(err) {
                console.log('navbar' + err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, {
                storeName: window.storeDetail.name,
                filterParamObj: window.filterParamObj
            }, successCallback, errorCallback)
        },
        renderChart: function(chartContainer, dataObj) {
            chartContainer.highcharts({
                chart: {
                    type: 'column',
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'Store',
                        'Brand Average'
                    ],
                    crosshair: true
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="padding:0"><b>{point.y:.1f}%</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                series: [{
                    name: 'Cross-store',
                    data: dataObj
                }],
                credits: {
                    enabled: false
                }
            });
        }
    }
})(app);
//####js/component/time-trend.js
(function() {
    app['time-trend'] = {
        settings: {
            target: '.mod-time-trend'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#time-trend-chart');

            app['time-trend'].renderChart(chartContainer);


        },
        refreshData: function() {
            var self = this;
            app['time-trend'].init();
        },
        renderChart: function(chartContainer) {
            chartContainer.highcharts({
                title: {
                    text: '',
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                xAxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                    ]
                },
                yAxis: {
                    title: {
                        text: 'Walk-ins'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                tooltip: {
                    valueSuffix: ''
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    borderWidth: 0
                },
                series: [{
                    name: 'Tokyo',
                    data: [7.0, 6.9, 9.5, 14.5, 22, 11, 21.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                }, {
                    name: 'New York',
                    data: [-0.2, 0.8, 8, 21, 17.0, 20.0, 8, 11.1, 29.1, 14.1, 8.6, 2.5]
                }],
                credits: {
                    enabled: false
                }
            });
        }
    }
})(app);
//####js/component/right-now.js
(function() {
    app['right-now'] = {
        settings: {
            target: '.mod-right-now'
        },
        init: function(context) {
            var s = this.settings;
            var shoppersMall = $(s.target).find('#shoppers-mall-chart');
            var shoppersStore = $(s.target).find('#shoppers-store-chart');

            app['right-now'].fetchData('getRightNowData');

            this.refreshInterval = setInterval(function() {
                app['right-now'].fetchData('getRightNowData');
            }, 5000);



            var shoppersMall_series = [{
                name: 'Discount Sensitive',
                data: [5]
            }, {
                name: 'Utility Buyer',
                data: [2]
            }, {
                name: 'Fashion',
                data: [3]
            }];

            var shoppersStore_series = [{
                name: 'Discount Sensitive',
                data: [2]
            }, {
                name: 'Utility Buyer',
                data: [5]
            }, {
                name: 'Fashion',
                data: [3]
            }]

            app['right-now'].renderChart(shoppersMall, shoppersMall_series);
            app['right-now'].renderChart(shoppersStore, shoppersStore_series);


        },
        refreshData: function() {
            var self = this;
            clearInterval(self.refreshInterval);
            app['right-now'].init();
        },
        fetchData: function(url) {
            var self = this;

            function successCallback(res) {
                if (res.Error) {
                    clearInterval(self.refreshInterval);
                } else {
                    var res = $.parseJSON(res);
                    var dataObj = {};

                    if (res.length) {
                        dataObj.peopleMall = res[0]['cnt'] + res[1]['cnt'];
                        dataObj.peopleStore = res[1]['cnt'];

                        $(self.settings.target).find('.people-mall-count').text(dataObj.peopleMall);
                        $(self.settings.target).find('.people-store-count').text(dataObj.peopleStore);
                    }
                }

            }

            function errorCallback(err) {
                console.log('right-now' + err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, {
                storeName: window.storeDetail.name,
                filterParamObj: window.filterParamObj
            }, successCallback, errorCallback)
        },
        renderChart: function(chartContainer, series) {
            chartContainer.highcharts({
                chart: {
                    type: 'bar',
                    height: 100,
                },
                colors: ['#f7d348', '#55c6f2', '#a9d18e'],
                title: {
                    text: ''
                },
                xAxis: {
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    labels: {
                        enabled: false
                    },
                    minorTickLength: 0,
                    tickLength: 0
                },
                yAxis: {
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    gridLineColor: 'transparent',
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: ''
                    },
                    minorTickLength: 0,
                    tickLength: 0
                },
                legend: {
                    reversed: true,
                    enabled: false
                },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        pointWidth: 50
                    }
                },
                series: series,
                credits: {
                    enabled: false
                }
            });
        }
    }
})(app);
//####js/component/internal-benchmarking.js
(function() {
    app['internal-benchmarking'] = {
        settings: {
            target: '.mod-internal-benchmarking'
        },
        init: function(context) {
            var s = this.settings;

            $('.benchmark-start-date').datepicker({});
            $('.benchmark-end-date').datepicker({});


            var walkins_chart = $(s.target).find('#walkins-chart');
            storeFront_chart = $(s.target).find('#storeFront-chart');
            engagement_chart = $(s.target).find('#engagement-chart');
            dwell_chart = $(s.target).find('#dwell-chart');
            repeatCustomers_chart = $(s.target).find('#repeatCustomers-chart');
            topCustomers_chart = $(s.target).find('#topCustomers-chart');

            categoriesArr = ['Your Store', 'This Mall/Area', 'Stores(same city tier)', 'Stores(All)']

            var chartObj = {
                labelName: 'Walk-ins',
                chartbaseMargin: 20,
                containerName: walkins_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [107, 31, 635, 203]
                }],
                colors: ['#00b0f0']
            }

            var chartObj1 = {
                labelName: 'Storefront conversion',
                chartbaseMargin: 5,
                containerName: storeFront_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [17, 341, 211, 343]
                }],
                colors: ['#f7d348']
            }

            var chartObj2 = {
                labelName: 'Engagement levels',
                chartbaseMargin: 5,
                containerName: engagement_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [99, 77, 665, 63]
                }],
                colors: ['#92d050']
            }

            var chartObj3 = {
                labelName: 'Dwell time',
                chartbaseMargin: 20,
                containerName: dwell_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [107, 31, 635, 203]
                }],
                colors: ['#0070c0']
            }

            var chartObj4 = {
                labelName: 'Repeat customers',
                chartbaseMargin: 5,
                containerName: repeatCustomers_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [107, 31, 635, 203]
                }],
                colors: ['#ff6d60']
            }

            var chartObj5 = {
                labelName: 'Top customers',
                chartbaseMargin: 5,
                containerName: topCustomers_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [107, 31, 635, 203]
                }],
                colors: ['#7030a0']
            }


            app['internal-benchmarking'].renderChart(chartObj), categoriesArr;
            app['internal-benchmarking'].renderChart(chartObj1, categoriesArr);
            app['internal-benchmarking'].renderChart(chartObj2, categoriesArr);
            app['internal-benchmarking'].renderChart(chartObj3, categoriesArr);
            app['internal-benchmarking'].renderChart(chartObj4, categoriesArr);
            app['internal-benchmarking'].renderChart(chartObj5, categoriesArr);


        },
        refreshData: function() {
            var self = this;
            app['internal-benchmarking'].init();
        },
        renderChart: function(chartObj) {
            var chartContainer = chartObj.containerName;

            chartContainer.highcharts({
                chart: {
                    type: 'bar',
                    style: {
                        fontFamily: 'Arial',
                        fontSize: '12px'
                    }
                },
                colors: chartObj.colors,
                title: {
                    text: chartObj.labelName,
                    // floating: true,
                    align: 'left',
                    x: 0,
                    y: 10,
                    margin: chartObj.chartbaseMargin
                },
                xAxis: {
                    categories: categoriesArr,
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    labels: {
                        enabled: false
                    },
                    minorTickLength: 0,
                    tickLength: 0
                },
                yAxis: {
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    gridLineColor: 'transparent',
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: '',
                    },
                    minorTickLength: 0,
                    tickLength: 0
                },
                tooltip: {
                    valueSuffix: ' millions'
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                series: chartObj.dataArr
            });
        }
    }
})(app);
//####js/component/campaign-impact.js
(function() {
    app['campaign-impact'] = {
        settings: {
            target: '.mod-campaign-impact'
        },
        init: function(context) {
            var self = this;
            var s = this.settings;
            var target = $(s.target);
            var edit_btn = target.find('.edit-btn');
            var configure_panel = target.find('.impact-edit');
            var startDate = target.find('.campaign-start-date input');
            var endDate = target.find('.campaign-end-date input');
            var reqObj = {

            }

            configure_panel.addClass('edit-active');

            $('.campaign-start-date').datepicker({
                format: 'yyyy-mm-dd'
            });
            
            $('.campaign-end-date').datepicker({
                format: 'yyyy-mm-dd'
            });

            $(s.target).find('.config-save').off('click').on('click', function() {
                if (startDate.val() && endDate.val()) {
                    reqObj.sDate = "'" + startDate.val() + "'";
                    reqObj.eDate = "'" + endDate.val() + "'";
                    reqObj.storeName = window.storeDetail.name;

                    app['campaign-impact'].fetchData('getCampaignImpact', reqObj);
                    configure_panel.toggleClass('edit-active');
                }
            })

            edit_btn.off('click').on('click', function() {
                configure_panel.toggleClass('edit-active');
            });

            $(s.target).find('.config-cancel').off('click').on('click', function() {
                configure_panel.toggleClass('edit-active');
            })
        },
        refreshData: function() {
            var self = this;
            app['campaign-impact'].init();
        },
        saveForm: function() {

        },
        fetchData: function(url, reqObj) {
            var self = this;

            function successCallback(data) {
                var response = $.parseJSON(data);

                var avgCampaignPeriod = response['campaignData'].cnt / response['campaignData'].DiffDate;
                var avgLastMonth = response['lastMonthData'].cnt / response['lastMonthData'].DiffDate;
                var walk_in = Math.round((avgCampaignPeriod - avgLastMonth) / avgLastMonth * 100);

                var dwtCampaignPeriod = response['campaignData'].dwt;
                var dwtLastMonth = response['lastMonthData'].dwt;
                var dwell_time = Math.round((dwtCampaignPeriod - dwtLastMonth) / dwtLastMonth * 100);

                $('#campaign-walkin span').text(self.formatConversionData(walk_in) + '%');
                $('#campaign-dwt span').text(self.formatConversionData(dwell_time) + '%');

                self.formatImpactChangeColor();
            }

            function errorCallback(err) {
                console.log(err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, reqObj, successCallback, errorCallback)

        },
        formatConversionData: function(value) {
            if (parseInt(value) >= 0) {
                return '+' + value;
            } else {
                return value || 'NA';
            }
        },
        formatImpactChangeColor: function() {
            var valueLabels = $('.mod-campaign-impact .impact-change');
            $.each(valueLabels, function(i, v) {
                if (parseFloat($(this).find('span').text()) >= 0) {
                    $(this).addClass('impact-pos');
                } else {
                    $(this).addClass('impact-neg');
                }
            });
        }
    }
})(app);


// bindTemplate: function(data, template) {
//     var response = $.parseJSON(data);

//     $('.section-opportunity').html(template({
//         'tile-name': 'Data count',
//         'tile-percent': response.length,
//         'tile-percent-change': '',
//         'tile-period-param': 'Count of rows'
//     }));
// }
//####js/component/storefront-impact.js
(function() {
    app['modification-impact'] = {
        settings: {
            target: '.mod-modification-impact'
        },
        init: function(context) {
            var s = this.settings;
            var target = $(s.target);
            var edit_btn = target.find('.edit-btn');
            var configure_panel = target.find('.impact-edit');
            var startDate = target.find('.storefront-start-date input');
            var reqObj = {};

            configure_panel.addClass('edit-active');

            $(s.target).find('.config-save').off('click').on('click', function() {
                if (startDate.val()) {
                    reqObj.sDate = "'" + startDate.val() + "'";
                    reqObj.storeName = window.storeDetail.name;
                    app['modification-impact'].fetchData('getStoreFrontChange', reqObj);
                    configure_panel.toggleClass('edit-active');

                }
            })

            edit_btn.off('click').on('click', function() {
                configure_panel.toggleClass('edit-active');
            });

            $('.storefront-start-date').datepicker({
                format: 'yyyy-mm-dd'
            });

        },
        refreshData: function() {
            var self = this;
            app['modification-impact'].init();
        },
        fetchData: function(url, reqObj) {
            var self = this;

            function successCallback(data) {
                var response = $.parseJSON(data);
                console.log(response);

                $('#sf-conversion-change span').text(self.formatConversionData(response.conversionChange) + '%');
                $('#sf-walk-in span').text(self.formatConversionData(response.walkIn) + '%');
                $('#sf-dwell-time span').text(self.formatConversionData(response.dwellTime) + '%');

                self.formatImpactChangeColor();

            }

            function errorCallback(err) {
                console.log(err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, reqObj, successCallback, errorCallback)

        },
        formatConversionData: function(value) {
            if (parseFloat(value) >= 0) {
                return '+' + value;
            } else {
                return value || 'NA';
            }
        },
        formatImpactChangeColor: function() {
            var valueLabels = $('.mod-modification-impact .impact-change');
            $.each(valueLabels, function(i, v) {
                if (parseFloat($(this).find('span').text()) >= 0) {
                    $(this).addClass('impact-pos');
                } else {
                    $(this).addClass('impact-neg');
                }
            });
        }

    }
})(app);
//####js/component/hour-optimization.js
(function() {
    app['hour-optimization'] = {
        settings: {
            target: '.mod-hour-optimization'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#hour-optimization-chart');

            app['hour-optimization'].fetchData('getHourOptimizationData', chartContainer);


        },
        refreshData: function() {
            var self = this;
            app['hour-optimization'].init();
        },
        fetchData: function(url, chartContainer) {
            function successCallback(res) {
                var res = $.parseJSON(res);
                var dataObj = new Array();

                $.each(res, function(i, v) {
                    dataObj.push(Math.round(this.avg_walk_by));
                });

                app['hour-optimization'].renderChart(chartContainer, dataObj);

            }

            function errorCallback(err) {
                console.log('navbar' + err || 'err');
            }

            app['ajax-wrapper'].sendAjax(url, {
                storeName: window.storeDetail.name,
                filterParamObj: window.filterParamObj
            }, successCallback, errorCallback)
        },
        renderChart: function(chartContainer, dataObj) {
            chartContainer.highcharts({
                chart: {
                    type: 'column',
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        '8.30 a.m',
                        '9.30 a.m',
                        '10.30 a.m',
                        '11.30 a.m',
                        '12.30 p.m',
                        '1.30 p.m',
                        '2.30 p.m',
                        '3.30 p.m',
                        '4.30 p.m',
                        '5.30 p.m',
                        '6.30 p.m',
                        '7.30 p.m',
                        '8.30 p.m',
                        '9.30 p.m',
                        '10.30 p.m'
                    ],
                    crosshair: true,
                    title: {
                        text: null
                    }
                },
                yAxis: {
                    title: {
                        text: null
                    },
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    gridLineColor: 'transparent',
                },
                tooltip: {
                    enabled: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{y}'
                        }
                    }
                },
                series: [{
                    name: 'Outside opportunity',
                    data: dataObj

                }],
                credits: {
                    enabled: false
                }
            });
        }
    }
})(app);