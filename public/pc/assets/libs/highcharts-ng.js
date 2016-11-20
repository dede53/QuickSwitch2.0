<<<<<<< HEAD
/**
 * highcharts-ng
 * @version v0.0.12 - 2016-08-07
 * @link https://github.com/pablojim/highcharts-ng
 * @author Barry Fitzgerald <>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
"undefined"!=typeof module&&"undefined"!=typeof exports&&module.exports===exports&&(module.exports="highcharts-ng"),function(){"use strict";function a(a,b,c){void 0===c&&(c=0),c<0&&(c+=a.length),c<0&&(c=0);for(var d=a.length;c<d;c++)if(c in a&&a[c]===b)return c;return-1}function b(a,b,c){var d=a[b];a[b]=function(){var a=Array.prototype.slice.call(arguments);return c.apply(this,a),d?d.apply(this,a):void 0}}function c(a,b){if(angular.isArray(b)){a=angular.isArray(a)?a:[];for(var d=0;d<b.length;d++)a[d]=c(a[d]||{},b[d])}else if(angular.isObject(b)){a=angular.isObject(a)?a:{};for(var e in b)a[e]=c(a[e]||{},b[e])}else a=b;return a}function d(a,b){function c(){return d}var d=a.when(b.Highcharts);return{getHighcharts:c,ready:function(a,b){c().then(function(){a.call(b)})}}}function e(d,e){function f(b,c,d,f){var g={},h=!1,k=function(b,d){var e,f=[];if(b){var j=i(b);if(j&&!c.disableDataWatch)return!1;if(angular.forEach(b,function(a,b){f.push(a.id);var c=h.get(a.id);if(c)if(angular.equals(g[a.id],o(a)))if(void 0!==a.visible&&c.visible!==a.visible&&c.setVisible(a.visible,!1),b<d.length){var e=d[b],i=angular.copy(e),j=a.data[a.data.length-1];i.data.push(j),angular.equals(i,a)?c.addPoint(j,!1):(i.data.shift(),angular.equals(i,a)?c.addPoint(j,!1,!0):c.setData(angular.copy(a.data),!1))}else c.setData(angular.copy(a.data),!1);else c.update(angular.copy(a),!1);else h.addSeries(angular.copy(a),!1);g[a.id]=o(a)}),c.config.noData){var k=!1;for(e=0;e<b.length;e++)if(b[e].data&&b[e].data.length>0){k=!0;break}k?h.hideLoading():h.showLoading(c.config.noData)}}for(e=h.series.length-1;e>=0;e--){var l=h.series[e];"highcharts-navigator-series"!==l.options.id&&a(f,l.options.id)<0&&l.remove(!1)}return!0},q=function(){h&&h.destroy(),g={};var a=c.config||{},e=l(c,d,a),f=a.func||void 0,i=p(c);h=new b[i](e,f);for(var k=0;k<j.length;k++)a[j[k]]&&n(h,a[j[k]],j[k]);a.loading&&h.showLoading(),a.getHighcharts=function(){return h}};q(),c.disableDataWatch?c.$watchCollection("config.series",function(a,b){k(a),h.redraw()}):c.$watch("config.series",function(a,b){var c=k(a,b);c&&h.redraw()},!0),c.$watch("config.title",function(a){h.setTitle(a,!0)},!0),c.$watch("config.subtitle",function(a){h.setTitle(!0,a)},!0),c.$watch("config.loading",function(a){a?h.showLoading(a===!0?null:a):h.hideLoading()}),c.$watch("config.noData",function(a){c.config&&c.config.loading&&h.showLoading(a)},!0),c.$watch("config.credits.enabled",function(a){a?h.credits.show():h.credits&&h.credits.hide()}),c.$watch(p,function(a,b){a!==b&&q()}),angular.forEach(j,function(a){c.$watch("config."+a,function(b){if(b){if(angular.isArray(b))for(var c=0;c<b.length;c++){var d=b[c];c<h[a].length&&(h[a][c].update(d,!1),m(h[a][c],angular.copy(d)))}else h[a][0].update(b,!1),m(h[a][0],angular.copy(b));h.redraw()}},!0)}),c.$watch("config.options",function(a,b,c){a!==b&&(q(),k(c.config.series),h.redraw())},!0),c.$watch("config.size",function(a,b){a!==b&&a&&h.setSize(a.width||h.chartWidth,a.height||h.chartHeight)},!0),c.$on("highchartsng.reflow",function(){h.reflow()}),c.$on("$destroy",function(){if(h){try{h.destroy()}catch(a){}e(function(){d.remove()},0)}})}function g(a,b,c){function e(d){f(Highcharts,a,b,c)}d.getHighcharts().then(e)}var h=0,i=function(a){var b=!1;return angular.forEach(a,function(a){angular.isDefined(a.id)||(a.id="series-"+h++,b=!0)}),b},j=["xAxis","yAxis"],k={stock:"StockChart",map:"Map",chart:"Chart"},l=function(a,d,f){var g={},h={chart:{events:{}},title:{},subtitle:{},series:[],credits:{},plotOptions:{},navigator:{enabled:!1},xAxis:{events:{}},yAxis:{events:{}}};return g=f.options?c(h,f.options):h,g.chart.renderTo=d[0],angular.forEach(j,function(d){angular.isDefined(f[d])&&(g[d]=c(g[d]||{},f[d]),(angular.isDefined(f[d].currentMin)||angular.isDefined(f[d].currentMax))&&(b(g.chart.events,"selection",function(b){var c=this;b[d]?a.$apply(function(){a.config[d].currentMin=b[d][0].min,a.config[d].currentMax=b[d][0].max}):a.$apply(function(){a.config[d].currentMin=c[d][0].dataMin,a.config[d].currentMax=c[d][0].dataMax})}),b(g.chart.events,"addSeries",function(b){a.config[d].currentMin=this[d][0].min||a.config[d].currentMin,a.config[d].currentMax=this[d][0].max||a.config[d].currentMax}),b(g[d].events,"setExtremes",function(b){b.trigger&&"zoom"!==b.trigger&&e(function(){a.config[d].currentMin=b.min,a.config[d].currentMax=b.max,a.config[d].min=b.min,a.config[d].max=b.max},0)})))}),f.title&&(g.title=f.title),f.subtitle&&(g.subtitle=f.subtitle),f.credits&&(g.credits=f.credits),f.size&&(f.size.width&&(g.chart.width=f.size.width),f.size.height&&(g.chart.height=f.size.height)),g},m=function(a,b){var c=a.getExtremes();b.currentMin===c.dataMin&&b.currentMax===c.dataMax||(a.setExtremes?a.setExtremes(b.currentMin,b.currentMax,!1):a.detachedsetExtremes(b.currentMin,b.currentMax,!1))},n=function(a,b,c){(b.currentMin||b.currentMax)&&a[c][0].setExtremes(b.currentMin,b.currentMax,!0)},o=function(a){return angular.extend(c({},a),{data:null,visible:null})},p=function(a){return void 0===a.config?"Chart":k[(""+a.config.chartType).toLowerCase()]||(a.config.useHighStocks?"StockChart":"Chart")};return{restrict:"EAC",replace:!0,template:"<div></div>",scope:{config:"=",disableDataWatch:"="},link:g}}angular.module("highcharts-ng",[]).factory("highchartsNG",["$q","$window",d]).directive("highchart",["highchartsNG","$timeout",e])}();
=======
if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports){
  module.exports = 'highcharts-ng';
}
(function () {
  'use strict';
  /*global angular: false, Highcharts: false */

  angular.module('highcharts-ng', [])
    .factory('highchartsNGUtils', highchartsNGUtils)
    .directive('highchart', ['highchartsNGUtils', '$timeout', highchart]);

  function highchartsNGUtils() {

    return {

      //IE8 support
      indexOf: function (arr, find, i /*opt*/) {
        if (i === undefined) i = 0;
        if (i < 0) i += arr.length;
        if (i < 0) i = 0;
        for (var n = arr.length; i < n; i++)
          if (i in arr && arr[i] === find)
            return i;
        return -1;
      },

      prependMethod: function (obj, method, func) {
        var original = obj[method];
        obj[method] = function () {
          var args = Array.prototype.slice.call(arguments);
          func.apply(this, args);
          if (original) {
            return original.apply(this, args);
          } else {
            return;
          }

        };
      },

      deepExtend: function deepExtend(destination, source) {
        //Slightly strange behaviour in edge cases (e.g. passing in non objects)
        //But does the job for current use cases.
        if (angular.isArray(source)) {
          destination = angular.isArray(destination) ? destination : [];
          for (var i = 0; i < source.length; i++) {
            destination[i] = deepExtend(destination[i] || {}, source[i]);
          }
        } else if (angular.isObject(source)) {
          for (var property in source) {
            destination[property] = deepExtend(destination[property] || {}, source[property]);
          }
        } else {
          destination = source;
        }
        return destination;
      }
    };
  }

  function highchart(highchartsNGUtils, $timeout) {

    // acceptable shared state
    var seriesId = 0;
    var ensureIds = function (series) {
      var changed = false;
      angular.forEach(series, function(s) {
        if (!angular.isDefined(s.id)) {
          s.id = 'series-' + seriesId++;
          changed = true;
        }
      });
      return changed;
    };

    // immutable
    var axisNames = [ 'xAxis', 'yAxis' ];
    var chartTypeMap = {
      'stock': 'StockChart',
      'map':   'Map',
      'chart': 'Chart'
    };

    var getMergedOptions = function (scope, element, config) {
      var mergedOptions = {};

      var defaultOptions = {
        chart: {
          events: {}
        },
        title: {},
        subtitle: {},
        series: [],
        credits: {},
        plotOptions: {},
        navigator: {enabled: false}
      };

      if (config.options) {
        mergedOptions = highchartsNGUtils.deepExtend(defaultOptions, config.options);
      } else {
        mergedOptions = defaultOptions;
      }
      mergedOptions.chart.renderTo = element[0];

      angular.forEach(axisNames, function(axisName) {
        if(angular.isDefined(config[axisName])) {
          mergedOptions[axisName] = angular.copy(config[axisName]);

          if(angular.isDefined(config[axisName].currentMin) ||
              angular.isDefined(config[axisName].currentMax)) {

            highchartsNGUtils.prependMethod(mergedOptions.chart.events, 'selection', function(e){
              var thisChart = this;
              if (e[axisName]) {
                scope.$apply(function () {
                  scope.config[axisName].currentMin = e[axisName][0].min;
                  scope.config[axisName].currentMax = e[axisName][0].max;
                });
              } else {
                //handle reset button - zoom out to all
                scope.$apply(function () {
                  scope.config[axisName].currentMin = thisChart[axisName][0].dataMin;
                  scope.config[axisName].currentMax = thisChart[axisName][0].dataMax;
                });
              }
            });

            highchartsNGUtils.prependMethod(mergedOptions.chart.events, 'addSeries', function(e){
              scope.config[axisName].currentMin = this[axisName][0].min || scope.config[axisName].currentMin;
              scope.config[axisName].currentMax = this[axisName][0].max || scope.config[axisName].currentMax;
            });
          }
        }
      });

      if(config.title) {
        mergedOptions.title = config.title;
      }
      if (config.subtitle) {
        mergedOptions.subtitle = config.subtitle;
      }
      if (config.credits) {
        mergedOptions.credits = config.credits;
      }
      if(config.size) {
        if (config.size.width) {
          mergedOptions.chart.width = config.size.width;
        }
        if (config.size.height) {
          mergedOptions.chart.height = config.size.height;
        }
      }
      return mergedOptions;
    };

    var updateZoom = function (axis, modelAxis) {
      var extremes = axis.getExtremes();
      if(modelAxis.currentMin !== extremes.dataMin || modelAxis.currentMax !== extremes.dataMax) {
        axis.setExtremes(modelAxis.currentMin, modelAxis.currentMax, false);
      }
    };

    var processExtremes = function(chart, axis, axisName) {
      if(axis.currentMin || axis.currentMax) {
        chart[axisName][0].setExtremes(axis.currentMin, axis.currentMax, true);
      }
    };

    var chartOptionsWithoutEasyOptions = function (options) {
      return highchartsNGUtils.deepExtend({}, options, {data: null, visible: null});
    };

    var getChartType = function(scope) {
      if (scope.config === undefined) return 'Chart';
      return chartTypeMap[('' + scope.config.chartType).toLowerCase()] ||
             (scope.config.useHighStocks ? 'StockChart' : 'Chart');
    };

    return {
      restrict: 'EAC',
      replace: true,
      template: '<div></div>',
      scope: {
        config: '=',
        disableDataWatch: '='
      },
      link: function (scope, element, attrs) {
        // We keep some chart-specific variables here as a closure
        // instead of storing them on 'scope'.

        // prevSeriesOptions is maintained by processSeries
        var prevSeriesOptions = {};

        var processSeries = function(series) {
          var i;
          var ids = [];

          if(series) {
            var setIds = ensureIds(series);
            if(setIds && !scope.disableDataWatch) {
              //If we have set some ids this will trigger another digest cycle.
              //In this scenario just return early and let the next cycle take care of changes
              return false;
            }

            //Find series to add or update
            angular.forEach(series, function(s) {
              ids.push(s.id);
              var chartSeries = chart.get(s.id);
              if (chartSeries) {
                if (!angular.equals(prevSeriesOptions[s.id], chartOptionsWithoutEasyOptions(s))) {
                  chartSeries.update(angular.copy(s), false);
                } else {
                  if (s.visible !== undefined && chartSeries.visible !== s.visible) {
                    chartSeries.setVisible(s.visible, false);
                  }
                  chartSeries.setData(angular.copy(s.data), false);
                }
              } else {
                chart.addSeries(angular.copy(s), false);
              }
              prevSeriesOptions[s.id] = chartOptionsWithoutEasyOptions(s);
            });

            //  Shows no data text if all series are empty
            if(scope.config.noData) {
              var chartContainsData = false;

              for(i = 0; i < series.length; i++) {
                if (series[i].data && series[i].data.length > 0) {
                  chartContainsData = true;

                  break;
                }
              }

              if (!chartContainsData) {
                chart.showLoading(scope.config.noData);
              } else {
                chart.hideLoading();
              }
            }
          }

          //Now remove any missing series
          for(i = chart.series.length - 1; i >= 0; i--) {
            var s = chart.series[i];
            if (s.options.id !== 'highcharts-navigator-series' && highchartsNGUtils.indexOf(ids, s.options.id) < 0) {
              s.remove(false);
            }
          }

          return true;
        };

        // chart is maintained by initChart
        var chart = false;
        var initChart = function() {
          if (chart) chart.destroy();
          prevSeriesOptions = {};
          var config = scope.config || {};
          var mergedOptions = getMergedOptions(scope, element, config);
          var func = config.func || undefined;
          var chartType = getChartType(scope);

          chart = new Highcharts[chartType](mergedOptions, func);

          for (var i = 0; i < axisNames.length; i++) {
            if (config[axisNames[i]]) {
              processExtremes(chart, config[axisNames[i]], axisNames[i]);
            }
          }
          if(config.loading) {
            chart.showLoading();
          }
          config.getHighcharts = function() {
            return chart;
          };

        };
        initChart();


        if(scope.disableDataWatch){
          scope.$watchCollection('config.series', function (newSeries, oldSeries) {
            processSeries(newSeries);
            chart.redraw();
          });
        } else {
          scope.$watch('config.series', function (newSeries, oldSeries) {
            var needsRedraw = processSeries(newSeries);
            if(needsRedraw) {
              chart.redraw();
            }
          }, true);
        }

        scope.$watch('config.title', function (newTitle) {
          chart.setTitle(newTitle, true);
        }, true);

        scope.$watch('config.subtitle', function (newSubtitle) {
          chart.setTitle(true, newSubtitle);
        }, true);

        scope.$watch('config.loading', function (loading) {
          if(loading) {
            chart.showLoading(loading === true ? null : loading);
          } else {
            chart.hideLoading();
          }
        });
        scope.$watch('config.noData', function (noData) {
          if(scope.config && scope.config.loading) {
            chart.showLoading(noData);
          }
        }, true);

        scope.$watch('config.credits.enabled', function (enabled) {
          if (enabled) {
            chart.credits.show();
          } else if (chart.credits) {
            chart.credits.hide();
          }
        });

        scope.$watch(getChartType, function (chartType, oldChartType) {
          if (chartType === oldChartType) return;
          initChart();
        });

        angular.forEach(axisNames, function(axisName) {
          scope.$watch('config.' + axisName, function(newAxes, oldAxes) {
            if (newAxes === oldAxes || !newAxes) {
              return;
            }

            if (angular.isArray(newAxes)) {

              for (var axisIndex = 0; axisIndex < newAxes.length; axisIndex++) {
                var axis = newAxes[axisIndex];

                if (axisIndex < chart[axisName].length) {
                  chart[axisName][axisIndex].update(axis, false);
                  updateZoom(chart[axisName][axisIndex], angular.copy(axis));
                }

              }

            } else {
              // update single axis
              chart[axisName][0].update(newAxes, false);
              updateZoom(chart[axisName][0], angular.copy(newAxes));
            }

            chart.redraw();
          }, true);
        });
        scope.$watch('config.options', function (newOptions, oldOptions, scope) {
          //do nothing when called on registration
          if (newOptions === oldOptions) return;
          initChart();
          processSeries(scope.config.series);
          chart.redraw();
        }, true);

        scope.$watch('config.size', function (newSize, oldSize) {
          if(newSize === oldSize) return;
          if(newSize) {
            chart.setSize(newSize.width || chart.chartWidth, newSize.height || chart.chartHeight);
          }
        }, true);

        scope.$on('highchartsng.reflow', function () {
          chart.reflow();
        });

        scope.$on('$destroy', function() {
          if (chart) {
            try{
              chart.destroy();
            }catch(ex){
              // fail silently as highcharts will throw exception if element doesn't exist
            }

            $timeout(function(){
              element.remove();
            }, 0);
          }
        });

      }
    };
  }
}());
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
