<<<<<<< HEAD
app.controller('alertsController', function(socket, $scope, $rootScope){
=======
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
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
});