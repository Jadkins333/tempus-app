#!/bin/bash
cd /home/jadkins/tempus-app
node server.js &
sleep 2
cloudflared tunnel --url http://localhost:3847
