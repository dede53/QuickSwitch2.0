app.controller('groupController', function($scope, $rootScope, socket, $timeout){
	socket.emit('groups:getAll');

	$scope.deleteGroup = function(group) {
		socket.emit('group:remove', {user: group.user, remove: group.id});	
	}
});
app.controller('editGroupController', function($scope, $rootScope, socket, $routeParams, $location){
	socket.emit('rooms:get');
	socket.emit('devices:devicelist');
	socket.emit('users:get');
	$scope.roomAdd = 'nonsense';
	$scope.deviceAdd = 'nonsense';
	if(!$routeParams.id){
		$scope.title = "hinzufügen";
		$scope.group = {
			groupDevices :[],
			user:1
		}
	}else{
		$scope.title = "bearbeiten";
		socket.emit('group:get', $routeParams.id);
	}
	$scope.addDevice = function(test){
		var test = JSON.parse(test);
		var device = {
			"id": test.deviceid,
			"type":"device",
			"timeout":0
		}
		$scope.group.groupDevices.push(device);
		$scope.deviceAdd = 'nonsense';
	}
	$scope.addRoom = function(test){
		var test = JSON.parse(test);
		var device = {
			"id": test.id,
			"type":"room",
			"timeout":0
		}
		$scope.group.groupDevices.push(device);
		$scope.roomAdd = 'nonsense';
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
		socket.emit('group:save', {user:$rootScope.activeUser, save: $scope.group});
		$location.url("/groups");
	};
});