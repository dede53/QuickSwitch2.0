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


#echo "starte den Switchserver"
#forever start SwitchServer.js

#echo "starte den Timerserver"
#forever start timerserver.js

#echo "starte den Countdownserver"
#forever start countdownserver.js

#echo "starte den Datenbankserver"
#forever start server.js
clear
echo "Alles Fertig!!"
echo 
#echo "Die Weboberfläche ist jetzt auf Port 1230 diesen Raspberrys zu erreichen"
echo "Jetzt nur noch die Konfiguration in der Config.json anpassen und die Server starten:"
echo
echo "nano config.js"
echo "Speichern mit Strg + X und dann y"
echo 
echo "server starten mit forever:"
echo "forever start SwitchServer.js"
echo "forever start countdownserver.js"
echo "forever start timerserver.js"
echo "forever start server.js"