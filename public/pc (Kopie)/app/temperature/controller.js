app.controller('temperatureController', function($scope,$rootScope, socket){	
	// if($rootScope.varChart === undefined){
	// 	$rootScope.tempNoData = false;
	// 	var chartConfig = {
	// 			options:{
	// 				chart: {
	// 					backgroundColor: 'transparent',
	// 					renderTo:"container",
	// 					zoomType:"x"
	// 				},
	// 				navigator: {
	// 					enabled: false,
	// 					adaptToUpdatedData: true,
	// 					series: []
	// 				},
	// 				rangeSelector: {
	// 					enabled: false,
	// 					inputStyle: {
	// 						fontSize: "16px"
	// 					},
	// 		            buttonTheme: {
	// 						style: {
	// 							fontSize: "16px"
	// 						},
	// 					},
	// 					labelStyle: {
	// 						fontSize: "16px"
	// 					},
	// 					buttons: [{
	// 						type: 'hour',
	// 						count: '12',
	// 						text: '12h'
	// 					}, {
	// 						type: 'hour',
	// 						count: '24',
	// 						text: '24h'
	// 					},{
	// 						type: 'all',
	// 						count: 'all',
	// 						text: 'Alle'
	// 					}],
	// 					selected: 2,
 //            			inputDateFormat: '%e %b %Y',
 //            			inputEditDateFormat: '%e %b %Y'
	// 				},
	// 				plotOptions: {
	// 					series: {
	// 						marker:{
	// 							enabled: false
	// 						},
	// 		                animation: false
	// 					}
	// 				},
	// 				xAxis: [{
	// 					type: 'datetime',
	// 					labels:{
	// 						rotation: 0,
	// 						style: {
	// 							"color": '#80a3ca',
	// 							"fontSize": "16px"
	// 						}
	// 					},
	// 					dateTimeLabelFormats: {
	// 						second: '%d.%m<br/>%H:%M:%S',
	// 						minute: '%d.%m<br/>%H:%M',
	// 						hour: '%d.%m<br/>%H:%M',
	// 						day: '%d.%m<br/>%H:%M',
	// 						week: '%d.%m.%Y',
	// 						month: '%m.%Y',
	// 						year: '%Y'
	// 					}
	// 				}],
	// 				yAxis: [{
	// 					allowDecimals: true,
	// 					title: {
	// 						text: 'Temperatur',
	// 						style: {
	// 							"color": '#80a3ca',
	// 							"fontSize": "16px"
	// 						}
	// 					},
	// 					labels: {
	// 						format: '{value}',
	// 						style: {
	// 							"color": '#80a3ca',
	// 							"fontSize": "16px"
	// 						}
	// 					},
	// 					plotLines: [/*{
	// 						value: 5,
	// 						color: '#444488',
	// 						dashStyle: 'shortdash',
	// 						width: 2,
	// 						label: {
	// 							text: '5°C'
	// 						}
	// 					}*/]
	// 				},/*
	// 				{
	// 					allowDecimals: true,
	// 					title: {
	// 						text: 'Luftfeuchtigkeit',
	// 						style: {
	// 							"color": '#80a3ca',
	// 							"fontSize": "16px"
	// 						}
	// 					},
	// 					labels: {
	// 						format: '{value}',
	// 						style: {
	// 							"color": '#80a3ca',
	// 							"fontSize": "16px"
	// 						}
	// 					},
	// 					opposite: true
	// 				}*/],

	// 				legend: {
	// 					enabled: true,
	// 					itemStyle: {
	// 						"fontSize": "16px"
	// 					}
	// 				},
	// 				title: {
	// 					text: ''
	// 				},
	// 				credits: {
	// 					enabled: false
	// 				},
	// 				tooltip: {
	// 					headerFormat: '<div class="header">{point.key}</div>',
	// 					pointFormat: '<div class="line"><p style="float:left;">{series.name} {point.y:.2f}</p></div>',
	// 					borderWidth: 1,
	// 					borderRadius: 5,
	// 					borderColor: '#a4a4a4',
	// 					shadow: false,
	// 					useHTML: true,
	// 					backgroundColor: "rgba(255,255,255,1)",
	// 					style: {
	// 						padding: 5,
	// 						zIndex: 100
	// 					},
	// 					shared: false
	// 				},
	// 				useHighStocks: true
	// 			},
	// 			series: [],
	// 			loading: true
	// 		}
	// 	$scope.varChart = chartConfig;
	// }

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