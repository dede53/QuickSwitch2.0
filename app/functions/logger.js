var events						=	require('events');
var fs                          =   require('fs');

var createDir = function(name){
    if(!fs.existsSync(name)){
        fs.mkdirSync(name, 0755, function(err){
            if(err){
                adapter.log.error("mkdir " + name + ": failed: " + err);
			}else{
                adapter.log.info(name + " wurde erstellt");
			}
		});
	}
}

createDir("./log");

function log(config){
    events.EventEmitter.call(this);
    this.logFile                     =   fs.createWriteStream( "./log/debug-master.log", {flags : 'w'});
    this.loglevel = config.loglevel;
    this.errors   = [];
    this.newMessage = function(type, message){
        if(typeof message === "object"){
            var message = JSON.stringify(message);
        }else{
            var message = message.toString();
        }
        var datum = new Date().toLocaleString();
        var data = {
                        "time": datum,
                        "message": message,
                        "type":type
                    };

        var logNow = false;
        // if(type == '4'){
        //     logNow = true;
        // }
        // if(loglevel == '1'){
        //     logNow = true;
        // }
        // if(loglevel == '2'){

        // }
        switch(type){
            case 1:
                if(this.loglevel == '1'){
                    logNow = true;
                    console.log(datum +": "+ message);
                }
                break;
            case 2:
                if(this.loglevel <= 2){
                    logNow = true;
                    console.log(datum +": "+ message);
                }
                break;
            case 3:
                if(this.loglevel <= 3){
                    logNow = true;
                    console.log('\x1b[33m' ,datum +": "+ message, "\x1b[0m");
                }
                break;
            default:
                console.log('\x1b[31m' , datum +": "+ message, "\x1b[0m");
                loglevel = true;
                break;
        }
        
        // if(this.loglevel == '4' && type == '4'){             // Error
        //     this.emit("error", data);
        //     console.log('\x1b[31m' , datum +": "+ message, "\x1b[0m");
        //     console.log('\x1b[36m', 'sometext' ,'\x1b[0m');
        //     var logNow = true;
        // }else if(this.loglevel == '3' && type >= '3'){       // Warning
        //     console.log('\x1b[31m' ,datum +": "+ message, "\x1b[0m");
        //     this.emit("warning", data);
        //     var logNow = true;
        // }else if(this.loglevel == '2' && type >= '2'){       // Debug
        //     console.log( '\x1b[31m' ,datum +": "+ message, "\x1b[0m");
        //     this.emit("debug", data);
        //     var logNow = true;
        // }else{                                          // Info
        //     console.log(datum +": "+ message);
        //     this.emit("info", data);
        //     var logNow = true;
        // }
        this.emit("all", data);

        if(logNow){
            // Loggen!
            this.logFile.write(new Date().toLocaleString() +": "+ message + "\n");
            
            this.errors.push(data);
            if(this.errors.length > 100){
                this.errors.splice(0,1);
            }
        }

        
    }
}

log.prototype.__proto__ = events.EventEmitter.prototype;

log.prototype.info = function(data){
    this.newMessage(1,data);
}

log.prototype.debug = function(data){
    this.newMessage(2,data);
}

log.prototype.warning = function(data){
    this.newMessage(3,data);
}

log.prototype.error = function(data){
        if(typeof data == 'object'){
            switch(data.code){
                case "EHOSTUNREACH":
                    this.newMessage(4, "Ziel nicht erreichbar: " + data.address + ":" + data.port);
                    break;
                case "ECONNREFUSED":
                    this.newMessage(4, "Ziel hat die Anfrage abgelehnt: " + data);
                    break;
                default:
                    this.newMessage(4,data.code + ":" + data.address+ ":" + data.port);
                    break;
            }
        }else{
            this.newMessage(4,data);
        }
}

module.exports = log;