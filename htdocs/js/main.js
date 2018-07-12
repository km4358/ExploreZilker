/* Main JS by Kerry C. McAlister, 2018 */


//set map variable and view
var mymap = L.map('map').setView([30.268009, -97.771204], 16);
//set tile layer source and attributes
var tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/kmcalister/cjdrsckx62ok42spck7uq21t5/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia21jYWxpc3RlciIsImEiOiJjaXNkbW9lM20wMDZ1Mm52b3p3cDJ0NjE0In0.KyQ5znmrXLsxaPk6y-fn0A', {
    attribution: 'Site Design © Kerry C. McAlister, 2018; Imagery: <a href="mapbox://styles/kmcalister/cjdrsckx62ok42spck7uq21t5">Mapbox</a>'
});
//add tile layer to map    
tileLayer.addTo(mymap);
$(document).click(function () {
    $(".welcomeWin").hide();
});

//set global vars for sql queries and login
var sqlBase = "SELECT * FROM park_boundary";

var sqlTrail = "SELECT * FROM urban_trails";

var sqlFeedback = "SELECT * FROM feedback";

//set vars for park sites
var sqlSites = "SELECT * FROM park_sites";
var sqlEnt = "SELECT * FROM park_sites WHERE ent='Y'";
var sqlRec = "SELECT * FROM park_sites WHERE rec='Y'";
var sqlExh = "SELECT * FROM park_sites WHERE exh='Y'";
var sqlFam = "SELECT * FROM park_sites WHERE fam='Y'";
var sqlDog = "SELECT * FROM park_sites WHERE dog='Y'";

//cartodb username
var cartoUser = "kmcalister";

//set empty global vars 
var parkBoundary = null;
var parkTrails = null;
var parkSites = null;


//set location var 
var myLocation = null;
var locationMarker = null;

//set blank marker var
var siteMarker = null;

var feedbackPoints = null;

//user location icon
var locateIcon = L.icon({
    iconUrl: 'img/185719.svg',
    iconSize: [50, 50]
});

var boundaryStyle = {
    "color": "#dc42f4",
    "weight": 5,
    "opacity": 0.65
};

var trailStyle = {
    "color": "#086b34",
    "weight": 10,
    "opacity": 0.75
    
}


L.control.locate({ icon: 'fa fa-location-arrow' }).addTo(mymap);


function startEdit(){
    if(controlOnMap == true){
        mymap.removeControl(drawControl);
        controlOnMap = false;
    }
    mymap.addControl(drawControl);
    controlOnMap = true;
};

function stopEdit(){
    mymap.removeControl(drawControl);
    controlOnMap = false;
};

mymap.on('draw:created', function(e) {
    var layer = e.layer;
    drawnItems.addLayer(layer);
    mymap.addLayer(drawnItems);
    dialog.dialog("open");
});

var dialog = $("#dialog").dialog({
    autoOpen: false,
    height: 300,
    width: 350,
    modal: true,
    position: {
        my: "center center",
        at: "center center",
        of: "#map"
    },
    buttons: {
        "Submit Feedback": setData,
        Cancel: function() {
            dialog.dialog("close");
            mymap.removeLayer(drawnItems);
        }
    },
    close: function() {
        form[ 0 ].reset();
        console.log("Dialog closed");
    }
});

var form = dialog.find("form").on("submit", function(event) {
    event.preventDefault();
});



function showBoundary() {
    if (mymap.hasLayer(parkBoundary)) {
        mymap.removeLayer(parkBoundary);
    };

    $.getJSON("https://" + cartoUser + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlBase, function (data) {
        parkBoundary = L.geoJson(data, {
            style: boundaryStyle,
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>' + feature.properties.park_name + '</b><br /><em>' + feature.properties.park_acres + ' acres' + '</em></p>');
                layer.cartdodb_id = feature.properties.cartdodb_id;
            }
        }).addTo(mymap);
    });
};


