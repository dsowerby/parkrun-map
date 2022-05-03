if [ $# -eq 0 ]; then
    read -r -p "Enter athlete ID: " ATHLETE_ID
else
    ATHLETE_ID=$1
fi
wget -U "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.54 Safari/537.36" https://www.parkrun.org.uk/parkrunner/$ATHLETE_ID/all/ -O docs/athletes/$ATHLETE_ID.html
egrep -o 'https://[^/]+/([^/]+)/results/' docs/athletes/$ATHLETE_ID.html | sort | uniq | sort | awk -F '/' '{ print $4 }' | sort | jq -R '[.]' | jq -s -c 'add' > docs/athletes/$ATHLETE_ID.json
rm docs/athletes/$ATHLETE_ID.html
