app.filter('split', function() {
	return function(input, splitChar, splitIndex) {
		// do some bounds checking here to ensure it has that index
		return input.split(splitChar)[splitIndex];
	}
});
app.filter('returnStatus', function(){
	return function(action){
		if(action.action.switchstatus == 0){
			return action.action.buttonLabelOff;
		}else if(action.action.switchstatus == 1){
			return action.action.buttonLabelOn; 
		}else{
			return "Umschalten"		
		}
	}
});
app.filter('isEmpty', function () {
	var bar;
	return function (obj) {
		for (bar in obj) {
			if (obj.hasOwnProperty(bar)) {
				return false;
			}
		}
		return true;
	};
});