function showTrails() {
    if (mymap.hasLayer(parkTrails)) {
        mymap.removeLayer(parkTrails);
    };

    $.getJSON("https://" + cartoUser + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlTrail, function (data) {
        parkTrails = L.geoJson(data, {
            style: trailStyle,
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>' + feature.properties.name + '</b><br /><em>' + feature.properties.length_mil + ' mi.' + '</em></p>');
                layer.cartdodb_id = feature.properties.cartdodb_id;
            }
        }).addTo(mymap);
    });
};

function showSites() {
    if (mymap.hasLayer(parkSites)||mymap.hasLayer(locationMarker)){
        mymap.removeLayer(parkSites);
        mymap.removeLayer(locationMarker);
    };

    $.getJSON("https://" + cartoUser + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlSites, function (data) {
        parkSites = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>' + feature.properties.name + '</b><br /><em>' + feature.properties.url + '</em></p>');
                layer.cartdodb_id = feature.properties.cartdodb_id;
                var siteMarker = new L.Icon({
                    iconSize: [50, 50],
                    iconUrl: "img/star.png",
                    riseOnHover: true,
                    shadowSize: [80, 50]
                });
                layer.setIcon(siteMarker);
            }
        }).addTo(mymap);
    });
};

function showFeedback() {
    if (mymap.hasLayer(feedbackPoints)) {
        mymap.removeLayer(feedbackPoints);
    };

    $.getJSON("https://" + cartoUser + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlFeedback, function (data) {
        feedbackPoints = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>' + feature.properties.name + '</b><br /><em>' + 'Feedback: ' + feature.properties.feedback + '</em></p>');
                layer.cartdodb_id = feature.properties.cartdodb_id;
            }
        }).addTo(mymap);
    });
};

function filterEnt() {
    if (mymap.hasLayer(parkSites)) {
        mymap.removeLayer(parkSites);
    };
    $.getJSON("https://" + cartoUser + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlEnt, function (data) {
        parkSites = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>' + feature.properties.name + '</b><br /><em>' + feature.properties.type + '</em></p>');
                layer.cartdodb_id = feature.properties.cartdodb_id;
                var entMarker = new L.Icon({
                    iconSize: [50, 50],
                    iconUrl: "img/Music-icon.png",
                    riseOnHover: true,
                    shadowSize: [100, 100]
                });
                layer.setIcon(entMarker);
            }
        }).addTo(mymap)
    });
};

function filterExh() {
    if (mymap.hasLayer(parkSites)) {
        mymap.removeLayer(parkSites);
    };
    $.getJSON("https://" + cartoUser + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlExh, function (data) {
        parkSites = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>' + feature.properties.name + '</b><br /><em>' + feature.properties.type + '</em></p>');
                layer.cartdodb_id = feature.properties.cartdodb_id;
                var exhMarker = new L.Icon({
                    iconSize: [50, 50],
                    iconUrl: "img/exhibit.png",
                    shadowSize: [80, 50]
                });
                layer.setIcon(exhMarker);
            }
        }).addTo(mymap)
    });
};

function filterFam() {
    if (mymap.hasLayer(parkSites)) {
        mymap.removeLayer(parkSites);
    };
    $.getJSON("https://" + cartoUser + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlFam, function (data) {
        parkSites = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>' + feature.properties.name + '</b><br /><em>' + feature.properties.type + '</em></p>');
                layer.cartdodb_id = feature.properties.cartdodb_id;
                var famMarker = new L.Icon({
                    iconSize: [50, 50],
                    iconUrl: "img/children.png",
                    shadowSize: [80, 50]
                });
                layer.setIcon(famMarker);
            }
        }).addTo(mymap)
    });
};

