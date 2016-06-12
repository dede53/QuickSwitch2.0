app.controller('weatherController', function($rootScope, $scope, socket, $http){
	// $http.get('http://www.vrsinfo.de/index.php?eID=tx_vrsinfo_ass2_departuremonitor&i=Lbcut4WC2x7rgV4iIJKezl7ApXwwoBFo').
	$http.get('http://api.openweathermap.org/data/2.5/forecast/daily?q=Sankt%20Augustin&mode=json&units=metric&cnt=3&APPID=637dcfda33ac69eb15b721aba20679a9').
		success(function(data, status, headers, config) {
			$scope.weather = data;
		}).
		error(function(data, status, headers, config) {
			// log error
		});
	$scope.forecastdays = [
		"Heute",
		"Morgen",
		"Übermorgen",
		"in 3 Tagen"
	]
});