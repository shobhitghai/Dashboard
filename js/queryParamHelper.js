var queryParamHelper = function() {
    this._getQueryParam = function(param, tableName, tableNameExp) {
        var queryObj = {
            storeId: '',
            city: '',
            brandId: ''
        }
        var query = '';
        var tableNameExp = tableNameExp || '.';

        if (param && param.storeId) {
            var storeIdPlaceholder = tableName ? ' ' + tableName + tableNameExp + 'store_id in (' : ' store_id in (';
            var storeIdText = '';
            for (var i = 0; i < param.storeId.length; i++) {
                storeIdText = storeIdText + "'" + param.storeId[i] + "'" + ",";
            }
            storeIdText = storeIdText.slice(0, -1);
            storeIdPlaceholder = storeIdPlaceholder + storeIdText + ')';
            queryObj.storeId = storeIdPlaceholder;
        }

        if (param && param.city) {
            var cityPlaceholder = tableName ? ' ' + tableName + tableNameExp + 'city in (' : ' city in (';
            var cityText = '';
            for (var i = 0; i < param.city.length; i++) {
                cityText = cityText + "'" + param.city[i] + "'" + ",";
            }
            cityText = cityText.slice(0, -1);
            cityPlaceholder = cityPlaceholder + cityText + ')';
            queryObj.city = cityPlaceholder;
        }

        if (param && param.brandId) {
            var brandPlaceholder = tableName ? ' ' + tableName + tableNameExp + 'brand_id in (' : ' brand_id in (';
            var brandText = '';
            for (var i = 0; i < param.brandId.length; i++) {
                brandText = brandText + "'" + param.brandId[i] + "'" + ",";
            }
            brandText = brandText.slice(0, -1);
            brandPlaceholder = brandPlaceholder + brandText + ')';
            queryObj.brandId = brandPlaceholder;
        }

        if (queryObj.city != '') {
            query = query + queryObj.city + ' and ';
        }

        if (queryObj.storeId != '') {
            query = query + queryObj.storeId + ' and ';
        }

        if (queryObj.brandId != '') {
            query = query + queryObj.brandId + ' and '
        }

        query = query.slice(0, -4);

        return query;
    }
}

queryParamHelper.prototype.getQueryParam = function(param, tableName, tableNameExp) {
	return this._getQueryParam(param, tableName, tableNameExp);
};

module.exports = new queryParamHelper();