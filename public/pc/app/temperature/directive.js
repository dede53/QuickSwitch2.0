<<<<<<< HEAD
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
=======
app.directive('temperatureDirective', function ($rootScope) {
    return {
        restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
        template: '<highchart style="min-height: 600px; min-width: 310px" class="chart" config="chartConfig" class="span9"  ></highchart>',
        controller: 'temperatureController' //Embed a custom controller in the directive
    };
>>>>>>> af97e501eae31491992417dd0f792413c9d64b8f
});