mainApp.controller('crossFilterController', function($scope, crossfilterFactory) {
  $scope.optionsList = [{
    value: "1",
    option: "option1"
  }, {
    value: "2",
    option: "option2"
  }, {
    value: "3",
    option: "option3"
  }, {
    value: "4",
    option: "option4"
  }, {
    value: "5",
    option: "option5"
  }, {
    value: "6",
    option: "option6"
  }];

  $scope.selectedOption = "";

  var getUnique = function(arr) {
    var u = {},
      a = [];
    for (var i = 0, l = arr.length; i < l; ++i) {
      if (u.hasOwnProperty(arr[i])) {
        continue;
      }
      a.push(arr[i]);
      u[arr[i]] = 1;
    }
    return a;
  }

  document.body.addEventListener('brushDragEnd', function(d) {
    var chart = $scope.dashboardMetadata.filter(function(e) {
      return e.chartId === d.data.chart.renderContainerId;
    });
    var dimension = chart[0].dimension.length > 1 ? chart[0].cfDimensions[0] : chart[0].cfDimension

    if (d.data.data.length > 0) {
      //console.log(dimension)
      dimension.filterAll();
      dimension.filter(d.data.data);
    } else
      dimension.filterAll();

    drawChart($scope.dashboardMetadata, d.data.chart.renderContainerId);
  });

  function filterChart(e) {
    var filter = e.target.__data__.categoryValue;
    var containerId = $(e.target).closest('div').attr('id');

    var chart = $scope.dashboardMetadata.filter(function(e) {
      return e.chartId === containerId;
    });

    var dimension = chart[0].cfDimension;
    dimension.filterAll();
    dimension.filterExact(filter);

    drawChart($scope.dashboardMetadata, containerId);

  }


  function removeFilterChart(e) {
    var containerId = $(e.target).closest('div').attr('id');

    var chart = $scope.dashboardMetadata.filter(function(e) {
      return e.chartId === containerId;
    });

    var dimension = chart[0].cfDimension;

    dimension.filterAll();

    drawChart($scope.dashboardMetadata, containerId);
  }


  var dataPreparation = function(chart) {
    if (chart.dimension.length > 1) {
      var measures = chart.dimensionGroup[1].top(Infinity).map(function(d) {
        return d.key;
      });
      chart.cfMeasureGroup_0.top(Infinity).forEach(function(d) {
        d.dim0 = d.key.split('|')[0];
        d.dim1 = d.key.split('|')[1];
      });

      //sort cfMeasureGroup_0


      var series = [];
      measures.forEach(function(d) {
        var data = chart.cfMeasureGroup_0.top(Infinity)
          .filter(function(e) {
            return e.dim1 === d
          })
          .map(function(e) {
            return e.value
          });

        series.push({
          name: d,
          longName: d,
          value: d,
          data: data,
          fmtData: data
        });
      })

      var category = [];
      getUnique(chart.cfMeasureGroup_0.top(Infinity).map(function(d) {
        return d.dim0;
      })).forEach(function(d) {
        category.push({
          dimName: chart.dimension[0].name,
          name: d,
          value: d,
          longName: d
        })
      });

      return {
        categories: category,
        series: series
      };

    } else {
      var seriesData = [];
      var category = [];
      chart.cfMeasureGroup_0.top(Infinity).forEach(function(d) {
        if (isNaN(d.value))
          d.value = 0;

        seriesData.push(d.value);
        category.push({
          dimName: chart.dimension[0].name,
          name: d.key,
          value: d.key,
          longName: d.key
        });
      });

      return {
        categories: category,
        series: [{
          name: chart.measure[0].name,
          value: chart.measure[0].value,
          longName: chart.measure[0].name,
          data: seriesData,
          fmtData: seriesData
        }]
      };
    }
  }

  var drawChart = function(charts, filteredChart) {
    //Draw all the charts except filteredchart
    //filteredChart 'undefined' for initial rendering
    charts.forEach(function(d) {
      if (!d.chart) {
        d.chart = new xChart.chart(d.chartId);
        d.chart.setOptions({
          chartType: d.chartType,
          brush: true
        });
        d.chart.addEventHandler('click', 'dataitems', function(event) {
          filterChart(event);
        }, false);
        d.chart.addEventHandler('click', '#' + d.chartId + '_svg', function(event) {
          if (event.target.className.baseVal.indexOf('bar') === -1 && event.target.className.baseVal.indexOf('pie') === -1)
            removeFilterChart(event);
        }, false);
      }
      if (filteredChart !== d.chartId)
        d.chart.render(dataPreparation(d));
    });
  }

  $scope.dashboardMetadata = crossfilterFactory.getDashboardMetaData();

  crossfilterFactory.getData().then(function(response) {
    $scope.cf = crossfilter(response);

    $scope.dashboardMetadata.forEach(function(d) {
      if (d.dimension.length > 1) {
        if (d.measure.length > 1) {
          console.log('Unsupported multiple dimensions and measures')
        } else {
          d.cfMultiDimension = $scope.cf.dimension(function(e) {
            return e[d.dimension[0].value] + '|' + e[d.dimension[1].value];
          });

          d["cfMeasureGroup_" + 0] = d.cfMultiDimension.group().reduceSum(function(e) {
            return e[d.measure[0].value];
          });

          d.dimensionGroup = [];
          d.cfDimensions = [];
          d.dimension.forEach(function(e, j) {
            d.cfDimensions.push($scope.cf.dimension(function(f) {
              return f[e.value];
            }));
            d.dimensionGroup.push(d.cfDimensions[j].group().reduceSum(function(f) {
              return f[d.measure[0].value];
            }));
          })
        }
      } else {
        d.cfDimension = $scope.cf.dimension(function(e) {
          return e[d.dimension[0].value];
        });
        d.measure.forEach(function(e, j) {
          d["cfMeasureGroup_" + j] = d.cfDimension.group().reduceSum(function(f) {
            return f[e.value];
          });
        });
      }
    });

    drawChart($scope.dashboardMetadata, null);

  });

});