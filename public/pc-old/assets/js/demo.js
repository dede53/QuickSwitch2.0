var app = angular.module('sampleApp', ['ngRoute','ngTouch','highcharts-ng','ngAnimate']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	when('/devices', {
		templateUrl: '../../app/components/devices/devices.html',
		controller: 'devicesController'
	}).
	when('/favoriten', {
		templateUrl: '../../app/components/favorites/favorits.html'
		/*templateUrl: '../../app/components/favorites/favorits.html',
		controller: 'favoritenController'*/
	}).
	when('/groups', {
		templateUrl: '../../app/components/groups/groups.html',
		controller: 'groupController'
	}).
	when('/rooms', {
		templateUrl: '../../app/components/rooms/rooms.html',
		controller: 'roomController'
	}).
	when('/temperature', {
		templateUrl: '../../app/components/temperatures/temperatures.html',
		controller: 'temperatureController'
	}).
	otherwise({
		redirectTo: '/favoriten'
	});
}]);

	
app.factory('socket', function ($rootScope) {
	var socket = io.connect();
	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {  
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		}
	};
});





app.controller('devicesController',  function($scope, $rootScope, socket) {
	/***********************
	* Toggle Funktion für geraeteliste
	****************************/
	$scope.custom = true;
	$scope.toggleCustom = function() {
		$scope.custom = $scope.custom === false ? true: false;
	};
	
	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.emit('devices', {"type":"object"});

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('devices', function(data) {
		$rootScope.devicelist = data;
	});
	
	/***********************************************
	*	Gerät schalten
	***********************************************/
	$scope.switchdeviceSlider = function(data) {
		//console.log($rootScope.devicelist[data.device.Raum][data.device.deviceid].status);
		//console.log(data.device.deviceid);
		socket.emit('switchdevice', {"id":data.device.deviceid,"status": $rootScope.devicelist[data.device.Raum][data.device.deviceid].status});
		// socket.emit('switchdevice', {"id":data.id,"status":data.status});
	}
	$scope.switchdevice = function(data) {
		socket.emit('switchdevice', {"id":data.id,"status":data.status});
	}
	socket.on('switchDevice', function(data) {
		$rootScope.devicelist[data.device.Raum][data.device.deviceid].status = data.status;
	});
	// socket.on('switchRoom', function(data) {
		// data.devices.forEach(function(dev){
			// $scope.devicelist[dev.Raum][dev.deviceid].status = data.status;
		// });
	// });
	
});

app.controller('roomController',  function($scope, $rootScope, socket) {
	/***********************
	* Toggle Funktion für geraeteliste
	****************************/
	// $scope.custom = true;
	// $scope.toggleCustom = function() {
		// $scope.custom = $scope.custom === false ? true: false;
	// };
	
	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.emit('rooms');

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('rooms', function(data) {
		$rootScope.roomlist = data;
	});
	
	/***********************************************
	*	Gerät schalten
	***********************************************/
	$scope.switchdevice = function(data) {
		socket.emit('switchdevice', {"id":data.id,"status":data.status});
	}
	$scope.switchroom = function(data) {
		// console.log(data);
		socket.emit('switchRoom', data);
	}
	
});

