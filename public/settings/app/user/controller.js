app.controller('userController', function($scope, $rootScope, socket){


	$scope.users = [];
	socket.emit('users');
	socket.on('user', function(data) {
		$scope.users.push(data);
	});
	
	$scope.deleteUser = function(data) {
		socket.emit('deleteUser', {"id":data.id});	
	}
	socket.on('newusers', function(data) {
		console.log(data);
		$scope.users = data;
	});
});
app.controller('editUserController', function($scope, $rootScope, socket, $routeParams){
	/***********************************************
	*	Daten anfordern
	***********************************************/
	$scope.variables = [];



	if(!$routeParams.id){
			$scope.editUser = {
				title: "hinzufügen",
				userlist: {
					name: "",
					favoritDevices: []
				}
			}
	}else{
		socket.emit('user', {"id":  $routeParams.id});
		$scope.editUser = {
			title: "bearbeiten",
			userlist: {}
		}
	}
		/***********************************************
		*	Daten empfangen, Scope zuordnen
		***********************************************/
	socket.on('user', function(data) {
		$scope.editUser.userlist = data;
		socket.emit('devices', {"type":"object"});
		socket.emit('variables');


		socket.on('devices', function(data) {
			var devices = new Array;
			// console.log(data);
			var arr = Object.keys(data).map(function(k) { return data[k] });
			arr.forEach(function(arr){
				var ar = Object.keys(arr.roomdevices).map(function(k) { return arr.roomdevices[k] });
				ar.forEach(function(arr){
					if( $routeParams.id && inArray(arr.device.deviceid , $scope.editUser.userlist.favoritDevices) ){
						var haystack = $scope.editUser.userlist.favoritDevices;
						var length = $scope.editUser.userlist.favoritDevices.length;
						for(var i = 0; i < length; i++) {
							if(haystack[i] == arr.device.deviceid){
								arr.selected = true;
								devices.splice(i,0,arr);
							};
						}
						
					}else{
						arr.selected = false;
						devices.push(arr);
					}
				});
			});
			$scope.devicelist = devices;
		});
		var showVariables = [];
		$scope.userVariables = data.variables;
		socket.on('variable', function(data){
			if($routeParams.id && !inArray(data.id , showVariables)){
				if(inArray(data.id , $scope.userVariables)){
					data.selected = true;
					console.log($scope.userVariables.indexOf(data.id));
				 	$scope.variables.splice($scope.userVariables.indexOf(data.id), 1, data);
				}else{
					data.selected = false;
					$scope.variables.push(data);
				}
				// if(data.selected == true){
				// }else{
				// 	console.log(data);
				// }
				showVariables.push(data.id);
			}
		});
	});

	// helper method to get selected fruits
	$scope.selectedVariables = function() {
		return filterFilter($scope.variables, { selected: true });
	};
	// helper method to get selected fruits
	$scope.selectedDevices = function() {
		return filterFilter($scope.devicelist, { selected: true });
	};
	
	// watch fruits for changes
	$scope.$watch('devicelist|filter:{selected:true}', function (nv) {
		$scope.editUser.userlist.favoritDevices = nv.map(function (device) {
			return device.device.deviceid;
		});
	}, true);
	// watch fruits for changes
	$scope.$watch('variables|filter:{selected:true}', function (nv) {
		$scope.editUser.userlist.variables = nv.map(function (variable) {
			return variable.id;
		});
	}, true);

  
	$scope.dragControlListeners = {
		accept: function (sourceItemHandleScope, destSortableScope) {return boolean},//override to determine drag is allowed or not. default is true.
		itemMoved: function (event) {
			},
		orderChanged: function(event) {
			},
		containment: '#board'
		//optional param.
	};
});
app.controller('saveUserController', function($scope, socket, $location) {
		$scope.saveUser = function() {
			// Validierung!!
			socket.emit('saveUser', $scope.editUser.userlist);
			$location.url("/user");
		};
		socket.on('savedUser', function(data){
		});
});