var Gpio 		= require('pigpio').Gpio;
var gpio 		= {};

process.on('message', function(data) {
	var status = data.status;
	var data = data.data;
	setGPIO(status, data);
});

function setGPIO(status, data){
	// 0 - 765
	// Rot: 638		765/0	128 - 	383
	//		0		128		255		0
	var status = new Object;
	var value = parseInt(data.status);
	if(value >= 0 && value <= 128){
		status.red = 128 + value;
		status.blue = 0;
		status.green = 128 - value;
	}else if(value > 128 && value <= 255){
		status.red = 255 - (value - 128);
		status.blue = value - 128;
		status.green = 0;
	}else if(value > 255 && value <= 383){
		status.red = 255 - (value - 128);
		status.blue = value - 128;
		status.green = 0;
	}else if(value > 383 && value <= 638){
		status.red = 0;
		status.blue = 255 - (value - 383);
		status.green = value - 383;
	}else if(value > 638 && value <= 765){
		status.red = value - 638;
		status.blue = 0;
		status.green = 255 - (value - 638);
	}

	try{
		console.log(data);
		var pins = JSON.parse(data.CodeOn);
		var colors = [red, blue, green];
		try{
			colors.forEach(function(i){
					if(gpio[pins[i]]){
						gpio[pins[i]].pwmWrite(status[i]);
					}else{
						gpio[pins[i]] = new Gpio(pins[i], {mode: Gpio.OUTPUT});
						gpio[pins[i]].pwmWrite(status[i]);
					}
			});
		}catch(err){
			console.log(err + "Kann keine Pins setzen!");
		}
	}catch(e){
		console.log("Falsche Pins angegeben!");
	}
}