function filterRec() {
    if (mymap.hasLayer(parkSites)) {
        mymap.removeLayer(parkSites);
    };
    $.getJSON("https://" + cartoUser + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlRec, function (data) {
        parkSites = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>' + feature.properties.name + '</b><br /><em>' + feature.properties.type + '</em></p>');
                layer.cartdodb_id = feature.properties.cartdodb_id;
                var recMarker = new L.Icon({
                    iconSize: [50, 50],
                    iconUrl: "img/recicon.png",
                    shadowSize: [80, 50]
                });
                layer.setIcon(recMarker);
            }
        }).addTo(mymap)
    });
};

function filterDog() {
    if (mymap.hasLayer(parkSites)) {
        mymap.removeLayer(parkSites);
    };
    $.getJSON("https://" + cartoUser + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlDog, function (data) {
        parkSites = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>' + feature.properties.name + '</b><br /><em>' + feature.properties.type + '</em></p>');
                layer.cartdodb_id = feature.properties.cartdodb_id;
                var dogMarker = new L.Icon({
                    iconSize: [50, 50],
                    iconUrl: "img/dog1600.png",
                    shadowSize: [80, 50]
                });
                layer.setIcon(dogMarker);
            }
        }).addTo(mymap)
    });
};



function locationFound(e){
    myLocation = e.latlng;
    closestSite();
    locationMarker = L.marker(e.latlng, {icon: locateIcon});
    mymap.addLayer(locationMarker);
};

function locationError(e){
    alert(e.message);
};

mymap.on('click', locationFound);

/*mymap.on('locationerror', locationError);*/


function closestSite(){
    var sqlClosest = "SELECT * FROM park_sites ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint("+myLocation.lng+","+myLocation.lat+"), 4326) LIMIT 3";
    
    if (mymap.hasLayer(parkSites)){
        mymap.removeLayer(parkSites);
    };

    if (mymap.hasLayer(locationMarker)){
        mymap.removeLayer(locationMarker);
    };

    $.getJSON("https://"+cartoUser+".carto.com/api/v2/sql?format=GeoJSON&q="+sqlClosest, function(data){
        parkSites = L.geoJson(data,{
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<p><b>' + feature.properties.name + '</b><br /><em>' + feature.properties.type + '</em></p>');
                layer.cartdodb_id = feature.properties.cartdodb_id;
            }
        }).addTo(mymap);

    });

};


//event listeners
//checkbox event listener for park boundary
$('input[value=boundary').change(function () {
    if (this.checked) {
        showBoundary();
    } else {
        mymap.removeLayer(parkBoundary)
    };
});

$('input[value=trails').change(function () {
    if (this.checked) {
        showTrails();
    } else {
        mymap.removeLayer(parkTrails)
    };
});

$('input[value=feedback').change(function () {
    if (this.checked) {
        showFeedback();
    } else {
        mymap.removeLayer(feedbackPoints)
    };
});

//listeners for point layers
$('input[value=ent]').click(function () {
    filterEnt();
});

$('input[value=exh]').click(function () {
    filterExh();
});

$('input[value=fam]').click(function () {
    filterFam();
});

$('input[value=rec]').click(function () {
    filterRec();
});

$('input[value=dog]').click(function () {
    filterDog();
});

$('input[value=all]').click(function () {
    showSites();
});

//add draw controls

var drawControl = new L.Control.Draw({
    draw : {
      polygon : false,
      polyline : false,
      rectangle : false,
      circle : false
    },
    edit : false,
    remove: false
  });
  
  // Boolean global variable used to control visiblity
  var controlOnMap = false;
  
  // Create variable for Leaflet.draw features
  var drawnItems = new L.FeatureGroup();

  mymap.on('draw:created', function(e) {
    var layer = e.layer;
    drawnItems.addLayer(layer);
    mymap.addLayer(drawnItems);
    dialog.dialog("open");
});

