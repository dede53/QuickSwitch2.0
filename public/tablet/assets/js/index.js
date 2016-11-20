function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return "";
}

function chart(){
	this.options = {
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
							text: '',
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
					},/*
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
					}*/],

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
				}
	this.series =  [];
	this.loading = true;
	this.setLoading = function(status){
		this.loading = status;
	}
	this.setSeries = function(data){
		this.series = data;
	}
}