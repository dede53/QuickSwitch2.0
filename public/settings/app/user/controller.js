<<<<<<< HEAD
app.controller('userController', function($scope, $rootScope, socket){

	socket.emit('newuser');
	socket.on('newuser', function(data) {
		$scope.users = data;
	});
	
	// socket.emit('getUser');
	// socket.on('User',function(data){
		// $rootScope.users = data;
	// });
	
	$scope.deleteUser = function(data) {
		socket.emit('deleteUser', {"id":data.id});	
	}
	socket.on('deletedUser', function(data) {
		$scope.users = data;
	});
});
app.controller('editUserController', function($scope, $rootScope, socket, $routeParams){
	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.emit('devices', {"type":"object"});
	if(!$routeParams.id){
			$scope.editUser = {
				title: "Hinzufügen",
				userlist: {
					name: "",
					favoritDevices: []
				}
			}
	}else{
		socket.emit('user', {"id":  $routeParams.id});

	}
		/***********************************************
		*	Daten empfangen, Scope zuordnen
		***********************************************/
		socket.on('user', function(data) {
			
			
			if(data.constructor === Array){
				
				$scope.editUser = {
					title: "Bearbeiten",
					userlist: data[0]
				}

			}else{
				$scope.editUser = {
					title: "Achtung: Fehler!",
					userlist:{
						name: data
					}
				}
			}
		});
		socket.on('devices', function(data) {
			var devices = new Array;
			
			var arr = Object.keys(data).map(function(k) { return data[k] });
			arr.forEach(function(arr){
				var ar = Object.keys(arr).map(function(k) { return arr[k] });
				ar.forEach(function(arr){
					if( $routeParams.id && inArray(arr.deviceid , JSON.parse($scope.editUser.userlist.favoritDevices)) ){
						var haystack = JSON.parse($scope.editUser.userlist.favoritDevices);
						var length = haystack.length;
						for(var i = 0; i < length; i++) {
							if(haystack[i] == arr.deviceid){
								console.log(arr.name);
								console.log(i);
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

			// helper method to get selected fruits
			$scope.selectedFruits = function selectedFruits() {
				return filterFilter($scope.devicelist, { selected: true });
			};
			
			// watch fruits for changes
			$scope.$watch('devicelist|filter:{selected:true}', function (nv) {
				$scope.editUser.userlist.favoritDevices = nv.map(function (device) {
					return device.deviceid;
				});
			}, true);
		});


  
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
=======
app.controller('userController', function($scope, $rootScope, socket){

	socket.emit('newuser');
	socket.on('newuser', function(data) {
		$scope.users = data;
	});
	
	// socket.emit('getUser');
	// socket.on('User',function(data){
		// $rootScope.users = data;
	// });
	
	$scope.deleteUser = function(data) {
		socket.emit('deleteUser', {"id":data.id});	
	}
	socket.on('deletedUser', function(data) {
		$scope.users = data;
	});
});
app.controller('editUserController', function($scope, $rootScope, socket, $routeParams){
	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.emit('devices', {"type":"object"});
	if(!$routeParams.id){
			$scope.editUser = {
				title: "Hinzufügen",
				userlist: {
					name: "",
					favoritDevices: []
				}
			}
	}else{
		socket.emit('user', {"id":  $routeParams.id});

	}
		/***********************************************
		*	Daten empfangen, Scope zuordnen
		***********************************************/
		socket.on('user', function(data) {
			
			
			if(data.constructor === Array){
				
				$scope.editUser = {
					title: "Bearbeiten",
					userlist: data[0]
				}

			}else{
				$scope.editUser = {
					title: "Achtung: Fehler!",
					userlist:{
						name: data
					}
				}
			}
		});
		socket.on('devices', function(data) {
			var devices = new Array;
			
			var arr = Object.keys(data).map(function(k) { return data[k] });
			arr.forEach(function(arr){
				var ar = Object.keys(arr).map(function(k) { return arr[k] });
				ar.forEach(function(arr){
					if( $routeParams.id && inArray(arr.deviceid , JSON.parse($scope.editUser.userlist.favoritDevices)) ){
						var haystack = JSON.parse($scope.editUser.userlist.favoritDevices);
						var length = haystack.length;
						for(var i = 0; i < length; i++) {
							if(haystack[i] == arr.deviceid){
								console.log(arr.name);
								console.log(i);
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

			// helper method to get selected fruits
			$scope.selectedFruits = function selectedFruits() {
				return filterFilter($scope.devicelist, { selected: true });
			};
			
			// watch fruits for changes
			$scope.$watch('devicelist|filter:{selected:true}', function (nv) {
				$scope.editUser.userlist.favoritDevices = nv.map(function (device) {
					return device.deviceid;
				});
			}, true);
		});


  
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
>>>>>>> af97e501eae31491992417dd0f792413c9d64b8f
