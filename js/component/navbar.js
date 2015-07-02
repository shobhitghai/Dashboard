// (function() {
//     app['navbar'] = {
//         settings: {
//             target: '.mod-navbar'
//         },
//         init: function(context) {
//             var s = this.settings;

//             var storeDropdown = $(s.target).find('.store-dropdown');

//             app['navbar'].fetchData('getStoreDetails', storeDropdown);

//         },
//         fetchData: function(url, storeDropdown) {
//             function successCallback(res) {
//                 var res = $.parseJSON(res);
//                 var dropdownMenu = storeDropdown.find('.dropdown-menu');
//                 var storeSelected = storeDropdown.find('.store-selected .selected-value');

//                 $.each(res, function(i, v) {
//                     dropdownMenu.append('<li><a href="javascript:void(0)">' + this.name + '</a></li>')
//                 });

//                 storeSelected.text(res[0].name);
//                 dropdownMenu.find('li a').on('click', function(e) {
//                     e.preventDefault;
//                     storeSelected.text($(this).text());
//                 })
//             }

//             function errorCallback(err) {
//                 console.log('navbar' + err || 'err');
//             }

//             app['ajax-wrapper'].sendAjax(url, '', successCallback, errorCallback)

//         }
//     }
// })(app);