app.controller('alertsController', function(socket, $scope){

	socket.on('alert', function(data){
		if($scope.alerts == undefined){
			$scope.alerts = [];
		}
		$scope.alerts.push(data);
	});

	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};
});