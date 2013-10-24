

// Load the geojson data from a file

var geoJsonData;
$.getJSON('ippf.geojson', function(data) {
    geoJsonData = data;

   
    

// Load the map 
var map = L.mapbox.map('map', 'ippf.ippf', {

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

// Add a marker layer
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
     var introText = $("<div />").append($("#info").clone()).html();
     $('#map-ui').hide();

// Add a marker layer
var mainMarkers = L.mapbox.markerLayer();

// Customise the marker layer
mainMarkers.on('layeradd', function(e) {
    var marker = e.layer,feature = marker.feature;
     
    // this is to get the correct marker icon depending on the type 
    s = feature.properties.type;
    customIcon = new LeafIcon({iconUrl: 'images/'+s+'-off.png',iconRetinaUrl: 'images/'+s+'@2x-off.png'});

    marker.setIcon(customIcon);

});
 
// set the lat/lon for marker layer
mainMarkers.setGeoJSON(geoJsonData);

// Create a cluster marker layer
var clusterMarkers = L.markerClusterGroup({spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false, maxClusterRadius:115});

// Set the lat/lon for the cluster layer 
var geoJsonLayer = L.geoJson(geoJsonData);

// Add the lat/lon to the layer
clusterMarkers.addLayer(geoJsonLayer);

// Add the layer to the map for the initial view
map.addLayer(clusterMarkers);

// Control which layers show at which zoom level
map.on('zoomend', onZoomend);

function onZoomend()
{
  // As you zoom out, remove the marker layer and add the cluster layer 
  if(map.getZoom()<=2)
    {
      map.addLayer(clusterMarkers);
      map.removeLayer(mainMarkers);
      document.getElementById('info').innerHTML = introText;
      if (!$('html').hasClass('ie8')) {$('#map-ui').fadeOut('slow');}
    }

  // As you zoom in, remove the cluster layer and add the marker layer
  if(map.getZoom()>2)
    {
      map.addLayer(mainMarkers);
      map.removeLayer(clusterMarkers);
      // Only show the filter if it is not ie8
      if (!$('html').hasClass('ie8')) {$('#map-ui').fadeIn('slow');}
    }
}


// When you click on a cluster it zooms to bounds
clusterMarkers.on('clusterclick', function (a) {
    a.layer.zoomToBounds();
});



// Listen for individual marker clicks
mainMarkers.on('click',function (e) {

  e.layer.unbindPopup();

  var details = e.layer.feature;
                
  var info = '<img class="header" src="images/' + details.properties.type +'.png" alt="Type of win: ' + details.properties.type +'">' +
              '<h1>' + details.properties.country + '</h1>' +
             '<p class="bold">' + details.properties.title + '</p>' +
             '<p>' + details.properties.description + '</p>';

 
 // Load the text for that marker in the info panel
   if($("html").hasClass("ie8")) {document.getElementById('info').innerHTML = info;}

    else {$('#info').hide().html(info).fadeIn('slow');}

  // Centre the map around the clicked marker  
    map.panTo(e.layer.getLatLng());

});


// Clear the tooltip when map is clicked
map.on('click',function(e){
   document.getElementById('info').innerHTML = introText;
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

 }); // close the loading of the geojson 