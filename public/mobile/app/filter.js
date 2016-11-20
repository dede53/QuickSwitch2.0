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
		}else{
			return 'an';
		}
		// do some bounds checking here to ensure it has that index
	}
<<<<<<< HEAD
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
=======
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
});