app.controller('groupController',  function($scope, $rootScope, socket) {
	/***********************
	* Toggle Funktion für geraeteliste
	****************************/
	// $scope.custom = true;
	// $scope.toggleCustom = function() {
		// $scope.custom = $scope.custom === false ? true: false;
	// };
	
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
app.controller('temperatureController',  function($scope, $rootScope, socket) {
	$rootScope.chartConfig = "";
	$rootScope.chartConfig = {
        options: {
            chart: {
                backgroundColor: 'transparent'
            },
            navigator: {
            	adaptToUpdatedData: false,
                enabled: false,
                series: []
            },
            rangeSelector: {
                enabled: false
            },
            plotOptions: {
                series: {
                    lineWidth: 1,
                    fillOpacity: 0.5,
                    marker:{
                    	enable: true
                    }
                },
                column: {
                    stacking: 'normal'
                },
                area: {
                    stacking: 'normal',
                    marker: {
                        enabled: false
                    }
                }

            },
            exporting: false,
            xAxis: [{
                type: 'datetime',
				events : {
                    afterSetExtremes : afterSetExtremes
                },
				labels:{
					rotation: -45
				}
            }],
            yAxis: [

                { // Primary yAxis

                    allowDecimals: true,
                    title: {
                        text: 'Temperatur',
                        style: {
                            color: '#80a3ca'
                        }
                    },
                    labels: {
                        format: '{value}',
                        style: {
                            color: '#80a3ca'
                        }
                    }


                }
            ],

            legend: {
                enabled: true
            },
            title: {
                text: 'Temperaturen'
            },
            credits: {
                enabled: false
            },
            tooltip: {
                headerFormat: '<div class="header">{point.key}</div>',
                pointFormat: '<div class="line"><div class="circle" ></div><p class="country" style="float:left;">{series.name}</p><p>{point.y}</p></div>',
                borderWidth: 1,
                borderRadius: 5,
                borderColor: '#a4a4a4',
                shadow: false,
                useHTML: true,
                percentageDecimals: 2,
                backgroundColor: "rgba(255,255,255,.7)",
                style: {
                    padding: 0
                },
                shared: true
            },
            useHighStocks: false
        },
        series: [],
        loading: true
    }
    
    function afterSetExtremes(e) {
			
			
			if(e.trigger == 'zoom' || e.trigger == 'rangeSelectorButton' || e.trigger == 'navigator'){
				console.log(e);
				var chart = $rootScope.chartConfig.getHighcharts();
				socket.emit('getSensorvaluesByMinutes', {"id":"all","min":e.min, "max":e.max});
				chart.showLoading('Loading...' + e.trigger);
			}else{
				console.log("kein Zoom!");
				console.log(e);
			}

			socket.on('SensorvaluesByMinutes', function(data) {
				console.log(data.nodeID);
				var chart = $rootScope.chartConfig.getHighcharts();
		        chart.series[0].setData(data.data);
		        chart.hideLoading();
			    
		        // chart.series[0].addPoint([1438039000000,25]);
			});
    }
	
	
	socket.on('Sensorvalues', function(data) {
		console.log("Neue Daten");
		var sensor = {
			id: data.nodeID,
			name: data.name,
			data: data.data,
			type: data.linetyp,
			yAxis: 0,
			connectNulls:false,
			tooltip: {
				valueSuffix: ' °C'
			},
			color: '#' + data.farbe
		};
		var navigator = {
			data: data.data
		};
		
		$rootScope.chartConfig.options.navigator.series.push(navigator);

		$rootScope.chartConfig.series.push(sensor);
		$rootScope.chartConfig.loading = false;
	});
		
	Highcharts.setOptions({
		global : {
			useUTC : false
		},
		lang : {
			loading: "Lade Daten...",
			rangeSelectorZoom: ""
		}
	});
		
	
    $scope.getData = function(hours){
    	socket.emit('getSensorvalues', {"id":"1","date":hours});
    }
});

/*
app.controller('temperatureController',  function($scope, $rootScope, socket) {
	$rootScope.chartConfig = "";
	$rootScope.chartConfig = {
        options: {
            chart: {
                backgroundColor: 'transparent',
                zoomType: 'x'
            },
            navigator: {
            	adaptToUpdatedData: false,
                enabled: true,
                series: []
            },
            rangeSelector: {
                enabled: true,
                buttons: [{
                    type: 'hour',
                    count: 1,
                    text: 'Stunde'
                }, {
                    type: 'day',
                    count: 1,
                    text: 'Tag'
                }, {
                    type: 'month',
                    count: 1,
                    text: 'Monat'
                }, {
                    type: 'year',
                    count: 1,
                    text: 'Jahr'
                }, {
                    type: 'all',
                    text: 'Alle'
                }],
                inputEnabled: false,
                selected : 4 // all
            },
            plotOptions: {
                series: {
                    lineWidth: 1,
                    fillOpacity: 0.5,
                    marker:{
                    	enable: true
                    }
                },
                column: {
                    stacking: 'normal'
                },
                area: {
                    stacking: 'normal',
                    marker: {
                        enabled: false
                    }
                }

            },
            exporting: false,
            xAxis: [{
                type: 'datetime',
				events : {
                    afterSetExtremes : afterSetExtremes
                },
				labels:{
					rotation: -45
				}
            }],
            yAxis: [

                { // Primary yAxis

                    allowDecimals: true,
                    title: {
                        text: 'Temperatur',
                        style: {
                            color: '#80a3ca'
                        }
                    },
                    labels: {
                        format: '{value}',
                        style: {
                            color: '#80a3ca'
                        }
                    }


                }
            ],

            legend: {
                enabled: true
            },
            title: {
                text: 'Temperaturen'
            },
            credits: {
                enabled: false
            },
            tooltip: {
                headerFormat: '<div class="header">{point.key}</div>',
                pointFormat: '<div class="line"><div class="circle" ></div><p class="country" style="float:left;">{series.name}</p><p>{point.y}</p></div>',
                borderWidth: 1,
                borderRadius: 5,
                borderColor: '#a4a4a4',
                shadow: false,
                useHTML: true,
                percentageDecimals: 2,
                backgroundColor: "rgba(255,255,255,.7)",
                style: {
                    padding: 0
                },
                shared: true
            },
            useHighStocks: true
        },
        series: [],
        loading: true
    }
	function afterSetExtremes(e) {
			
			
			if(e.trigger == 'zoom' || e.trigger == 'rangeSelectorButton' || e.trigger == 'navigator'){
				console.log(e);
				var chart = $rootScope.chartConfig.getHighcharts();
				socket.emit('getSensorvaluesByMinutes', {"id":"all","min":e.min, "max":e.max});
				chart.showLoading('Loading...' + e.trigger);
			}else{
				console.log("kein Zoom!");
				console.log(e);
			}

			socket.on('SensorvaluesByMinutes', function(data) {
				console.log(data.nodeID);
				var chart = $rootScope.chartConfig.getHighcharts();
		        chart.series[0].setData(data.data);
		        chart.hideLoading();
			    
		        // chart.series[0].addPoint([1438039000000,25]);
			});
    }
	
	

	socket.emit('getSensorvalues', {"id":"1","date":"all"});
	socket.on('Sensorvalues', function(data) {
		console.log("Neue Daten");
		var sensor = {
			id: data.nodeID,
			name: data.name,
			data: data.data,
			type: data.linetyp,
			yAxis: 0,
			connectNulls:false,
			tooltip: {
				valueSuffix: ' °C'
			},
			color: '#' + data.farbe
		};
		var navigator = {
			data: data.data
		};
		
		$rootScope.chartConfig.options.navigator.series.push(navigator);

		$rootScope.chartConfig.series.push(sensor);
		$rootScope.chartConfig.loading = false;
	});
		
	Highcharts.setOptions({
		global : {
			useUTC : false
		},
		lang : {
			loading: "Lade Daten...",
			rangeSelectorZoom: ""
		}
	});
		
	


	
});
*/
app.controller('newCountdowntimer', function($scope, socket) {
		$scope.newCountdown = function() {
			// Validierung!!
			socket.emit('newCountdowntimer', $scope.newCountdowntimer);
		};

});

app.controller('sendNewMessage', function($scope, socket) {
		$scope.sendMessage = function() {
			// Validierung!!
			$scope.linkMessage = {
				author: $scope.activeUser.name,
				message: $scope.link.message,
				type: $scope.link.type
			}
			$scope.link.message = "";
			socket.emit('newLinkMessage', $scope.linkMessage);
			
		};

});


app.controller("AppController", function($scope, $location, $rootScope, socket){
/*
	$scope.storedUser = getCookie("username");
	if ($scope.storedUser != "") {
		$scope.activeUser = JSON.parse($scope.storedUser);
		socket.emit('favoritDevices', $scope.activeUser);
	}else{
		$scope.activeUser = [];
	}

	$scope.setUser = function() {
		socket.emit('favoritDevices', $scope.activeUser);
		setCookie("username", JSON.stringify($scope.activeUser), 365);
	}
*/
	socket.emit('newuser');
	socket.on('newuser', function(data) {
		$scope.values = data;
	});


	// Einstellungen für das Menu:
	// Beim Starten geöffnet sein?
	$scope.showmenu=false;
	$scope.toggleMenu = function(data){
		$scope.showmenu=!($scope.showmenu);
		if(data != ""){
			$location.url(data);
		}
		//data.stopPropagation();
	}
});

app.directive('targetBlank', function() {
  return {
    compile: function(element) {
      var elems = (element.prop("tagName") === 'A') ? element : element.find('a');
      elems.attr("target", "_blank");
    }
  };
});

app.directive("scrollBottom", function(){
    return {
        link: function(scope, element, attr){
            var $id= $("#" + attr.scrollBottom);
            $id.scrollTop($id[0].scrollHeight);
        }
    }
});

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}


