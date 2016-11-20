app.controller('temperatureController', function($scope,$rootScope, socket){	
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