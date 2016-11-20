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

app.config(function($mdIconProvider) {
	$mdIconProvider.iconSet('social', 'img/icons/sets/social-icons.svg', 24).defaultIconSet('img/icons/sets/core-icons.svg', 24);
});