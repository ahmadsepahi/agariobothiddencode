#!/bin/bash

file="$1"
# shellcheck disable=SC2034
while IFS= read -r pid
do
    kill -9 $pid
done < $file
rm $file
RandomNum=$(( ( RANDOM % 20 )  + 1 ))
#echo $RandomNum
if [ $RandomNum == 13 ]
then
    pkill -f agario_main_bot.py
    pkill -f scary_bot.py
fi
