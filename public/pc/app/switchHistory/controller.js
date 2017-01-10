app.controller('switchHistoryController',  function($scope, $rootScope, socket) {
	/***********************************************
	*	Daten anfordern
	***********************************************/

	$scope.getSwitchHistory = function(hours){
		console.log(hours);
		$rootScope.switchHistory = [];
		socket.emit('switchHistory:get', hours);
	}
	$scope.value = 24;
	$scope.getSwitchHistory(24);

	var chartConfig = {
		options:{
			title: {
				text: ''
			},
			chart:{
				backgroundColor: 'transparent',
				renderTo:"container",
				zoomType:"x"
			},
			plotOptions: {
				series: {
					lineWidth:5,
					pointStart: Date.UTC(2016, 7, 1),
					pointInterval: 24 * 3600 * 1000 // one day
				}
			},
			legend:{
				itemStyle:{
					fontSize:'17px'
				}
			},
			xAxis:{
				type: 'datetime',
				dateTimeLabelFormats: {
					// second: '%d.%m<br/>%H:%M:%S',
					// minute: '%d.%m<br/>%H:%M',
					// hour: '%d.%m<br/>%H:%M',
					// day: '%d.%m<br/>%H:%M',
					week: '%d.%m.%Y',
					month: '%m.%Y',
					year: '%Y'
				},
				opposite:true
			},
			yAxis: {
				visible:false,
				plotBands: []
			}
			
		},

		series: [],
		loading:true
	}
	$rootScope.chartConfigSwitchHistory = chartConfig;

	$scope.$watch('switchHistory', function(newValue, oldValue){
		$rootScope.chartConfigSwitchHistory.series = newValue;
		$rootScope.chartConfigSwitchHistory.loading = false;
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
	setTimeout(function(){
		var chart = $rootScope.chartConfigSwitchHistory.getHighcharts();
		chart.reflow();
	}, 200);
});