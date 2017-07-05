// var util = require("util");
// var events = require("events");

// function base(){
// 	console.log("open");
// }
// base.prototype = new events.EventEmitter();
// // var createTimer = base.prototype.createTimer;
// var createTimer = function(){
// 	console.log("createTimer");	
// };
// createTimer.prototype.test = function(){
// 	this.emit("myEvent","Moin1");
// }
// base.prototype.test  = function(){
// 	this.emit("myEvent","Moin");
// 	var that = this;
// 	setTimeout(function(){
// 		that.emit("myEvent","Moin");
// 	}, 1000);
// }

// base.prototype.createTimer = createTimer;
// // util.inherits(base,event);
// // util.inherits(base,createTimer);

// var startEvent = new base();
// console.log(startEvent);
// var newTimer = new startEvent.createTimer();
// startEvent.on("myEvent",function(data){
// 	console.log(data);
// 	console.log("data");
// });

var util = require("util");
var events = require("events");
var moin = new events.EventEmitter();

moin.on("myEvent",function(data){
	console.log(data);
});

function base(event){
	this.event = event;
	event.emit("myEvent", "Base");
	this.event.emit("myEvent", "Base");
}


var createTimer = function(event){
	this.event = event;
	this.event.emit("myEvent", "createTimer");
};

createTimer.prototype.test = function(){
	this.event.emit("myEvent","createTimer.test");
}

base.prototype.createTimer = createTimer;



var startEvent 	= new base(moin);
var newTimer 	= new startEvent.createTimer(moin);
	newTimer.test();
var newTimer2 	= new startEvent.createTimer(moin);
	newTimer2.test();