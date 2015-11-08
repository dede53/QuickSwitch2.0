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
                useHighStocks: true
            },
            series: [],
            loading: true
        }
	
    $rootScope.chartConfig = chartConfig;

    socket.on('Sensorvalues', function(data) {

		var sensor = {
			id: data.nodeID,
			name: data.name,
			data: data.data,
			type: data.charttype,
            dashStyle: data.linetype,
			yAxis: 0,
			connectNulls:false,
			tooltip: {
				valueSuffix: ' °C'
			},
			color:  data.farbe
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