app.controller('temperatureController', function($scope, $rootScope, socket){
	console.log("Temperaturen!");
    socket.emit('getSensors');
    socket.on('sensors', function(data){
    	console.log(data);
    	$scope.sensorlist = data;
		var rnd = []
		for (var i = 0; i < 10; i++) {
			rnd.push(Math.floor(Math.random() * 20) + 1)
		}
		$rootScope.chartConfig.series.push({
			id: data[0].id,
			name: data[0].name,
			nodeid: data[0].nodeid,
			
			dashStyle: data[0].line,
			linetype: data[0].linetype,

			type: data[0].chart,
			charttype: data[0].charttype,
			
			color: data[0].linecolor,
			data: rnd
		});
    });

  $scope.chartTypes = [
		{"id": "line", "title": "Line"},
		{"id": "spline", "title": "Smooth line"},
		{"id": "area", "title": "Area"},
		{"id": "areaspline", "title": "Smooth area"},
		{"id": "column", "title": "Column"},
		{"id": "bar", "title": "Bar"},
		{"id": "scatter", "title": "Scatter"}
  ];

  $scope.dashStyles = [
    {"id": "Solid", "title": "Solid"},
    {"id": "ShortDash", "title": "ShortDash"},
    {"id": "ShortDot", "title": "ShortDot"},
    {"id": "ShortDashDot", "title": "ShortDashDot"},
    {"id": "ShortDashDotDot", "title": "ShortDashDotDot"},
    {"id": "Dot", "title": "Dot"},
    {"id": "Dash", "title": "Dash"},
    {"id": "LongDash", "title": "LongDash"},
    {"id": "DashDot", "title": "DashDot"},
    {"id": "LongDashDot", "title": "LongDashDot"},
    {"id": "LongDashDotDot", "title": "LongDashDotDot"}
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
		var seriesArray = $rootScope.chartConfig.series;
		seriesArray.splice(id, 1)
	}
	$scope.saveSensor = function (id) {
		var sensor = $rootScope.chartConfig.series[id];
		socket.emit('saveSensor', sensor);
		console.log(sensor);
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
