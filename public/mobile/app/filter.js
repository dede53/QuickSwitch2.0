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
});