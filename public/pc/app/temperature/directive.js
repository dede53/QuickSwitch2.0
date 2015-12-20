app.directive('temperatureDirective', function ($rootScope) {
	return {
		restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
		template: '<highchart class="chart" config="chartConfig" ></highchart>',
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