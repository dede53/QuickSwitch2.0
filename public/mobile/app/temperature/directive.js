app.directive('temperatureDirective', function ($rootScope) {
	return {
		restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
		template: '<h3>Temperaturen</h3><highchart style="min-height: 600px; min-width: 310px" class="chart" config="chartConfig" class="span9" data-snap-ignore="true" ></highchart>',
		controller: 'temperatureController', //Embed a custom controller in the directive
		link: function($scope, element, attr){
			function reflow(){
				setTimeout(function(){
					var chart = $rootScope.chartConfig.getHighcharts();
					chart.reflow();
				}, 20);
			}
			$scope.$watch("favorit", reflow);
		}
	};
});