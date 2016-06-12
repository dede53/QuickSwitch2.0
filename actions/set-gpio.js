// var piblaster   = require('pi-blaster.js');
var Gpio 		= require('pigpio').Gpio;
var pins		= {};

process.on('message', function(data) {
	var status = data.status;
	var data = data.data;
	setGPIO(status, data);
});

function setGPIO(status, data){
	console.log(status);
	var status = parseInt(Math.round((255 / 100) * (status * 100)));
	console.log(status);

	if( typeof pins[data.CodeOn] === "undefined"){
		console.log("NEU");
		pins[data.CodeOn] = new Gpio(data.CodeOn, {mode: Gpio.OUTPUT});
		pins[data.CodeOn].pwmWrite(status);
	}else{
		console.log('ALT');
		pins[data.CodeOn].pwmWrite(status);
	}
}