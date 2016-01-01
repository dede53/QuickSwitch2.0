#include <RCSwitch.h>
#include <SPI.h>           // needed for Arduino versions later than 0018
#include <Ethernet.h>
#include <EthernetUdp.h>   // Arduino 1.0 UDP library
#include <string.h>
#include <stdlib.h>
#include <IRremote.h>
#include <WebServer.h>
#include <OneWire.h>              // library for the onewire bus
#include <DallasTemperature.h>    // library for temperature sensors

RCSwitch mySwitch = RCSwitch();
IRsend irsend;              //IRled an pin 3
OneWire  ds(8);             // pin für Temperatursensoren

DallasTemperature sensors(&ds); 
DeviceAddress id;    


int transmitterpin = 7;    // The Pin on which your 433mhz transmitter is connected

boolean savetemp = false;
boolean urldebug = false;                          //true = Serielle Ausgaben, false = keine Seriellen ausgaben...
boolean tempdebug = false;
boolean udpdebug = true;


/*************************/
boolean reading = false;
boolean valid_command = false;
String parameter = String(20);
String header = String(20);
int numSensors;                                          // Variable zum speichern der Anzahl der Temperatur-Sensoren


unsigned int VerstaerkerAnAus = 0x4B36D32C;
unsigned int VerstaerkerGame = 0x4BB6B04F;
unsigned int VerstaerkerCBLSAT = 0x4BB6708F;
unsigned int VerstaerkerTuner = 0x4BB6D02F;
unsigned int VerstaerkerLauter = 0x4BB640BF;
unsigned int VerstaerkerLeiser = 0x4BB6C03F;
unsigned int VerstaerkerStumm = 0x4BB6A05F;
unsigned int BLUE = 0xF7609F;
unsigned int RED = 0xF720DF;
unsigned int GREEN = 0xF7A05F;
unsigned int YELLOW = 0xF728D7;
unsigned int ON = 0xF7C03F;
unsigned int OFF = 0xF740BF;        //NEC code mit 0x davor
unsigned int CMD_LEN = 32;          //Bit zahl
unsigned int Verstaerker_LEN = 32;

// enum {
// };

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };     // MAC address to use
byte ip[] = {192, 168, 2, 27 };                          // Arduino's IP address
byte gw[] = {192, 168, 2,  1};                           //GAteway's IP adress
byte bc[] = {192, 168, 2, 43 };                          // Broadcast IP address
byte datenbank[]  = { 192, 168, 2, 47};                  // IP-Adresse des Datenbankservers
String readString = String(30);                          //string for fetching data from address




unsigned int localPort = 49880;                          // local port to listen on

const int MAX_STRING_LEN = 500;                          // set this to the largest string 200

char stringBuffer[MAX_STRING_LEN+1];
char packetBuffer[300];                                  //buffer to hold incoming packet,
char replyBuffer[] = "acknowledged";                     // a string to send back

int repeatloop = 10;        // Der eigentliche Code wird häufig wiederholt wenn jemand einen Handsender für ein 10 Dip gedrückt hält wird der Code ebenfalls durchgehened und auch viel öfter als nur die 10 mal gesendet, hier steht die Anzahl die aus dem TXP Befehl übernommen wurde.

byte arrayreader;          // just to count
int packetarray[300];      // i made it 200 but actually i don´t know what the maximum lenght of the parameter txp string can be

byte parametercounter = 0;

EthernetUDP Udp;
EthernetClient client;
EthernetServer server(80);


void setup() {  
/**** start the Ethernet and UDP: *******/
      Ethernet.begin(mac,ip,gw);
      delay(1000);
      Udp.begin(localPort);
      Serial.begin(9600); 
      Serial.flush();
      delay(100);
      server.begin();
      mySwitch.enableTransmit(7);
      
/**** Sensoren abfragen ******/
      sensors.begin();
      Serial.println("Temperatur-Sensoren ermitteln...");
 
      numSensors = sensors.getDeviceCount();                       // Anzahl der angeschlossenen Sensoren in numSensors speichern
 
      if(numSensors > 0){                                          // Es wurde mindestens 1 Sensor gefunden                                        
         Serial.print(numSensors);
         Serial.println( " Temperatur-Sensoren gefunden.");
      }          
      else{                                                        // Es wurde kein Sensor gefunden
         Serial.println("Keine Temperatur-Sensoren gefunden.");
      }
}


void(* resetFunc) (void) = 0; //declare reset function @ address 0

