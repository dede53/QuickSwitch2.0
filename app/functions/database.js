var sqlite3 		= require('sqlite3').verbose();
var db 				= new sqlite3.Database('abc.db');

// Tabelle für Geräte anlegen
db.run("CREATE TABLE if not exists [devices] ([deviceid] INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL,[status] TEXT  NULL,[name] TEXT  NOT NULL,[protocol] TEXT  NOT NULL,[buttonLabelOn] TEXT  NOT NULL,[buttonLabelOff] TEXT  NOT NULL,[CodeOn] TEXT,[CodeOff] TEXT,[roomid] TEXT);");

// Tabelle für Diagrammtypen anlegen
db.run("CREATE TABLE if not exists [charttypen] ([id] INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL,[name] VARCHAR(30)  UNIQUE NOT NULL,[chart] VARCHAR(20)  UNIQUE NOT NULL);");

// Tabelle für Linientypen anlegen
db.run("CREATE TABLE if not exists [linetypen] ([id] INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,[name] VARCHAR(30)  UNIQUE NOT NULL,[line] VARCHAR(20)  UNIQUE NOT NULL);");

// Tabelle für Nachrichten anlegen
db.run("CREATE TABLE if not exists [messages] ([id] INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL,[time] VARCHAR(20)  NULL,[type] INTEGER  NOT NULL,[author] VARCHAR(20)  NOT NULL,[message] VARCHAR(400)  NOT NULL);");

// Tabelle für Benachrichtigungstypen anlegen
db.run("CREATE TABLE if not exists [messagetypen] ([id] INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,[type] VARCHAR(20)  UNIQUE NOT NULL);");

// Tabelle für Räume anlegen
db.run("CREATE TABLE if not exists [rooms] ([id] INTEGER  NOT NULL PRIMARY KEY,[name] TEXT  NOT NULL);");

// Tabelle für Sensordaten anlegen
db.run("CREATE TABLE if not exists [sensor_data] ([id] INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL,[time] VARCHAR(20)  NULL,[nodeID] INTEGER  NULL,[supplyV] VARCHAR(20)  NULL,[temp] VARCHAR(20)  NULL,[hum] VARCHAR(20)  NULL);");

// Tabelle für Sensoren anlegen
db.run("CREATE TABLE if not exists [sensors] ([id] INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL,[nodeID] VARCHAR(20)  NULL,[charttype] VARCHAR(10)  NULL,[linetype] VARCHAR(10)  NULL,[name] VARCHAR(50)  NULL,[description] VARCHAR(300)  NULL,[linecolor] VARCHAR(6)  NULL,[visibility] INTEGER(10)  NULL);");

// Tabelle für Benutzer anlegen
db.run("CREATE TABLE if not exists [user] ([id] INTEGER  PRIMARY KEY NOT NULL,[name] TEXT  NULL,[anwesend] INTEGER  NULL,[password] VARCHAR(20)  NULL,[favoritDevices] VARCHAR(900)  NULL);");

// Tabelle für Countdowns anlegen
db.run("CREATE TABLE if not exists [countdowns] ([id] INTEGER  PRIMARY KEY AUTOINCREMENT NOT NULL,[type] VARCHAR(20)  NOT NULL,[time] VARCHAR(20)  NOT NULL,[switchid] INTEGER  NOT NULL,[status] INTEGER  NOT NULL);");

// Tabelle für Countdowntypen anlegen
db.run("CREATE TABLE if not exists [countdowntypen] ([id] INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,[type] VARCHAR(20)  UNIQUE NOT NULL);");


module.exports = db;