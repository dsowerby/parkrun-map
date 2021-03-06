#wget https://www.parkrun.org.uk/wp-content/themes/parkrun/xml/geo.xml -O docs/geo.xml
#wget https://www.cssscript.com/demo/basic-hamburger-toggle-menu-css-vanilla-javascript/styles/nav.css -O docs/hamburger.css
#sudo npm install uglify-js -g
uglifyjs --rename map.js > docs/map.min.js
uglifyjs --rename map-nyd.js > docs/nyd/map.min.js
uglifyjs --rename map-nyd-ie.js > docs/nyd/ie/map.min.js
uglifyjs --rename map-xmas.js > docs/xmas/map.min.js
uglifyjs --rename map-juniors.js > docs/juniors/map.min.js
uglifyjs --rename closest.js > docs/closest/closest.min.js
uglifyjs --rename alphabeteer.js > docs/alphabeteer/alphabeteer.min.js
#uglifyjs map.js > docs/map.min.js
#sudo npm install uglifycss -g
uglifycss map.css > docs/map.min.css
uglifycss map.css > docs/juniors/map.min.css
uglifycss map.css > docs/nyd/map.min.css
uglifycss map.css > docs/nyd/ie/map.min.css
uglifycss map.css > docs/xmas/map.min.css
uglifycss hamburger.css > docs/hamburger.min.css
uglifycss hamburger.css > docs/juniors/hamburger.min.css
CACHEBUST=`date +%s`
sed 's/CACHEBUST/'$CACHEBUST'/g' index.html > docs/index.html
sed 's/CACHEBUST/'$CACHEBUST'/g' index-closest.html > docs/closest/index.html
sed 's/CACHEBUST/'$CACHEBUST'/g' index-alphabeteer.html > docs/alphabeteer/index.html
sed 's/CACHEBUST/'$CACHEBUST'/g' index.html > docs/juniors/index.html
sed 's/CACHEBUST/'$CACHEBUST'/g' index-nyd.html > docs/nyd/index.html
sed 's/CACHEBUST/'$CACHEBUST'/g' index-xmas.html > docs/xmas/index.html
sed 's/CACHEBUST/'$CACHEBUST'/g' index-nyd.html > docs/nyd/ie/index.html
