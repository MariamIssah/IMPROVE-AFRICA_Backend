#!/bin/bash
echo "IMPROVE AFRICA Marketplace Server Launcher"
echo "========================================="
echo

read -p "Enter Gmail App Password for improveafrica01@gmail.com: " EMAIL_PASSWORD

echo
echo "Starting server with your email password..."
echo

export EMAIL_PASSWORD
node server.js 