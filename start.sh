#! /bin/bash

forever $1 server.js
forever $1 SwitchServer.js
forever $1 timerserver.js
