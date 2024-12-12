if [ $# -eq 0 ]; then
    read -r -p "Enter athlete ID: " ATHLETE_ID
else
    ATHLETE_ID=$1
fi

echo Go fetch https://www.parkrun.org.uk/parkrunner/$ATHLETE_ID/all/ to docs/athletes/$ATHLETE_ID.html
code docs/athletes/$ATHLETE_ID.json
open https://www.parkrun.org.uk/parkrunner/$ATHLETE_ID/all/
echo "Tell me when that's done"
echo 'Reminder: javascript:(function(){const links=Array.from(document.querySelectorAll('a[href]'));const pattern=/^(https?:\/\/[^/]+\/([^/]+)\/results\/)$/;const matchingLinks=links.map(link=>link.href.match(pattern)).filter(match=>match).map(match=>match[2]);const uniqueLinks=[...new Set(matchingLinks)].sort();const jsonArray=JSON.stringify(uniqueLinks);document.body.innerHTML=`<pre>${jsonArray}</pre>`;document.body.style.whiteSpace=%27pre-wrap%27;document.body.style.fontFamily=%27monospace%27;})();'
read -p "Press Enter to continue..."

#wget -U "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.54 Safari/537.36" https://www.parkrun.org.uk/parkrunner/$ATHLETE_ID/all/ -O docs/athletes/$ATHLETE_ID.html
#egrep -o 'https://[^/]+/([^/]+)/results/' docs/athletes/$ATHLETE_ID.html | sort | uniq | sort | awk -F '/' '{ print $4 }' | sort | jq -R '[.]' | jq -s -c 'add' > docs/athletes/$ATHLETE_ID.json
#rm docs/athletes/$ATHLETE_ID.html
