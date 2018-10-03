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

#######################################################
#	git clone https://github.com/dede53/QuickSwitch2.0
#	cd QuickSwitch2.0
#	sudo chmod +x install.sh
#	sudo ./install.sh
#######################################################



clear
echo "Dieses Skript installiert:"
echo "QuickSwitch"
echo "| -- node.js/npm"
echo "| -- mysql"
echo "| -- git"
echo "| -- pi-blaster"
echo
echo "Soll ein Update des Systems vorgenommen werden? (y / n)"
read updateanswer
if [ $updateanswer == 'y' ]
then
	echo "update die Packetquellen"
	sudo apt-get update
	echo "Upgrade das system"
	sudo apt-get -y upgrade
fi
echo "Installiere mysql"
sudo apt-get -y install mysql-server mysql-client autoconf
echo

echo "Soll Node.js installiert werden? (y / n)"
read nodeanswer
if [ $nodeanswer == 'y' ]
then
	# echo "Lade Node.js-latest herrunter"
	# wget http://node-arm.herokuapp.com/node_latest_armhf.deb
	echo "installiere Node.js"
	# sudo dpkg -i node_latest_armhf.deb
	curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
	sudo apt-get install -y nodejs
fi


echo
pwd
cd ../
pwd
echo
# echo "Soll der pi-blaster-deamon zum dimmen der GPIO-Ports installiert werden? (y / n | default: y)"
# read piblaster
# if [ $piblaster == 'y' ]
# then
# 	# echo "Installiere pi-blaster-deamon zum dimmen der GPIO-Ports"
# 	# git clone https://github.com/sarfata/pi-blaster.git
# 	# cd pi-blaster
# 	# ./autogen.sh
# 	# ./configure
# 	# make
# 	# sudo make install
# 	# sudo ./pi-blaster
# 	# echo "Der pi-blaster-deamon wurde fertig installiert"
# 	# echo
# 	echo "Installiere pigpiod zum dimmen der GPIO-Ports"
# 	wget https://github.com/joan2937/pigpio/archive/master.zip
# 	unzip master.zip
# 	cd pigpio-master
# 	make -j4
# 	sudo make install

# 	echo 'pigpiod wurde installiert'
# 	echo
# 	pwd
# 	cd ../
# fi


pwd
echo

cd QuickSwitch2.0
echo "Installiere abhängigkeiten"
sudo npm install

echo "lege die Datenbank an..."

mysqluser='root'
mysqlhost='localhost'
echo "Als Datenbank Benutzer wird "$mysqluser" verwendet."

echo "Geben Sie bitte das root-password ihrer Datenbank( MySQL - Das von eben :P ) ein:"
read mysqlpassword
echo "Danke!"
echo "CREATE USER 'QuickSwitch'@'localhost' IDENTIFIED BY '"$mysqlpassword"';" | mysql -h localhost -u root -p$mysqlpassword
mysql -u QuickSwitch -p$mysqlpassword < SmartHome.sql
echo "Datenbank angelegt"
sleep 3
clear
quickswitchport="3333"
localip=$(ip addr | grep 'state UP' -A2 | tail -n1 | awk '{print $2}' | cut -f1  -d'/')


echo "QuickSwitch-Konfiguration"
echo
echo
echo 
echo "Wollen sie den SwitchServer manuell einrichten? (y / n) (default: n)"
read switchserveranswer

switchserverport="4040"
switchserverip=$localip
if [ $switchserveranswer == 'y' ]
then
	echo "Geben Sie die IP-Adresse des SwitchServers ein:"
	read switchserverip
	echo "Geben Sie den Port des Switchservers ein (default: 4040):"
	read switchserverport
	echo "Der SwitchServer ist fertig konfiguriert!"
fi
echo

git clone https://github.com/dede53/qs-SwitchServer SwitchServer
mkdir SwitchServer/settings/ 
echo '{
	"port":"'$switchserverport'",
	"ip":"'$switchserverip'",
	"name": "Switchserver",
	"loglevel": 1,
    "maxLogMessages": 200,
    "QuickSwitch":{
        "ip":"'$localip'",
        "port":'$quickswitchport'
    }
}' > SwitchServer/settings/adapter.json

echo
echo "Ermittle die IP-Adresse des Servers..."
echo "Folgende IP gefunden:"
echo $localip
echo "Der aktuelle Port für die Weboberfläche ist:" 
echo $quickswitchport
echo

echo "Die Koniguration wurde erfolgreich abgeschlossen!"
echo
echo '{"switchserver": [{
		"id": 0,
		"ip": "'$switchserverip'",
		"port": "'$switchserverport'"
	}],
	"loglevel":1,
	"mysql": {
		"host": "'$mysqlhost'",
		"user": "'$mysqluser'",
		"password": "'$mysqlpassword'"
	},
	"QuickSwitch": {
		"ip": "'$localip'",
		"port": "'$quickswitchport'"
	}}' > config.json

pwd
echo
echo "Sie können jetzt QuickSwitch starten indem sie 'node index.js' auf der konsole ausführen."
echo "Im Browser ist sie dann unter http://"$localip":"$quickswitchport" erreichbar."
