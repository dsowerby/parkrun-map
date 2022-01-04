read -r -a ATHLETE_ID -p "Enter athlete ID: "
wget -U "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)" https://www.parkrun.org.uk/parkrunner/$ATHLETE_ID/all/ -O docs/athletes/$ATHLETE_ID.html
egrep -o 'https://[^/]+/([^/]+)/results/' docs/athletes/$ATHLETE_ID.html | sort | uniq | awk -F '/' '{ print $4 }' | jq -R '[.]' | jq -s -c 'add' > docs/athletes/$ATHLETE_ID.json
rm docs/athletes/$ATHLETE_ID.html