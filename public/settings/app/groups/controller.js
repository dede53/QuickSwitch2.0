app.controller('groupController', function($scope, $rootScope, socket){
	socket.emit('groups:getAll');

	$scope.deleteGroup = function(data) {
		socket.emit('group:remove', data);	
	}
});
app.controller('editGroupController', function($scope, $rootScope, socket, $routeParams, $location){
	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.emit('devices:devicelist');
	socket.emit('users:get');
	if(!$routeParams.id){
		$scope.title = "hinzufügen";
		$scope.group = {
			groupDevices :[]
		}
	}else{
		$scope.title = "bearbeiten";
		socket.emit('group:get', $routeParams.id);
	}
	$scope.addDevice = function(test){
		var test = JSON.parse(test);
		var device = {
			"id": test.deviceid,
			"type":test.type
		}
		$scope.group.groupDevices.push(device);
		$scope.deviceAdd = 'nonsense';
	}
	$scope.removeDevice = function(index){
		$scope.group.groupDevices.splice(index, 1);
	}
	$scope.devicesDragControlListeners = {
		accept: function (sourceItemHandleScope, destSortableScope) {return true},//override to determine drag is allowed or not. default is true.
		dragEnd: function(event){
		}
	};
	$scope.saveGroup = function() {
		socket.emit('group:add', $scope.group);
		$location.url("/groups");
	};
});
// app.controller('saveGroupController', function($scope, socket, $location){
// 		// socket.on('savedGroup', function(data){
// 		// });
// });