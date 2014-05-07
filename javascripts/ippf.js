
// Load the map - ippf.ippf
var map = L.mapbox.map('map', 'robertocarroll.ippf ', {

    center: [25, -15],
    zoom: 2,
    minZoom: 2,
    maxZoom: 5,
    maxBounds: [[-85, -180.0],[85, 180.0]],

    gridLayer: {},
    // This line redefines part of the underlying code which
    // sanitizes HTML from MapBox Hosting. The original code is there
    // for the protection of sites, so that malicious map-creators
    // can't add cross-site scripting attacks to sites that use their
    // maps.
    // Turning it off allows any content to be available in tooltips.
    // It's recommended to only with trusted maps.
    gridControl: {
        sanitizer: function (x) { return x; }
    }
});

map.scrollWheelZoom.disable();


var geoJsonData;
var geoJsonTop;
var introText = $("<div />").append($("#info").clone()).html();
$('#map-ui').hide();

// Load the geojson data from files

// Top level data
var loadGeoJsonTop = $.getJSON('ippf-top.geojson', function(dataTop) {
    geoJsonTop = dataTop;    
 }); // close the loading of the geojson 

// Main data
var loadGeoJson =$.getJSON('ippf.geojson', function(data) {
    geoJsonData = data;
 }); // close the loading of the geojson     


// Create a cluster marker layer
var topMarkers = L.mapbox.markerLayer();

// Add a marker layer for the main map
var mainMarkers = L.mapbox.markerLayer();


// Create a custom icon for the cluster layer
L.NumberedDivIcon = L.Icon.extend({
      options: {
      iconUrl: 'images/cluster-circle.png',
      number: '',
      shadowUrl: null,
      iconSize: new L.Point(30, 30),
      iconAnchor: new L.Point(15, 15),
      className: 'ippf-div-icon'
    },
     
    createIcon: function () {
      var div = document.createElement('div');
      var img = this._createImg(this.options['iconUrl']);
      var numdiv = document.createElement('div');
      numdiv.setAttribute ( "class", "number" );
      numdiv.innerHTML = this.options['number'] || '';
      div.appendChild ( img );
      div.appendChild ( numdiv );
      this._setIconStyles(div, 'icon');
      return div;
    },
     
    //you could change this to add a shadow like in the normal marker if you really wanted
      createShadow: function () {
      return null;
    }
});

// Create a custom icon for the main
var LeafIcon = L.Icon.extend({
                options: {
                    shadowUrl: 'images/shadow.png',
                    shadowRetinaUrl: 'images/shadow@2x.png',
                    iconSize:     [32, 43],
                    shadowSize:   [32, 43],
                    iconAnchor:   [22, 42],
                    shadowAnchor: [22, 42]
                }
            });
     
     var s;
     var customIcon;
     
// Customise the top marker layer
topMarkers.on('layeradd', function(e) {

  var marker = e.layer,feature = marker.feature;
  var howMany = feature.properties.number;
  numberIcon = new L.NumberedDivIcon({number: howMany});
  marker.setIcon(numberIcon);

});   

// Add the lat/lon to the layer
loadGeoJsonTop.complete(function() {
  topMarkers.setGeoJSON(geoJsonTop);
});

// Add the layer to the map for the initial view
map.addLayer(topMarkers);


// Customise the marker layer
mainMarkers.on('layeradd', function(e) {
    var marker = e.layer,feature = marker.feature;
     
    // this is to get the correct marker icon depending on the type 
    s = feature.properties.type;
    customIcon = new LeafIcon({iconUrl: 'images/'+s+'-off.png',iconRetinaUrl: 'images/'+s+'@2x-off.png'});

    marker.setIcon(customIcon);

});
 
// set the lat/lon for marker layer
loadGeoJson.complete(function() {
  mainMarkers.setGeoJSON(geoJsonData);
});


// Control which layers show at which zoom level
map.on('zoomend', onZoomend);

function onZoomend()
{
  // As you zoom out, remove the marker layer and add the cluster layer 
  if(map.getZoom()<=2)
    {
      map.addLayer(topMarkers);
      map.removeLayer(mainMarkers);
      document.getElementById('info').innerHTML = introText;
      if (!$('html').hasClass('ie8')) {$('#map-ui').fadeOut('slow');}

    }

  // As you zoom in, remove the cluster layer and add the marker layer
  if(map.getZoom()>2)
    {
      map.addLayer(mainMarkers);
      map.removeLayer(topMarkers);
      // Only show the filter if it is not ie8
      if (!$('html').hasClass('ie8')) {$('#map-ui').fadeIn('slow');}
    }
}

// Listen for individual marker clicks
mainMarkers.on('click',function (e) {

  e.layer.unbindPopup();

  var details = e.layer.feature;
                
  var info = '<img class="header" src="images/' + details.properties.type +'.png" alt="'+ details.properties.type +'">' +
              '<h1>' + details.properties.country + '</h1>' +
             '<p class="bold">' + details.properties.title + '</p>' +
             '<p>' + details.properties.description + '</p>';

 
 // Load the text for that marker in the info panel
   document.getElementById('info').innerHTML = info;

  // Centre the map around the clicked marker  
    map.panTo(e.layer.getLatLng());

});


// Zoom to the level with lots of markers on click on higher numbered markers
topMarkers.on('click',function (e) {
  map.setView(e.latlng, map.getZoom() + 3);

  e.layer.unbindPopup();

  var details = e.layer.feature;
                
  var info = '<h1>' + details.properties.title + '</h1>' +
             '<p class="bold">Number of wins: ' + details.properties.number + '</p>' +
             '<p>' + details.properties.description + '</p>';

 
 // Load the text for that marker in the info panel
   document.getElementById('info').innerHTML = info;

});


 // Show and hide the icons depending on the checkboxes

var filters = document.getElementById('filters');
 var checkboxes = $('.filter');

        function change() {
            // Find all checkboxes that are checked and build a list of their values
            var on = [];
            for (var i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) on.push(checkboxes[i].value);
            }
            // The filter function takes a GeoJSON feature object
            // and returns true to show it or false to hide it.
            mainMarkers.setFilter(function (features) {
                // check each marker's symbol to see if its value is in the list
                // of symbols that should be on, stored in the 'on' array

              return on.indexOf(features.properties['type']) !== -1;
            });
            return false;
        }

    // When the form is touched, re-filter markers
        filters.onchange = change;
    // Initially filter the markers
        change();


   // Hover for the main markers     
    function onHoverOver(e) {

        var marker = e.layer,feature = marker.feature;

        // this is to get the correct marker icon depending on the type 
        s = feature.properties.type;
        customIcon = new LeafIcon({iconUrl: 'images/'+s+'-hover.png',iconRetinaUrl: 'images/'+s+'@2x-hover.png'});

        marker.setIcon(customIcon);

     }

    mainMarkers.on('mouseover', onHoverOver);

    function onHoverOut(e) {

        var marker = e.layer,feature = marker.feature;

        // this is to get the correct marker icon depending on the type 
        s = feature.properties.type;
        customIcon = new LeafIcon({iconUrl: 'images/'+s+'-off.png'});

        marker.setIcon(customIcon); 

    }
                
     mainMarkers.on('mouseout', onHoverOut);


 





 