void loop() {
  
      if(Ethernet.localIP() == ip)
      { 
        ;
      }else{
        resetFunc();  //call reset
      }
  
/****** Create a client connection *******/
    

 EthernetClient client = server.available();
 if (client){ // an http request ends with a blank line
         boolean currentLineIsBlank = true;
          String command = String(200);
          String befehl = String(20);
         while (client.connected()){
           if (client.available()){
               char c = client.read();
               if (reading && c == ' ') reading = false;
               
               if (c == '?') reading = true;
               
               if (reading){
                   //read char by char HTTP request
                   if (command.length() < 100){
                       //store characters to string
                       command = command + c;
                   }
               }
               if (c == '\n' && currentLineIsBlank) break;
               if (c == '\n'){
                   currentLineIsBlank = true;
               } else if (c != '\r'){
                   currentLineIsBlank = false;
               }
           }
       }
        client.println("HTTP/1.1 200 OK");
        client.println("Content-Type: text/html");
        client.println();
        
        // Serial.println(command);
        int colonPosition = command.indexOf(':');
        befehl = command.substring(4 , colonPosition);
        command = command.substring((colonPosition+1)); //Rest-command bilden
        
        // Serial.println(command);        
        Serial.println(befehl);
        if (befehl == "setpin") {
            Serial.println("setpin!!");
        }
        if(befehl == "Temperaturen"){
            sendtoDatabase();
        }
 }  
    int packetSize =  Udp.parsePacket(); 
    if(packetSize){
        char *str;
        char *p;
        
        Udp.read(packetBuffer,MAX_STRING_LEN);
        
        udpdebug != true ?:Serial.println(packetBuffer);
        
        strncpy(stringBuffer, packetBuffer, MAX_STRING_LEN);
        
        udpdebug != true ?:Serial.println(stringBuffer);
        
        Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
        Udp.write(replyBuffer);
        Udp.endPacket();
        
        //  "send433:0:00111:10000";
        char * pch;
        int i = 0;
        char bla[4][10];
        
        
        pch = strtok (stringBuffer,":");  
        while (pch != NULL)
        {
          strcpy( bla[i], pch);
          i++;
          pch = strtok (NULL, ":");
        }
        if( strcmp(bla[0], "sendIr") == 0 ){
            char * hexstring = "0x4B36D32C";
            int number;
            number = (int)strtol(hexstring, NULL, 0);
            Serial.print(78, HEX);
            Serial.println(number);
            irsend.sendNEC(0x4B36D32C , 32);
        }
        
        if( strcmp(bla[0], "send433") == 0 ){
                Serial.print("sendrc");
                if(atoi(bla[1]) ==  1){
                    Serial.println("schalte AN!");
                    mySwitch.switchOn(bla[2], bla[3]);
                }else{
                    Serial.println("schalte Aus!");
                    mySwitch.switchOff(bla[2], bla[3]);
                }
                Serial.println("erfolgreich gesendet!");
        }
    }
    delay(50);
    client.stop();
    client.flush();
          
}


void sendtoDatabase(){
      sensors.requestTemperatures();
      delay(100);
      int i = 0;
      for(i=0; i<numSensors; i++){
            int temp = sensors.getTempCByIndex(i); // take temperature reading from sensor "i" and store it to the variable "temp"
            sensors.getAddress(id, i);
            String data;
            data+="";
            String nodeid;
            for (uint8_t i = 0; i < 8; i++)
            {
              if (id[i] < 16 && tempdebug == true) Serial.print("0");
              if (id[i] < 16) nodeid = nodeid + String(0);
              tempdebug != true ?:Serial.print(id[i], HEX);
              nodeid = nodeid + String(id[i], HEX);
            }
            nodeid.toUpperCase();
            data+="nodeID=" + String(nodeid); // Use HTML encoding for comma's
            data+="&supplyV=5"; // Submitting data
            data+="&temp=" + String(temp * 100); // Submitting data
            
            
        
            if (client.connect( datenbank,1230)) {
                tempdebug != true ?:Serial.println("connected");
                client.println("POST /newdata HTTP/1.1");
                client.println("Host: www.your-website.com");
                client.println("Content-Type: application/x-www-form-urlencoded");
                client.println("Connection: close");
                client.print("Content-Length: ");
                client.println(data.length());
                client.println();
                client.print(data);
                client.println();
                 
                if(tempdebug == true){
                      Serial.println("POST /newdata HTTP/1.1");
                      Serial.println("Host: www.your-website.com");
                      Serial.println("Content-Type: application/x-www-form-urlencoded");
                      Serial.println("Connection: close");
                      Serial.print("Content-Length: ");
                      Serial.println(data.length());
                      Serial.println();
                      Serial.print(data);
                      Serial.println();
                }
            }
            delay(500);
             
            if (client.connected()) {
                tempdebug != true ?:Serial.println();
                tempdebug != true ?:Serial.println("disconnecting.");
                client.stop();
            }
       
      }
      Serial.println("Temperaturen erfolgreich gespeichert!");
}
