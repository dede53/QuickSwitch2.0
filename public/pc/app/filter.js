app.filter('split', function() {
	return function(input, splitChar, splitIndex) {
		// do some bounds checking here to ensure it has that index
		return input.split(splitChar)[splitIndex];
	}
});

app.filter('action', function() {
	return function(x) {
		if(x == 0){
			return 'aus';
		}else if(x == 1){
			return 'an';
		}else if(x == 2 || x == 'toggle'){
			return 'toggle';
		}else{
			return x;
		}
		// do some bounds checking here to ensure it has that index
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
	return function (obj) {
		for (var bar in obj) {
			if (obj.hasOwnProperty(bar)) {
				return false;
			}
		}
		return true;
	};
});