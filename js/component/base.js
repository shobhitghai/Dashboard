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
        var dropdownMenu = storeDropdown.find('.dropdown-menu');
        var storeSelected = storeDropdown.find('.store-selected .selected-value');

        $.each(res, function(i, v) {
            var id = '10000' + (i+1);
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