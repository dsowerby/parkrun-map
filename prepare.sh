#wget https://www.parkrun.org.uk/wp-content/themes/parkrun/xml/geo.xml -O docs/geo.xml
#wget https://www.cssscript.com/demo/basic-hamburger-toggle-menu-css-vanilla-javascript/styles/nav.css -O docs/hamburger.css
# npm install uglify-js -g
uglifyjs map.js > docs/map.min.js
# npm install uglifycss -g
uglifycss map.css > docs/map.min.css
uglifycss hamburger.css > docs/hamburger.min.css
CACHEBUST=`date +%s`
sed 's/CACHEBUST/'$CACHEBUST'/g' index.html > docs/index.html
