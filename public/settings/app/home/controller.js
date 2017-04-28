app.controller('homeController', function($scope, socket, $timeout, geolocationSvc){
	$scope.changed = false;
	socket.emit('settings:get');
	$scope.addSwitchserver = function(){
		$scope.settings.switchserver.push({
			"id": $scope.settings.switchserver.length,
			"name": "Name",
			"port": 4040,
			"ip": "192.168.187.123"
		});
		$scope.changed = true;
	};
	$scope.removeSwitchserver = function(id){
		$scope.changed = true;
		$scope.settings.switchserver.splice(id, 1);
	};
	$scope.save = function(data){
		$scope.changed = false;
		socket.emit('settings:save', data);
	}
	$scope.getGeo = function(){
		geolocationSvc.getCurrentPosition().then(function(location){
			console.log(location);
			$scope.settings.location = {
				"long": location.coords.longitude,
				"lat": location.coords.latitude
			}
		});
	}
});