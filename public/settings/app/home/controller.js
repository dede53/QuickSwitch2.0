app.controller('homeController', function($scope, socket, $timeout){
	socket.emit('settings:get');
	$scope.addSwitchserver = function(){
		$scope.settings.switchserver.push({
			"id": $scope.settings.switchserver.length,
			"name": "Name",
			"port": 4040,
			"ip": "192.168.187.123"
		});
	};
	$scope.removeSwitchserver = function(id){
		$scope.settings.switchserver.splice(id, 1);
	};
	$scope.save = function(data){
		console.log(data);
		socket.emit('settings:save', data);
	}
});