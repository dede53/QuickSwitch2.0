app.directive('temperatureDirective', function ($rootScope) {
	return {
		restrict: 'EA', //E = element, A = attribute, C = class, M = comment
		templateUrl: "./app/temperature/template-chart.html",
		controller: 'temperatureController', //Embed a custom controller in the directive
		link: function($scope, element, attr){
			function reflow(){
				setTimeout(function(){
<<<<<<< HEAD
					var chart = $scope.varChart.getHighcharts();
=======
					var chart = $rootScope.chartConfig.getHighcharts();
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
					chart.reflow();
				}, 20);
			}
			$scope.$watch("favorit", reflow);
		}
	};
});