var dialog = $("#dialog").dialog({
    autoOpen: false,
    height: 300,
    width: 350,
    modal: true,
    position: {
        my: "center center",
        at: "center center",
        of: "#map"
    },
    buttons: {
        "Submit Feedback": setData,
        Cancel: function() {
            dialog.dialog("close");
            mymap.removeLayer(drawnItems);
        }
    },
    close: function() {
        form[ 0 ].reset();
        console.log("Dialog closed");
    }
});

var form = dialog.find("form").on("submit", function(event) {
    event.preventDefault();
});

/*function setData() {
    var enteredUsername = username.value;
    var enteredEmail = email.value;
    var enteredFeedback = feedbackEntry.value;
    drawnItems.eachLayer(function (layer) {
        var sql = "INSERT INTO feedback1 (the_geom, feedback, latitude, longitude, name, email) VALUES (ST_SetSRID(ST_GeomFromGeoJSON(";
        var a = layer.getLatLng();
        var sql2 = "{'type':'Point','coordinates':[" + a.lng + "," + a.lat + "]}'),4326),'" + enteredUsername + "','" + enteredFeedback + "','" + enteredEmail + "')";
        var pURL = sql + sql2;
        submitToProxy(pURL);
        var postUrl = "https://"+cartoUser+".carto.com/api/v2/sql?format=GeoJSON&q="+pURL+"&api_key=2dca57c475c40ff4de838da65aac9f083396c5cc";
        console.log(postUrl);
        console.log("Feature has been submitted to the Proxy");

        /*$.post("https://" + cartoUser + ".carto.com/api/v2/sql?format=GeoJSON&q=" + pURL + "&api_key=2dca57c475c40ff4de838da65aac9f083396c5cc", {
            cache: false,
            timeStamp: new Date().getTime()
        }, function (data) {
            console.log(data)
            refreshLayer();
        });
    });

    mymap.removeLayer(drawnItems);
    drawnItems = new L.FeatureGroup();
    console.log("drawnItems has been cleared");
    dialog.dialog("close");
};*/

function setData() {
    var enteredUsername = username.value;
    var enteredEmail = email.value;
    var enteredFeedback = feedbackEntry.value;
    drawnItems.eachLayer(function (layer) {
        var a = layer.getLatLng();
        var postSQL = "INSERT INTO feedback (the_geom, name, feedback, email, latitude, longitude) values (ST_GeomFromText('POINT(" + a.lng + " " + a.lat + ")',4326)," +"'"+ enteredUsername +"'"+ "," +"'"+ enteredFeedback +"'"+"," +"'"+ enteredEmail+"'" + "," +"'"+ a.lat +"'"+ "," +"'"+ a.lng +"')";
        //var a = layer.getLatLng();
        //var postSQL2 = "{'type':'Point', 'coordinates':[" + a.lng + "," + a.lat + "]}'),4326)," +"'"+ enteredUsername +"'"+ "," +"'"+ enteredFeedback +"'"+"," +"'"+ enteredEmail+"'" + "," +"'"+ a.lat +"'"+ "," +"'"+ a.lng +"'"+ ")";
        //console.log(postSQL2);
        console.log(postSQL)
        var pURL = postSQL; //+ postSQL2;
        console.log(pURL);
        postUrl = "https://kmcalister.carto.com/api/v2/sql?q=" + pURL + "&api_key=8AlwQsbc6N3ZHhAL5JNqxg";
        $.post(postUrl)
    });
    mymap.removeLayer(drawnItems);
    drawnItems = new L.FeatureGroup();
    console.log("drawnItems has been cleared");
    dialog.dialog("close");
};


/*var submitToProxy = function(q){
    $.post("php/callProxy.php", {
      qurl:q,
      cache: false,
      timeStamp: new Date().getTime()
    }, function(data) {
      console.log(data);
      refreshLayer();
    });
 };*/




/*function refreshLayer() {
    if (mymap.hasLayer(feedbackPoints)) {
        mymap.removeLayer(feedbackPoints);
    };
    console.log(submitToProxy);
    showFeedback();
};*/
//create map
$(document).ready(function () {
    showSites()
});