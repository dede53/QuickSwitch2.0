app.directive('temperatureDirective', function ($rootScope) {
	return {
		restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
		templateUrl: './app/temperature/template-highchart.html',
		controller: 'temperatureController', //Embed a custom controller in the directive
		link: function($scope, element, attr){
			function reflow(){
				setTimeout(function(){
					var chart = $scope.varChart.getHighcharts().reflow();
					// chart.reflow();
				}, 20);
			}
			$scope.$watch("favorit", reflow);
		}
	};
});