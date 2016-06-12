/*
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
				data: rnd,
				yAxis: 0,
				connectNulls: true,
				marker: {
					symbol: "diamond",
					radius: 3
				},
				tooltip: {
					valueSuffix: " °C"
				}
			});

    	});
    });
*/
app.controller('temperatureController', function($scope, $rootScope, socket){
	socket.emit('getStoredVariables', {"variables":false});
	socket.on('storedVariables', function(alldata) {
		if(alldata != false){
			$rootScope.chartConfig.series.push(alldata);
			$rootScope.chartConfig.loading = false;
		}else{
			$rootScope.tempNoData = true;
		}
	});

	socket.on('storedVariable', function(data) {
		if(data != false){
			for(var i = 0; i < $rootScope.chartConfig.series.length; i++ ){
				if(data.nodeid == $rootScope.chartConfig.series[i].nodeid){
					$rootScope.chartConfig.series[i] = data;
					$rootScope.chartConfig.loading = false;
				}
			}
		}
	});
// });

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
						backgroundColor: 'transparent',
						renderTo:"container",
						zoomType:"x"
					},
					navigator: {
						enabled: false,
						adaptToUpdatedData: true,
						series: []
					},
					rangeSelector: {
						enabled: false,
						inputStyle: {
							fontSize: "16px"
						},
			            buttonTheme: {
							style: {
								fontSize: "16px"
							},
						},
						labelStyle: {
							fontSize: "16px"
						},
						buttons: [{
							type: 'hour',
							count: '12',
							text: '12h'
						}, {
							type: 'hour',
							count: '24',
							text: '24h'
						},{
							type: 'all',
							count: 'all',
							text: 'Alle'
						}],
						selected: 2,
            			inputDateFormat: '%e %b %Y',
            			inputEditDateFormat: '%e %b %Y'
					},
					plotOptions: {
						series: {
							marker:{
								enabled: false
							},
			                animation: false
						}
					},
					exporting: false,
					xAxis: [{
						type: 'datetime',
						labels:{
							rotation: 0,
							style: {
								"color": '#80a3ca',
								"fontSize": "16px"
							}
						},
						dateTimeLabelFormats: {
							second: '%Y-%m-%d<br/>%H:%M:%S',
							minute: '%Y-%m-%d<br/>%H:%M',
							hour: '%d.%m<br/>%H:%M',
							day: '%d.%m<br/>%H:%M',
							week: '%d.%m.%Y',
							month: '%m.%Y',
							year: '%Y'
						}
					}],
					yAxis: [{
						allowDecimals: true,
						title: {
							text: 'Temperatur',
							style: {
								"color": '#80a3ca',
								"fontSize": "16px"
							}
						},
						labels: {
							format: '{value}',
							style: {
								"color": '#80a3ca',
								"fontSize": "16px"
							}
						},
						plotLines: [/*{
							value: 5,
							color: '#444488',
							dashStyle: 'shortdash',
							width: 2,
							label: {
								text: '5°C'
							}
						}*/]
					},
					{
						allowDecimals: true,
						title: {
							text: 'Luftfeuchtigkeit',
							style: {
								"color": '#80a3ca',
								"fontSize": "16px"
							}
						},
						labels: {
							format: '{value}',
							style: {
								"color": '#80a3ca',
								"fontSize": "16px"
							}
						},
						opposite: true
					}],

					legend: {
						enabled: true,
						itemStyle: {
							"fontSize": "16px"
						}
					},
					title: {
						text: ''
					},
					credits: {
						enabled: false
					},
					tooltip: {
						headerFormat: '<div class="header">{point.key}</div>',
						pointFormat: '<div class="line"><p style="float:left;">{series.name} {point.y}</p></div>',
						borderWidth: 1,
						borderRadius: 5,
						borderColor: '#a4a4a4',
						shadow: false,
						useHTML: true,
						backgroundColor: "rgba(255,255,255,1)",
						style: {
							padding: 5,
							zIndex: 100
						},
						shared: false
					},
					useHighStocks: true
				},
				series: [],
				loading: false
			}
});


app.controller('editSensorController',  function($scope, $rootScope, socket, $routeParams) {
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
	/***********************************************
	*	Daten anfordern
	***********************************************/
	if(!$routeParams.id){
			$scope.editSensor = {
				title: "hinzufügen"
			}
	}else{
		socket.emit('getSensor', {"id":  $routeParams.id});

		/***********************************************
		*	Daten empfangen, Scope zuordnen
		***********************************************/
		socket.on('sensor', function(data) {
			if(data.constructor === Array){

				$scope.editSensor = {
					title: "bearbeiten",
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
			console.log($scope.editSensor.sensorlist);
			socket.emit('saveSensor', $scope.editSensor.sensorlist);
			$location.url("/temperature");
		};
		socket.on('savedDevice', function(data){
			alert("Antwort:" + data);
		});
});