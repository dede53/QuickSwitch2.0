<<<<<<< HEAD
app.controller('temperatureController', function($scope, $rootScope, socket){
	console.log("Temperaturen!");
    socket.emit('getSensors');
    socket.on('sensors', function(data){
		$scope.sensorlist = data;
		$rootScope.chartConfig.series = [];
    	data.forEach(function(sensor){
			var rnd = []
			for (var i = 0; i < 10; i++) {
				rnd.push(Math.floor(Math.random() * 20) + 1)
			}
			$rootScope.chartConfig.series.push({
				id: sensor.id,
				name: sensor.name,
				nodeid: sensor.nodeid,
				
				dashStyle: sensor.linetype,
				type: sensor.charttype,
				color: sensor.linecolor,
				data: rnd
			});

    	});
    });

$scope.chartTypes = [
	{"chart": "line",		"title": "Line"},
	{"chart": "spline", 	"title": "Smooth line"},
	{"chart": "area",		"title": "Area"},
	{"chart": "areaspline",	"title": "Smooth area"},
	{"chart": "column",		"title": "Column"},
	{"chart": "bar",		"title": "Bar"},
	{"chart": "scatter",	"title": "Scatter"}
];

$scope.dashStyles = [
	{"line": "Solid",			"title": "Solid"},
	{"line": "ShortDash",		"title": "ShortDash"},
	{"line": "ShortDot",		"title": "ShortDot"},
	{"line": "ShortDashDot",	"title": "ShortDashDot"},
	{"line": "ShortDashDotDot",	"title": "ShortDashDotDot"},
	{"line": "Dot",				"title": "Dot"},
	{"line": "Dash",			"title": "Dash"},
	{"line": "LongDash",		"title": "LongDash"},
	{"line": "DashDot",			"title": "DashDot"},
	{"line": "LongDashDot",		"title": "LongDashDot"},
	{"line": "LongDashDotDot",	"title": "LongDashDotDot"}
];





  $scope.addSeries = function () {
    var rnd = []
    for (var i = 0; i < 10; i++) {
      rnd.push(Math.floor(Math.random() * 20) + 1)
    }
    $rootScope.chartConfig.series.push({
    	data: rnd
    });
  }

	$scope.removeSensor = function (id) {
		console.log(id);
		var seriesArray = $rootScope.chartConfig.series;
		socket.emit('deleteSensor', id);
	}
	$scope.saveSensor = function (id) {
		var sensor = $rootScope.chartConfig.series[id];
		console.log(sensor);
		socket.emit('saveSensor', sensor);
	}

  $rootScope.chartConfig = {
		options:{
			chart: {
				backgroundColor: 'transparent'
			},
			navigator: {
				adaptToUpdatedData: false,
				enabled: true,
				series: []
			},
			rangeSelector: {
				enabled: true
			},
			plotOptions: {
				series: {
					lineWidth: 1,
					fillOpacity: 0.5,
					marker:{
						enable: true
					}
				},
			},
            exporting: false,
			xAxis: [{
				type: 'datetime',
				labels:{
					rotation: 0
				}
			}],
			yAxis: [{
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
			}],
			legend: {
				enabled: true
			},
		},

		title: {
			text: 'Temperaturen'
		},
		credits: {
				enabled: true
		},
		tooltip: {
			headerFormat: '<div class="header">{point.key}</div>',
			pointFormat: '<div class="line"><p style="float:left;">{series.name} {point.y}</p></div>',
			borderWidth: 1,
			borderRadius: 5,
			borderColor: '#a4a4a4',
			shadow: false,
			useHTML: true,
			percentageDecimals: 2,
			backgroundColor: "rgba(255,255,255,.7)",
			style: {
				padding: 5
			},
			shared: true
		},
		useHighStocks: true,
        series: [],
        loading: false
    }
});


