app.controller('userController', function($scope, $rootScope, socket){
	socket.emit('users:get');
	$scope.deleteUser = function(data) {
		socket.emit('deleteUser', {"id":data.id});	
	}
});
app.controller('editUserController', function($scope, $rootScope, socket, $routeParams){
	/***********************************************
	*	Daten anfordern
	***********************************************/


	if(!$routeParams.id){
		$scope.title = "hinzufügen";
	}else{
		$scope.title = "bearbeiten";
		socket.emit('user:get', $routeParams.id);
		socket.emit('devices:favoriten', $routeParams.id);
		socket.emit('variables:favoriten', $routeParams.id);
	}
	socket.emit('devices:devicelist');
	socket.emit('variables:get');
	$scope.addDevice = function(test){
		$scope.favoritDevices.push(JSON.parse(test));
		$scope.user.favoritDevices.push(JSON.parse(test).deviceid);
		console.log($scope.favoritDevices);
		$scope.deviceAdd = 'nonsense';
	}
	$scope.removeDevice = function(index){
		$scope.favoritDevices.splice(index, 1);
		$scope.user.favoritDevices.splice(index, 1);
	}
	$scope.addVariable = function(test){
		$scope.favoritVariables.push(JSON.parse(test));
		$scope.user.favoritVariables.push(JSON.parse(test).id);
		$scope.addVariab = 'nonsense';
	}
	$scope.removeVariable = function(index){
		$scope.favoritVariables.splice(index, 1);
		$scope.user.favoritVariables.splice(index, 1);
	}
	$scope.addChartVariable = function(test){
		$scope.varChart.push(JSON.parse(test));
		$scope.user.varChart.push(JSON.parse(test).id);
		$scope.addChart = 'nonsense';
	}
	$scope.removeChartVariable = function(index){
		$scope.varChart.splice(index, 1);
		$scope.user.varChart.splice(index, 1);
	}
	$scope.devicesDragControlListeners = {
		accept: function (sourceItemHandleScope, destSortableScope) {return true},//override to determine drag is allowed or not. default is true.
		dragEnd: function(event){
			$scope.user.favoritDevices.splice(event.source.index, 1);
			$scope.user.favoritDevices.splice(event.dest.index, 0, event.source.itemScope.device.deviceid);
		}
	};
	$scope.variableDragControlListeners = {
		accept: function (sourceItemHandleScope, destSortableScope) {return true},//override to determine drag is allowed or not. default is true.
		dragEnd: function(event){
			console.log(event);
			$scope.user.favoritVariables.splice(event.source.index, 1);
			$scope.user.favoritVariables.splice(event.dest.index, 0, event.source.itemScope.variable.id);
		}
	};
});
app.controller('saveUserController', function($scope, socket, $location) {
	$scope.saveUser = function(){
		// Validierung!!´
		socket.emit('user:save', {save:$scope.user});
		$location.url("/user");
	};
});