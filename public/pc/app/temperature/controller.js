app.controller('temperatureController', function($scope,$rootScope, socket){

    socket.emit('getSensorvalues', {"date":"all"});

    var chartConfig = {
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
                        rotation: -45
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
    

    /*
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
	*/
	
       $rootScope.chartConfig = chartConfig;
    socket.on('Sensorvalues', function(data) {

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
        console.log(hours);
        socket.emit('getSensorvalues', {"date":hours});
    }
});