app.controller('editSensorController',  function($scope, $rootScope, socket, $routeParams) {
	socket.emit('charttypen');
	socket.on('charttypen', function(data){
		$scope.charttypen = data;
	});
	/***********************************************
	*	Daten anfordern
	***********************************************/
	if(!$routeParams.id){
			$scope.editSensor = {
				title: "Hinzufügen"
			}
	}else{
		socket.emit('getSensor', {"id":  $routeParams.id});

		/***********************************************
		*	Daten empfangen, Scope zuordnen
		***********************************************/
		socket.on('sensor', function(data) {
			
			if(data.constructor === Array){

				$scope.editSensor = {
					title: "Bearbeiten",
					sensorlist: data[0]
				}
			}else{
				$scope.editSensor = {
					title: "Achtung: Fehler!",
					sensorlist:{
						name: data
					}
				}
			}
		});
	}
});
app.controller('saveSensorController', function($scope, socket, $location) {
		$scope.saveSensor = function() {
			// Validierung!!
			socket.emit('saveSensor', $scope.editSensor.sensorlist);
			$location.url("/temperature");
		};
		socket.on('savedDevice', function(data){
			alert("Antwort:" + data);
		});
});
=======
app.controller('temperatureController', function($scope, $rootScope, socket){
	console.log("Temperaturen!");
    socket.emit('getSensors');
    socket.on('sensors', function(data){
		$scope.sensorlist = data;
		$rootScope.chartConfig.series = [];
    	data.forEach(function(sensor){
			var rnd = []
			for (var i = 0; i < 10; i++) {
				rnd.push(Math.floor(Math.random() * 20) + 1)
			}
			$rootScope.chartConfig.series.push({
				id: sensor.id,
				name: sensor.name,
				nodeid: sensor.nodeid,
				
				dashStyle: sensor.linetype,
				type: sensor.charttype,
				color: sensor.linecolor,
				data: rnd
			});

    	});
    });

$scope.chartTypes = [
	{"chart": "line",		"title": "Line"},
	{"chart": "spline", 	"title": "Smooth line"},
	{"chart": "area",		"title": "Area"},
	{"chart": "areaspline",	"title": "Smooth area"},
	{"chart": "column",		"title": "Column"},
	{"chart": "bar",		"title": "Bar"},
	{"chart": "scatter",	"title": "Scatter"}
];

$scope.dashStyles = [
	{"line": "Solid",			"title": "Solid"},
	{"line": "ShortDash",		"title": "ShortDash"},
	{"line": "ShortDot",		"title": "ShortDot"},
	{"line": "ShortDashDot",	"title": "ShortDashDot"},
	{"line": "ShortDashDotDot",	"title": "ShortDashDotDot"},
	{"line": "Dot",				"title": "Dot"},
	{"line": "Dash",			"title": "Dash"},
	{"line": "LongDash",		"title": "LongDash"},
	{"line": "DashDot",			"title": "DashDot"},
	{"line": "LongDashDot",		"title": "LongDashDot"},
	{"line": "LongDashDotDot",	"title": "LongDashDotDot"}
];





  $scope.addSeries = function () {
    var rnd = []
    for (var i = 0; i < 10; i++) {
      rnd.push(Math.floor(Math.random() * 20) + 1)
    }
    $rootScope.chartConfig.series.push({
    	data: rnd
    });
  }

	$scope.removeSensor = function (id) {
		console.log(id);
		var seriesArray = $rootScope.chartConfig.series;
		socket.emit('deleteSensor', id);
	}
	$scope.saveSensor = function (id) {
		var sensor = $rootScope.chartConfig.series[id];
		console.log(sensor);
		socket.emit('saveSensor', sensor);
	}

  $rootScope.chartConfig = {
		options:{
			chart: {
				backgroundColor: 'transparent'
			},
			navigator: {
				adaptToUpdatedData: false,
				enabled: true,
				series: []
			},
			rangeSelector: {
				enabled: true
			},
			plotOptions: {
				series: {
					lineWidth: 1,
					fillOpacity: 0.5,
					marker:{
						enable: true
					}
				},
			},
            exporting: false,
			xAxis: [{
				type: 'datetime',
				labels:{
					rotation: 0
				}
			}],
			yAxis: [{
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
			}],
			legend: {
				enabled: true
			},
		},

		title: {
			text: 'Temperaturen'
		},
		credits: {
				enabled: true
		},
		tooltip: {
			headerFormat: '<div class="header">{point.key}</div>',
			pointFormat: '<div class="line"><p style="float:left;">{series.name} {point.y}</p></div>',
			borderWidth: 1,
			borderRadius: 5,
			borderColor: '#a4a4a4',
			shadow: false,
			useHTML: true,
			percentageDecimals: 2,
			backgroundColor: "rgba(255,255,255,.7)",
			style: {
				padding: 5
			},
			shared: true
		},
		useHighStocks: true,
        series: [],
        loading: false
    }
});


app.controller('editSensorController',  function($scope, $rootScope, socket, $routeParams) {
	socket.emit('charttypen');
	socket.on('charttypen', function(data){
		$scope.charttypen = data;
	});
	/***********************************************
	*	Daten anfordern
	***********************************************/
	if(!$routeParams.id){
			$scope.editSensor = {
				title: "Hinzufügen"
			}
	}else{
		socket.emit('getSensor', {"id":  $routeParams.id});

		/***********************************************
		*	Daten empfangen, Scope zuordnen
		***********************************************/
		socket.on('sensor', function(data) {
			
			if(data.constructor === Array){

				$scope.editSensor = {
					title: "Bearbeiten",
					sensorlist: data[0]
				}
			}else{
				$scope.editSensor = {
					title: "Achtung: Fehler!",
					sensorlist:{
						name: data
					}
				}
			}
		});
	}
});
app.controller('saveSensorController', function($scope, socket, $location) {
		$scope.saveSensor = function() {
			// Validierung!!
			socket.emit('saveSensor', $scope.editSensor.sensorlist);
			$location.url("/temperature");
		};
		socket.on('savedDevice', function(data){
			alert("Antwort:" + data);
		});
});
>>>>>>> af97e501eae31491992417dd0f792413c9d64b8f
