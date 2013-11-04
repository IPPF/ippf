
// Load the geojson data for the higher level

var geoJsonTop = [
{
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [36.821946, -1.292066]
    },
    "properties": {
        "title": "Africa",
        "number": "12"
    }
},
{
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [10.165960, 36.818810]
    },
    "properties": {
        "title": "Arab World",
        "number": "2"
    }
},
{
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [101.686855, 3.139003]
    },
    "properties": {
        "title": "East and South East Asia and Oceania",
        "number": "22"
    }
},
{
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [77.224960, 28.635308]
    },
    "properties": {
        "title": "South Asia",
        "number": "24"
    }
},
{
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [4.351710, 50.850340]
    },
    "properties": {
        "title": "European Network",
        "number": "54"
    }
},
{
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [-74.005973, 40.714353]
    },
    "properties": {
        "title": "Western Hemisphere",
        "number": "54"
    }
}

];

 


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
//var clusterMarkers = L.markerClusterGroup({spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false, maxClusterRadius:115});

var topMarkers = L.mapbox.markerLayer();


topMarkers.on('layeradd', function(e) {
    var marker = e.layer,feature = marker.feature;
    var howMany = feature.properties.number;

     numberIcon = new L.NumberedDivIcon({number: howMany});

 marker.setIcon(numberIcon);

});   

// Set the lat/lon for the cluster layer 
var geoJsonLayer = L.geoJson(geoJsonData);

// Add the lat/lon to the layer
topMarkers.setGeoJSON(geoJsonTop);

// Add the layer to the map for the initial view
map.addLayer(topMarkers);

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

        // Hover for the top markers   

        $('.ippf-div-icon').bind('mouseover', function() {    
          $(this).find('img').attr("src","images/cluster-circle-hover.png");
        });

        $('.ippf-div-icon').bind('mouseout', function() {
          $(this).find('img').attr("src","images/cluster-circle.png");
        });

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


// Zoom to the level with lots of markers on click on higher numbered markers
topMarkers.on('click',function (e) {
  map.setView(e.latlng, map.getZoom() + 3);
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

  // Hover for the top markers   

  $('.ippf-div-icon').bind('mouseover', function() {   
    $(this).find('img').attr("src","images/cluster-circle-hover.png");
  });

  $('.ippf-div-icon').bind('mouseout', function() {
    $(this).find('img').attr("src","images/cluster-circle.png");
  });



 }); // close the loading of the geojson 


 