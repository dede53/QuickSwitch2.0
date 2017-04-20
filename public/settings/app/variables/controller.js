app.controller('variableController', function($scope, $rootScope, socket, $uibModal, $location){

	socket.emit('variables:get');

	$scope.deleteVariable = function(data) {
		socket.emit('variable:remove', {"remove":data});	
	}

	$scope.open = function (data) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: './app/variables/template-variable-chart.html',
			controller: 'varChartController',
			size: data.size,
			resolve: {
				variable: function () {
					return data.variable;
				}
			}
		});
		modalInstance.result.catch(function (selectedItem) {
		});
	};
	$scope.saveVariable = function() {
		if($scope.variable != ""){
			console.log($scope.variable);
			socket.emit('variable:save', {
				"name": $scope.variable,
				"status":false,
				"suffix":""
			});
			$location.url("/variables");
		}
	};
	$scope.abortNewVariable = function(){
		$scope.variable = "";
	}
});

app.controller('editVariableController', function($scope, $rootScope, socket, $routeParams){
	/***********************************************
	*	Daten anfordern
	***********************************************/
	$scope.chartTypes = [
		{"id": "line", "title": "Line"},
		{"id": "spline", "title": "Smooth line"},
		{"id": "area", "title": "Area"},
		{"id": "areaspline", "title": "Smooth area"},
		{"id": "column", "title": "Column"},
		{"id": "scatter", "title": "Scatter"}
	];

	$scope.stepTypes = [
		{'id':'', 'title':'Standard'},
		{'id':'center', 'title':'Mitte'},
		{'id':'left', 'title':'Links'},
		{'id':'right', 'title':'Rechts'}
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
	if(!$routeParams.id){
		$scope.title = "hinzufügen";
		$scope.variable = {
			step:false,
			charttype:"line",
			linetype:"solid"
		}
	}else{
		$scope.title = "bearbeiten";
		socket.emit('variable:get', $routeParams.id);
	}
});

app.controller('varChartController', function($scope, $rootScope, socket, variable){
	$scope.tempNoData = false;	
	var chartConfig = {
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
					pointFormat: '<div class="line"><p style="float:left;">{series.name} {point.y:.2f}</p></div>',
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
			loading: true
		}
	$scope.chartConfigSettings = chartConfig;
	socket.emit('variables:storedVariable', {"id":variable.id, "hours":200});
	$scope.$watch('$root.storedVariable', function(newValue, oldValue){
		if(newValue != undefined){
			if(newValue != false){
				$scope.chartConfigSettings.series.push(newValue);
				$scope.chartConfigSettings.loading = false;
			}else{
				$scope.tempNoData = true;
			}
		}
	}, 1000);

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
		var chart = $rootScope.chartConfigSettings.getHighcharts();
		chart.reflow();
	}, 20);
});