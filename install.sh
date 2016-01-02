#! /bin/bash

#######################################################
## QuickSwitch2.0
## Smarthomesystem auf Basis von Node.js Angular.js und vielen weiteren npm-Packeten
##
## Weitere Informationen:
## https://github.com/dede53/QuickSwitch2.0
##
## Installation:
## Dieses Script ausführbar machen und im Anschluss mit sudo starten:
## chmod +x /home/pi/install.sh
## sudo ./install.sh
#######################################################
clear
echo "Dieses Skript installiert:"
echo "QuickSwitch"
echo "| -- node.js/npm"
echo "| -- mysql"
echo "| -- git"
echo "| -- pi-blaster"
echo
echo "update die Packetquellen"
sudo apt-get update
echo "Upgrade das system"
sudo apt-get -y upgrade
echo "Installieren git und mysql"
sudo apt-get -y install git mysql-server mysql-client autoconf

echo "Lade node-latest herrunter"
wget http://node-arm.herokuapp.com/node_latest_armhf.deb
echo "installieren node"
sudo dpkg -i node_latest_armhf.deb

echo
pwd
cd ../
pwd
echo
echo "Installiere pi-blaster-deamon zum dimmen der GPIO-Ports"
git clone https://github.com/sarfata/pi-blaster.git
cd pi-blaster
./autogen.sh
./configure
make
sudo make install
sudo ./pi-blaster

echo
pwd
cd ../
pwd
echo

cd QuickSwitch2.0
echo "Installiere abhängigkeiten"
sudo npm install
sudo npm install forever -g

echo "lege die Datenbank an..."
echo "Dazu gebe bitte das Passwort der MySQL Installation ein:"
mysql -u root -p < SmartHome.sql
echo "Datenbank angelegt"
sleep(3)
clear
quickswitchport="1230"
localip=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1')


echo "QuickSwitch-Konfiguration"
echo
echo "Soll ein Connairgateway eingerichtet werden? (y / n)"
read connairanswer
if [ $connairanswer == 'y' ]
then
	echo "Geben Sie die IP-Adresse ihres Connairgateways ein:"
	read connairip
	echo "Geben Sie den Port ihres Connairgateways ein (default: 49880):"
	read connairport
	echo "Das Connairgateway ist fertig konfiguriert!"
fi
echo
echo 
echo "Soll eine Fritzbox eingerichtet werden? (y / n)"
read fritzboxanswer
if [ $fritzboxanswer == 'y' ]
then
	echo "Geben sie die IP-Adresse der Fritzbox ein:"
	read fritzboxip
	echo "Geben Sie den Benutzername der Fritzbox ein:"
	read fritzboxuser
	echo "Geben Sie das Passwort für den Fritzboxbenutzer ein:"
	read fritzboxpassword
	echo "Die Fritzbox ist fertig konfiguriert!"
fi
echo 
echo "Wollen sie den SwitchServer manuell einrichten? (y / n) (default: n)"
read switchserveranswer
if [ $switchserveranswer == 'y' ]
then
	echo "Geben Sie die IP-Adresse des SwitchServers ein:"
	read switchserverip
	echo "Geben Sie den Port des Switchservers ein (default: 4040):"
	read switchserverport
	echo "Der SwitchServer ist fertig konfiguriert!"
else
	switchserverport="4040"
	switchserverip=$localip
fi
echo
echo
echo "Ermittle die IP-Adresse des Servers..."
echo "Folgende IP gefunden:"
echo $localip
echo "Der aktuelle Port für die Weboberfläche ist:" 
echo $quickswitchport
echo

echo "Die Koniguration wurde erfolgreich abgeschlossen!"
echo
echo '{
	"connair": {
		"ip":"'$connairip'",
		"port":"'$connairport'"
	},
	"switchserver": [{
		"id": "1",
		"ip": "'$switchserverip'",
		"port": "'$switchserverport'"
	}],
	"QuickSwitch": {
		"ip": "'$localip'",
		"port" "'$quickswitchport'"
	},
	"fritzbox": {
		"ip": "'$fritzboxip'",
		"user": "'$fritzboxuser'",
		"password": "'$fritzboxpassword'"
	} 
}' > config.json

pwd
echo
echo "starte den Switchserver"
forever start SwitchServer.js

echo "starte den Timerserver"
forever start timerserver.js

echo "starte den Countdownserver"
forever start countdownserver.js

echo "starte den Datenbankserver"
forever start server.js