mainApp.factory('crossfilterFactory', function($q) {

	var cfData = {};

	cfData.getData = function() {
		var deferred = $q.defer();
		d3.csv("http://localhost:8080/op18.csv", function(error, data) {
			if (error) {
				deferred.reject(error);
			}
			deferred.resolve(data);
		});
		return deferred.promise;
	};

	cfData.getDashboardMetaData = function() {
		return [{
				chartId: 'chart2',
				dimension: [{
					name: 'product_category',
					value: 'PRODUCT_CATEGORY'
				}],
				measure: [{
					name: 'invoiced_amount',
					value: 'INVOICED_AMOUNT'
				}],
				chartType: 'groupedColumn'
			}, {
				chartId: 'chart1',
				dimension: [{
					name: 'supplier_name',
					value: 'SUPPLIER_NAME'
				}],
				measure: [{
					name: 'invoiced_amount',
					value: 'INVOICED_AMOUNT'
				}],
				chartType: 'groupedColumn'
			}
			/*, {
				chartId: 'chart3',
				dimension: [{
					name: 'quarter',
					value: 'FISCAL_QUARTER'
				}, {
					name: 'IsPreferredSupplier',
					value: 'IS_PREFERRED_SUPPLIER'
				}],
				measure: [{
					name: 'invoiced_amount',
					value: 'INVOICED_AMOUNT'
				}],
				chartType: 'groupedColumn'
			}*/
			, {
				chartId: 'chart4',
				dimension: [{
					name: 'channel_type',
					value: 'CHANNEL'
				}],
				measure: [{
					name: 'invoiced_amount',
					value: 'INVOICED_AMOUNT'
				}],
				chartType: 'pie'
			}, {
				chartId: 'chart5',
				dimension: [{
					name: 'IsCatalog',
					value: 'IS_CATALOG'
				}],
				measure: [{
					name: 'invoiced_amount',
					value: 'INVOICED_AMOUNT'
				}],
				chartType: 'pie'
			}
		];

	}
	return cfData;
})