app.controller('userController', function($scope, $rootScope, socket){
	socket.emit('users:get');
	$scope.deleteUser = function(data) {
		socket.emit('deleteUser', {"id":data.id});	
	}
});
app.controller('editUserController', function($scope, $rootScope, socket, $routeParams){
	if(!$routeParams.id){
		$scope.title = "hinzufügen";
		$scope.user = {
			favoritDevices:[],
			favoritVariables:[],
			varChart:[]
		}
		$scope.favoritDevices = [];
		$scope.favoritVariables = [];
		$scope.varChart = [];
	}else{
		$scope.title = "bearbeiten";
		socket.emit('user:get', $routeParams.id);
		socket.emit('devices:favoriten', $routeParams.id);
		socket.emit('variables:favoriten', $routeParams.id);
		socket.emit('variables:chart', $routeParams.id);
	}

	socket.emit('devices:devicelist');
	socket.emit('variables:get');
	$scope.addDevice = function(test){
		var test = JSON.parse(test);
		$scope.favoritDevices.push(test);
		$scope.user.favoritDevices.push(test.deviceid);
		// delete $scope.devicelist[test.deviceid];
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
		accept: function (sourceItemHandleScope1, destSortableScope1) {return true},//override to determine drag is allowed or not. default is true.
		dragEnd: function(event){
			$scope.user.favoritDevices.splice(event.source.index, 1);
			$scope.user.favoritDevices.splice(event.dest.index, 0, event.source.itemScope.device.deviceid);
		}
	};
	$scope.variableDragControlListeners = {
		accept: function (sourceItemHandleScope2, destSortableScope2) {return true},//override to determine drag is allowed or not. default is true.
		dragEnd: function(event){}
	};
	$scope.varChartDragControlListeners = {
		accept: function (sourceItemHandleScope3, destSortableScope3) {return true},//override to determine drag is allowed or not. default is true.
		dragEnd: function(event){}
	};
});
app.controller('saveUserController', function($scope, socket, $location) {
	$scope.saveUser = function(){
		socket.emit('user:save', {save:$scope.user});
		$location.url("/user");
	};
});