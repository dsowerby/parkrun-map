if [ $# -eq 0 ]; then
    read -r -p "Enter athlete ID: " ATHLETE_ID
else
    ATHLETE_ID=$1
fi
wget -U "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)" https://www.parkrun.org.uk/parkrunner/$ATHLETE_ID/all/ -O docs/athletes/$ATHLETE_ID.html
egrep -o 'https://[^/]+/([^/]+)/results/' docs/athletes/$ATHLETE_ID.html | sort | uniq | sort | awk -F '/' '{ print $4 }' | sort | jq -R '[.]' | jq -s -c 'add' > docs/athletes/$ATHLETE_ID.json
rm docs/athletes/$ATHLETE_ID.html
