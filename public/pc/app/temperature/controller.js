app.controller('temperatureController', function($scope,$rootScope, socket){
	$scope.getTempHistory = function(hours){
		$scope.value = hours;
		$rootScope.varChart = [];
		$scope.varChart.loading = true;
		socket.emit('variables:chart', {user:$rootScope.activeUser.id, hours: hours});
	}
	$scope.value = 24;
	$scope.getTempHistory(24);

	var chartConfig = {
		options:{
			chart: {
				backgroundColor: 'transparent',
				renderTo:"container",
				zoomType:"x"
			},
			plotOptions: {
				series: {
					marker:{
						enabled: false
					},
	                animation: false
				}
			},
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
					second: '%d.%m<br/>%H:%M:%S',
					minute: '%d.%m<br/>%H:%M',
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
			useHighStocks: true
		},
		series: [],
		loading: true
	}
	$scope.varChart = chartConfig;

	$scope.$watch('$root.varChart', function(newValue, oldValue){
		$scope.varChart.series = newValue;
		$scope.varChart.loading = false;
	});
	Highcharts.setOptions({
		global : {
			useUTC : false
		},
		lang : {
			loading: "Lade Daten..",
			rangeSelectorZoom: ""
		}
	});
});