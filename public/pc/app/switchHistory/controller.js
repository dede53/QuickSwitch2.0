app.controller('switchHistoryController',  function($scope, $rootScope, socket) {
	/***********************************************
	*	Daten anfordern
	***********************************************/
<<<<<<< HEAD
	socket.emit('switchHistory:get');

=======
	// socket.emit('getSwitchHistory', 24);

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('switchHistory', function(data) {
		$rootScope.switchHistory = data;
	});
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874

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
<<<<<<< HEAD

	$scope.$watch('switchHistory', function(newValue, oldValue){
		$rootScope.chartConfigSwitchHistory.series = newValue;
		$rootScope.chartConfigSwitchHistory.loading = false;
	});

=======
	socket.emit('getSwitchHistoryByID', 24);
	socket.on('switchHistoryByID', function(alldata) {
		if(alldata != false){
			$rootScope.chartConfigSwitchHistory.series.push(alldata);
			$rootScope.chartConfigSwitchHistory.loading = false;
			// $rootScope.chartConfigSwitchHistory.options.yAxis.plotBands.push({
			// 	from: parseInt(alldata.nodeid) - 0.5,
			// 	to: parseInt	(alldata.nodeid) + 0.5,
			// 	color: 'rgba(68, 170, 213, 0.1)',
			// 	label: {
			// 		text: alldata.name,
			// 		style: {
			// 			color: '#606060',
			// 			'size':2
			// 		}
			// 	}
			// });
		}else{
			$rootScope.tempNoData = true;
		}
	});
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
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