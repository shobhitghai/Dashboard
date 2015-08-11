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
        fetchData: function(isFilter, obj, bindFilterValue, item) {
            var self = this;

            function successCallback(res) {
                var res = $.parseJSON(res);

                if (isFilter) {
                    self.filterSelectionResponse = res;

                    if (bindFilterValue) {
                        bindFilterValue(self.filterSelectionResponse);
                    }

                    if (!self.filterSelectionResponse.length) {
                        item.click();
                    }
                } else {
                    self.response = res;
                    $(self.settings.target).find('.lbjs').remove();
                    $(self.settings.target).find('.modal-body select option').remove();
                    app['filter-panel'].renderList(res, '');
                    app['filter-panel'].filterListSelection();
                }

            }

            function errorCallback(err) {
                console.log(err);
            }

            $.ajax({
                url: hostUrl + 'getStoreDetails',
                data: {
                    id: uId,
                    filterParamObj: obj ? obj : ''
                },
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

                var selection = $(s.target).find('.lbjs-item[selected=selected]');

                if (selection.length) {

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

                    var brandObjArr = [];

                    $.each(self.filterSelectionResponse, function(i,v){
                        brandObjArr.push(this['brand_id']);
                    });

                    window.brandObj.brandId = brandObjArr.getUnique();

                } else {
                    window.filterParamObj.storeId = window.defaultFilterParam;
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
                app['filter-panel'].filterListSelection();
                // app['filter-panel'].filterListSelection(self.response);
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
        filterListSelection: function() {
            var s = this.settings;
            var self = this;
            var $panel = $(s.target);
            var obj = new Array();

            $panel.find('.lbjs-item').on('click', function() {

                var selectedCityArr = [];
                var selectedStoreArr = [];
                var selectedBrandArr = [];

                var selection = $(s.target).find('.lbjs-item[selected=selected]');


                $.each(selection, function(i, v) {
                    if ($(this).data('list-type') == 'city') {
                        selectedCityArr.push($(this).text());
                    } else if ($(this).data('list-type') == 'name') {
                        selectedStoreArr.push(app['filter-panel'].getStoreId($(this).text()));
                    } else if ($(this).data('list-type') == 'brand_name') {
                        selectedBrandArr.push(app['filter-panel'].getBrandId($(this).text()));
                    }
                });

                var filterParamObj = {
                    storeId: selectedStoreArr,
                    city: selectedCityArr,
                    brandId: selectedBrandArr
                }

                // console.log(filterParamObj)

                app['filter-panel'].fetchData(true, filterParamObj, app['filter-panel'].bindFilterValue, $(this));



                // if ($panel.find('.lbjs-item[selected = selected]').length >= 1) {

                //     if (!($(this).attr('disabled') == 'disabled')) {
                //         var self = this;

                //         // $(self).attr('data-selected', true);

                //         if ($(self).attr('selected')) {
                //             $(self).attr('data-selected', true);
                //             // $(self).attr('data-disabled', false);
                //         } else {
                //             $(self).attr('data-selected', false);
                //         }

                //         var type = $(self).attr('data-list-Type');
                //         var value = $(self).text();

                //         $.each(res, function(i, v) {
                //             if (this[type] === value) {
                //                 if ($(self).attr('selected')) {
                //                     obj.push(this);
                //                 } else {
                //                     obj.pop(this);
                //                 }
                //             }
                //         })

                //         console.log(obj, type);
                //         app['filter-panel'].enableDisableListSelection(obj, type, value);
                //         // obj = [];
                //     }
                // } else {
                //     $.each($(s.target).find('.lbjs-item'), function(i, v) {
                //         $(this).attr('disabled', false);
                //     });

                // }


            });
        },
        bindFilterValue: function(res) {
            var self = this;
            var tempStore = [];
            var tempBrand = [];
            var tempCity = [];


            $.each(res, function(i, v) {
                tempStore.push(this['name']);
                tempBrand.push(this['brand_name']);
                tempCity.push(this['city']);
            })

            $('.lbjs-item').addClass('fade-out');


            $.each($('div[data-list-type = city]'), function(i, v) {
                if (tempCity.indexOf($(this).text()) > -1) {
                    $(this).removeClass('fade-out');
                } else {
                    $(this).removeAttr('selected');
                }
            });

            $.each($('div[data-list-type = name]'), function(i, v) {
                if (tempStore.indexOf($(this).text()) > -1) {
                    $(this).removeClass('fade-out');
                } else {
                    $(this).removeAttr('selected');

                }
            });

            $.each($('div[data-list-type = brand_name]'), function(i, v) {
                if (tempBrand.indexOf($(this).text()) > -1) {
                    $(this).removeClass('fade-out');
                } else {
                    $(this).removeAttr('selected');

                }
            });




        },
        enableDisableListSelection: function(obj, type, value) {
            var s = this.settings;

            obj = obj.uniqueObjects(["brand_id", "brand_name", "city", "name", "store_id"])
            console.log(obj)

            function disableItem(key) {
                $.each($(s.target).find('.lbjs-item[data-list-type =' + key + ']'), function(i, v) {
                    var self = this;

                    $(self).attr('disabled', true);

                    $.each(obj, function(ind, val) {
                        if ($(self).text() === this[key]) {
                            // $(self).attr('data-disabled', false);
                            $(self).attr('disabled', false);
                            // $(self).attr('selected', true);
                            // $(self).attr('data-selected', true);
                        } else {
                            $(self).attr('data-selected', false);
                            $(self).attr('selected', false);
                        }
                    })
                })
            }

            if (type == 'city') {
                disableItem('name');
                disableItem('brand_name');
            }

            if (type == 'name') {
                disableItem('city');
                disableItem('brand_name');
            }

            if (type == 'brand_name') {
                disableItem('city');
                disableItem('name');
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




(function() {
    app['filter-panel-time-trend'] = {
        settings: {
            target: '.mod-filter-panel-time-trend'
        },
        init: function(context) {
            var s = this.settings;
            app['filter-panel-time-trend'].fetchData();
            app['filter-panel-time-trend'].selectionHandler();

        },
        fetchData: function(isFilter, obj, bindFilterValue, item) {
            var self = this;

            function successCallback(res) {
                var res = $.parseJSON(res);

                if (isFilter) {
                    self.filterSelectionResponse = res;

                    if (bindFilterValue) {
                        bindFilterValue(self.filterSelectionResponse);
                    }

                    if (!self.filterSelectionResponse.length) {
                        item.click();
                    }
                } else {
                    self.response = res;
                    $(self.settings.target).find('.lbjs').remove();
                    $(self.settings.target).find('.modal-body select option').remove();
                    app['filter-panel-time-trend'].renderList(res, '');
                    app['filter-panel-time-trend'].filterListSelection();
                }

            }

            function errorCallback(err) {
                console.log(err);
            }

            $.ajax({
                url: hostUrl + 'getStoreDetails',
                data: {
                    id: uId,
                    filterParamObj: obj ? obj : ''
                },
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
                app['filter-panel-time-trend'].appendList(cityArray, cityContainer, 'city', 'by city');

            if (listType != 'name')
                app['filter-panel-time-trend'].appendList(storeArray, storeContainer, 'name', 'by store');

            if (listType != 'brand_name')
                app['filter-panel-time-trend'].appendList(brandArray, brandContainer, 'brand_name', 'by brand');

        },
        selectionHandler: function() {
            var self = this;
            var s = this.settings;
            var panel = $(s.target);

            panel.find('.btn-filter').on('click', function() {
                var selectedCityArr = [];
                var selectedStoreArr = [];
                var selectedBrandArr = [];

                var selection = $(s.target).find('.lbjs-item[selected=selected]');

                if (selection.length) {

                    $.each(selection, function(i, v) {
                        if ($(this).data('list-type') == 'city') {
                            selectedCityArr.push($(this).text());
                        } else if ($(this).data('list-type') == 'name') {
                            selectedStoreArr.push(app['filter-panel-time-trend'].getStoreId($(this).text()));
                        } else if ($(this).data('list-type') == 'brand_name') {
                            selectedBrandArr.push(app['filter-panel-time-trend'].getBrandId($(this).text()));
                        }
                    });

                    window.trendSectionObj = {
                        storeId: selectedStoreArr,
                        city: selectedCityArr,
                        brandId: selectedBrandArr
                    }
                } else {
                    window.trendSectionObj = null;
                }

                app['time-trend'].init(true);


                // console.log(app['filter-panel'].getStoreId('Linking Road Store'));
            });

            panel.find('.btn-reset-filter').on('click', function() {
                panel.find('.lbjs').remove();
                panel.find('.modal-body select option').remove();
                app['filter-panel-time-trend'].renderList(self.response, '');
                app['filter-panel-time-trend'].filterListSelection();
                // app['filter-panel'].filterListSelection(self.response);
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
        filterListSelection: function() {
            var s = this.settings;
            var self = this;
            var $panel = $(s.target);
            var obj = new Array();

            $panel.find('.lbjs-item').on('click', function() {

                var selectedCityArr = [];
                var selectedStoreArr = [];
                var selectedBrandArr = [];

                var selection = $(s.target).find('.lbjs-item[selected=selected]');


                $.each(selection, function(i, v) {
                    if ($(this).data('list-type') == 'city') {
                        selectedCityArr.push($(this).text());
                    } else if ($(this).data('list-type') == 'name') {
                        selectedStoreArr.push(app['filter-panel-time-trend'].getStoreId($(this).text()));
                    } else if ($(this).data('list-type') == 'brand_name') {
                        selectedBrandArr.push(app['filter-panel-time-trend'].getBrandId($(this).text()));
                    }
                });

                var filterParamObj = {
                    storeId: selectedStoreArr,
                    city: selectedCityArr,
                    brandId: selectedBrandArr
                }

                // console.log(filterParamObj)

                app['filter-panel-time-trend'].fetchData(true, filterParamObj, app['filter-panel-time-trend'].bindFilterValue, $(this));



                // if ($panel.find('.lbjs-item[selected = selected]').length >= 1) {

                //     if (!($(this).attr('disabled') == 'disabled')) {
                //         var self = this;

                //         // $(self).attr('data-selected', true);

                //         if ($(self).attr('selected')) {
                //             $(self).attr('data-selected', true);
                //             // $(self).attr('data-disabled', false);
                //         } else {
                //             $(self).attr('data-selected', false);
                //         }

                //         var type = $(self).attr('data-list-Type');
                //         var value = $(self).text();

                //         $.each(res, function(i, v) {
                //             if (this[type] === value) {
                //                 if ($(self).attr('selected')) {
                //                     obj.push(this);
                //                 } else {
                //                     obj.pop(this);
                //                 }
                //             }
                //         })

                //         console.log(obj, type);
                //         app['filter-panel'].enableDisableListSelection(obj, type, value);
                //         // obj = [];
                //     }
                // } else {
                //     $.each($(s.target).find('.lbjs-item'), function(i, v) {
                //         $(this).attr('disabled', false);
                //     });

                // }


            });
        },
        bindFilterValue: function(res) {
            var self = this;
            var tempStore = [];
            var tempBrand = [];
            var tempCity = [];


            $.each(res, function(i, v) {
                tempStore.push(this['name']);
                tempBrand.push(this['brand_name']);
                tempCity.push(this['city']);
            })

            $('.lbjs-item').addClass('fade-out');


            $.each($('div[data-list-type = city]'), function(i, v) {
                if (tempCity.indexOf($(this).text()) > -1) {
                    $(this).removeClass('fade-out');
                } else {
                    $(this).removeAttr('selected');
                }
            });

            $.each($('div[data-list-type = name]'), function(i, v) {
                if (tempStore.indexOf($(this).text()) > -1) {
                    $(this).removeClass('fade-out');
                } else {
                    $(this).removeAttr('selected');

                }
            });

            $.each($('div[data-list-type = brand_name]'), function(i, v) {
                if (tempBrand.indexOf($(this).text()) > -1) {
                    $(this).removeClass('fade-out');
                } else {
                    $(this).removeAttr('selected');

                }
            });




        },
        enableDisableListSelection: function(obj, type, value) {
            var s = this.settings;

            obj = obj.uniqueObjects(["brand_id", "brand_name", "city", "name", "store_id"])
            console.log(obj)

            function disableItem(key) {
                $.each($(s.target).find('.lbjs-item[data-list-type =' + key + ']'), function(i, v) {
                    var self = this;

                    $(self).attr('disabled', true);

                    $.each(obj, function(ind, val) {
                        if ($(self).text() === this[key]) {
                            // $(self).attr('data-disabled', false);
                            $(self).attr('disabled', false);
                            // $(self).attr('selected', true);
                            // $(self).attr('data-selected', true);
                        } else {
                            $(self).attr('data-selected', false);
                            $(self).attr('selected', false);
                        }
                    })
                })
            }

            if (type == 'city') {
                disableItem('name');
                disableItem('brand_name');
            }

            if (type == 'name') {
                disableItem('city');
                disableItem('brand_name');
            }

            if (type == 'brand_name') {
                disableItem('city');
                disableItem('name');
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