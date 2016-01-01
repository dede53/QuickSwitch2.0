#! /bin/bash



# apt-get update
# apt-get upgrade -y
## Dieses Script ausführbar machen:
## chmod +x /home/pi/install.sh
##
## Script mit 'sudo ./install.sh' ausführen
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

cd ../
echo "Installiere pi-blaster-deamon zum dimmer der GPIO-Ports"
git clone https://github.com/sarfata/pi-blaster.git
cd pi-blaster
./autogen.sh
./configure
make
sudo make install
sudo ./pi-blaster

cd ../
cd QuickSwitch2.0
echo "Installiere abhängigkeiten"
sudo npm install
sudo npm install forever -g

echo "lege die Datenbank an..."
mysql -u root -p < SmartHome.sql


echo "starte den Switchserver"
forever start SwitchServer.js

echo "starte den Timerserver"
forever start timerserver.js

echo "starte den Countdownserver"
forever start countdownserver.js

echo "starte den Datenbankserver"
forever start server.js

echo "Alles Fertig!!"
echo 
echo "Die Weboberfläche ist jetzt auf Port 1230 diesen Raspberrys zu erreichen"
echo