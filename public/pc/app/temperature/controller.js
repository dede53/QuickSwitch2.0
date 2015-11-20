app.controller('temperatureController', function($scope,$rootScope, socket){

    socket.emit('getSensorvalues', {"date":"all"});

    var chartConfig = {
            options:{
                chart: {
                    backgroundColor: 'transparent'
                },
                navigator: {
                    enabled: true,
                    adaptToUpdatedData: true,
                    series: []
                },
                rangeSelector: {
                    enabled: true,
                    buttons: [{
                        type: 'hour',
                        count: '12',
                        text: '12H'
                    }, {
                        type: 'hour',
                        count: '24',
                        text: '24H'
                    },{
                        type: 'all',
                        count: 'all',
                        text: 'Alle'
                    }]
                    /*
                    buttons: [{
                        type: 'day',
                        text: 'Day'
                    }, {
                        type: 'day',
                        count: '2',
                        text: '2Day'
                    }, {
                        type: 'day',
                        count: '3',
                        text: '3Day'
                    }, {
                        type: 'week',
                        count: '1',
                        text: 'Week'
                    },{
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }]
                    */
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

    socket.on('Sensorvalues', function(alldata) {
        alldata.forEach(function(data){

            console.log("Neue Daten");
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
                color: data.farbe
            };
            var navigator = {
                id: data.nodeID,
                data: data.data
            };
            
            $scope.chartConfig.options.navigator.series.push(navigator);
            $scope.chartConfig.series.push(sensor);
            $scope.chartConfig.loading = false;
        });
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