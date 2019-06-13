#!/bin/bash
export PATH=$PATH:/opt/wsm/snack
git pull git@github.com:chopetdee/snack.git
systemctl stop snackbox1
node app.js
