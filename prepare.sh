#wget https://www.parkrun.org.uk/wp-content/themes/parkrun/xml/geo.xml -O docs/geo.xml
#wget https://www.cssscript.com/demo/basic-hamburger-toggle-menu-css-vanilla-javascript/styles/nav.css -O docs/hamburger.css
#sudo npm install uglify-js -g
uglifyjs map.js > docs/map.min.js
uglifyjs map.vegan.js > docs/vegan/map.min.js
#sudo npm install uglifycss -g
uglifycss map.css > docs/map.min.css
uglifycss hamburger.css > docs/hamburger.min.css
CACHEBUST=`date +%s`
sed 's/CACHEBUST/'$CACHEBUST'/g' index.html > docs/index.html
