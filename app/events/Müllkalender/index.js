var ical 			= require('ical');
var helper 			= require('./../../functions/helper.js');
var months 			= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var status 			= {};
// helper.setVariable('Müll', 'false');

function checkWaste(){
	helper.log.info("Checke den Kalender");
	var data = ical.parseFile(__dirname + '/data.ics');
	var today = new Date();
	var todaysDay = today.getDate();
	var todaysMonth = today.getMonth();
	var tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
	var tomorrowsDay = tomorrow.getDate();
	var tomorrowsMonth = tomorrow.getMonth();
	var dayAfterTomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
	var dayAfterTomorrowsDay = tomorrow.getDate();
	var dayAfterTomorrowsMonth = tomorrow.getMonth();
	for (var k in data){
		if(data.hasOwnProperty(k)){
			var ev = data[k];
			if(ev.start.getDate() == dayAfterTomorrowsDay && ev.start.getMonth() == dayAfterTomorrowsMonth){
				if(ev.summary != status.dayAfterTomorrow){
					helper.setVariable('Müll-morgen', ev.summary);
					status.dayAfterTomorrow = ev.summary;
				}
			}else if(ev.start.getDate() == todaysDay && ev.start.getMonth() == todaysMonth){
				status.dayAfterTomorrow = false;
				helper.setVariable('Müll-morgen', false);
			}
			if(ev.start.getDate() == tomorrowsDay && ev.start.getMonth() == tomorrowsMonth){
				if(ev.summary != status.tomorrow){
					helper.log.info('Müll raus:' + ev.summary);
					helper.setVariable('Müll', ev.summary);
					status.tomorrow = ev.summary;
				}else{
					helper.log.debug('Kein veränderter Eintrag!');
				}
			}else if(ev.start.getDate() == todaysDay && ev.start.getMonth() == todaysMonth){
				status.tomorrow = false;
				helper.log.info('heute war Müll: ' + ev.summary);
				helper.setVariable('Müll', false);
			}
		}
	}
}
checkWaste();
helper.cron('2 * * * *', checkWaste, 'Müll');
// setInterval(checkWaste, 60000);