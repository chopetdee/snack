#!/bin/bash
export PATH=$PATH:/opt/wsm/snack
git pull git@github.com:chopetdee/snack.git
npm install
systemctl restart snackbox1
