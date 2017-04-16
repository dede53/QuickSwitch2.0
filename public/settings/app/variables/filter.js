// app.filter('filterVariableNames', function () {
// 	return function (items, search) {
// 		var result = {};
// 		angular.forEach(items, function(value, key){
// 			var lowKey = key.toLowerCase();
// 			if(lowKey.startsWith(search.toLowerCase())){
// 				if(key.includes('.')){
// 					var splittedKey = key.split('.');
// 					var key = splittedKey[1];
// 				}
// 				result[key] = value;
// 			}
// 		});
// 		return result;
// 	}
// });