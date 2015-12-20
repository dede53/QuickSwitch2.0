app.controller('groupsController',  function($scope, $rootScope, socket) {
	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.emit('groups');

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('groups', function(data) {
		$rootScope.grouplist = data;
	});
	
	/***********************************************
	*	Gruppe schalten
	***********************************************/
	$scope.switchgroup = function(data) {
		socket.emit('switchGroup', data);
	}
	
});


app.controller('groupSettingController', function($scope, $rootScope, socket){
	socket.emit('groups');
	
	socket.on('groups', function(data) {
		$rootScope.grouplist = data;
	});
	$scope.deleteGroup = function(data) {
		console.log(data);
		socket.emit('deleteGroup', {"id":data.id});	
	}
});
app.controller('editGroupController', function($scope, $rootScope, socket, $routeParams){
	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.emit('devices', {"type":"object"});
	if(!$routeParams.id){
			$scope.editGroup = {
				title: "Hinzufügen",
				grouplist: {
					name: "",
					groupDevices: []
				}
			}
	}else{
		socket.emit('group', {"id":  $routeParams.id});
	}
		/***********************************************
		*	Daten empfangen, Scope zuordnen
		***********************************************/
		socket.on('group', function(data) {
			console.log(data);
			if(data.constructor === Array){
				
				$scope.editGroup = {
					title: "Bearbeiten",
					grouplist: data[0]
				}

			}else{
				$scope.editGroup = {
					title: "Achtung: Fehler!",
					grouplist:{
						name: data
					}
				}
			}
		});
		socket.on('devices', function(data) {
			console.log($scope.editGroup.grouplist);
			var devices = new Array;
			
			var arr = Object.keys(data).map(function(k) { return data[k] });
			arr.forEach(function(arr){
				var ar = Object.keys(arr).map(function(k) { return arr[k] });
				ar.forEach(function(arr){
					if( $routeParams.id && inArray(arr.deviceid , JSON.parse($scope.editGroup.grouplist.groupDevices)) ){
						var haystack = JSON.parse($scope.editGroup.grouplist.groupDevices);
						var length = haystack.length;
						for(var i = 0; i < length; i++) {
							if(haystack[i] == arr.deviceid){
								console.log(arr.name);
								//console.log(i);
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
				return filterFilter($scope.grouplist, { selected: true });
			};
			
			// watch fruits for changes
			$scope.$watch('devicelist|filter:{selected:true}', function (nv) {
				$scope.editGroup.grouplist.groupDevices = nv.map(function (device) {
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
app.controller('saveGroupController', function($scope, socket, $location){
		$scope.saveGroup = function() {
			// Validierung!!
			console.log($scope.editGroup.grouplist);
			socket.emit('saveGroup', $scope.editGroup.grouplist);
		};
		socket.on('savedGroup', function(data){
			$location.url("/groups");
		});
});