(function() {
    app['filter-panel'] = {
        settings: {
            target: '.mod-filter-panel'
        },
        init: function(context) {
            var s = this.settings;
            app['filter-panel'].fetchData();

        },
        fetchData: function(url, storeDropdown) {

            function successCallback(res) {
                var res = $.parseJSON(res);
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
                var self = this;
                if ($(self).attr('selected')) {
                    $(self).attr('data-selected', true);
                    $(self).attr('data-disabled', false);
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
            });
        },
        enableDisableListSelection: function(obj, type) {
            function disbaleItem(key) {
                $.each($('.lbjs-item[data-list-type =' + key + ']'), function(i, v) {
                    var self = this;
                    // if (!$(self).attr('data-selected')) {
                    $(self).attr('data-disabled', true);
                    // }

                    $.each(obj, function(ind, val) {
                        if ($(self).text() === this[key]) {
                            $(self).attr('data-disabled', false);
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
        }
    }
})(app);