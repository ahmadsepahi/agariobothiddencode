#!/bin/bash

# shellcheck disable=SC2034
file="$1"
touch $file
echo $file
for i in {1..5}
do
   #python3 ~/agarioBot/Bot/agario_main_bot.py & echo $! >> $file     #This is for IDE run
   python3 /usr/src/app/Bot/agario_main_bot.py & echo $! >> $file     #This is for dockerizing
done
#sleep 60
#pkill -f main.py
