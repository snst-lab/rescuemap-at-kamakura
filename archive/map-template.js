"use strict";

var QUERY=[];
var MAP_OBJ;
var MARKER_ARRAY = [];
var INFO_ARRAY = [];

var MARKER_CLUSTER;
var LAT, LNG;
var NORTH, SOUTH, EAST, WEST;
var CURRENT_POSITION_MARKER;
var CURRENT_LAT, CURRENT_LNG;
var CELLSIZE = 5;
var MAX_ZOOM = 20;

var SEARCHBOX_MARKER_ARRAY = [];
var SEARCHBOX_INFO_ARRAY = [];

var MAP_API_KEY = 'AIzaSyDTyfLfyPFK-vudD_ClwtWsfNQ4W3nATbQ';

function init(){
    QUERY = getQuery();
    main.showMap();
    main.onButtonClick();
}

class main {
    constructor() {
        $('body').append('<script src="https://maps.googleapis.com/maps/api/js?key=' + MAP_API_KEY + '&libraries=places&language=en&region=US&callback=init" async defer></script>');
    }

    static showMap() {
        var map_canvas = document.getElementById("map_canvas");
        var init_latlng = new google.maps.LatLng(40.7828647, -73.9653551);
        var options = {
            center: init_latlng,
            zoom: 15,
            gestureHandling: 'greedy',
            zoomControl: false,
            scaleControl: false,
            streetViewControl: true,
            fullscreenControl: false,
            mapTypeControl: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.BOTTOM_CENTER //Position of map type
            }
        };
        MAP_OBJ = new google.maps.Map(map_canvas, options);

        google.maps.event.addListener(MAP_OBJ, 'bounds_changed', function (event) {
            main.boundsChanged();
        });
        google.maps.event.addListener(MAP_OBJ, 'click', function (event) {
            event.stop();
            main.setMarker(MAP_OBJ, event);
        });
        main.getPosition();
        main.searchBox();
    }

    static getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var current_position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                CURRENT_LAT = current_position.lat();
                CURRENT_LNG = current_position.lng();

                if (CURRENT_POSITION_MARKER) {
                    CURRENT_POSITION_MARKER.setPosition(current_position);
                } else {
                    CURRENT_POSITION_MARKER = new google.maps.Marker({
                        flat: true,
                        icon: new google.maps.MarkerImage('img/current_position.png', null, // size
                            null, // origin
                            new google.maps.Point(8, 8), // anchor (move to center of marker)
                            new google.maps.Size(17, 17) // scaled size (required for Retina display icon)
                        ),
                        map: MAP_OBJ,
                        optimized: false,
                        position: current_position,
                        title: 'Current Position',
                        visible: true
                    });
                }

                MAP_OBJ.panTo(current_position);
                return false;
            }, function (error) {
                switch (error.code) {
                    case 1:
                        console.log("Geolocation API Exception: PERMISSION_DENIED");
                        return false;
                        break;
                    case 2:
                        console.log("Geolocation API Exception: POSITION_UNAVAILABLE");
                        return false;
                        break;
                    case 3:
                        console.log("Geolocation API Exception: TIME OUT");
                        return false;
                        break;
                    default:
                        console.log("Geolocation API Exception: ERROR CODE:" + error.code);
                        return false;
                        break;
                }
            }, {
                enableHighAccuracy: true,
                timeout: 5000
            });
        } else {
            console.log("Your device does not support Geolocation API");
            return false;
        }
    }

    static boundsChanged() {
        var bounds = MAP_OBJ.getBounds();
        var bounds_json = $.parseJSON(JSON.stringify(bounds));

        if (!isset(NORTH) || bounds_json["north"] >= NORTH || bounds_json["south"] <= SOUTH || bounds_json["east"] >= EAST || bounds_json["west"] <= WEST) {
            NORTH = bounds_json["north"] + CELLSIZE * (bounds_json["north"] - bounds_json["south"]);
            SOUTH = bounds_json["south"] - CELLSIZE * (bounds_json["north"] - bounds_json["south"]);
            EAST = bounds_json["east"] + CELLSIZE * (bounds_json["east"] - bounds_json["west"]);
            WEST = bounds_json["west"] - CELLSIZE * (bounds_json["east"] - bounds_json["west"]);
            main.pullMarker(NORTH, SOUTH, EAST, WEST);
        }
    }

    static pullMarker(north, south, east, west) {
        var formData = {
            north: north,
            south: south,
            east: east,
            west: west
        };

        if(isset(QUERY)){
            switch(QUERY['facility']){
                case 'aed':
                    var url = 'json/aed.json';
                    break;
                default:
                    return false;
                    break;
            }
        }else{
            return false;
        }
        $.ajax({
            url: url,
            type: "GET",
            data: formData,
            dataType: "json",
            beforeSend: function (xhr, setting) {
                $('#main_loading').show();
            }
        }).done(function (data, textStatus, jqXHR) {
            $('#main_loading').hide();
            main.drawMarker(MAP_OBJ, data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            $('#main_loading').hide();
            console.log(errorThrown.message);
        });
    }

    static drawMarker(map, data) {
        main.removeMarker();

        for (var group_id in data) {
            for (var i in data[group_id]) {
                var position = {
                    lat: Number(data[group_id][i]["lat"]),
                    lng: Number(data[group_id][i]["lng"])
                };
                if (isset(CURRENT_LAT) && isset(CURRENT_LNG)) {
                    var marker = new google.maps.Marker({
                        position: position,
                        // icon: {
                        //   path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        //   scale: 10
                        // },
                        label: {
                            text: getDistance(CURRENT_LAT, CURRENT_LNG, data[group_id][i]["lat"], data[group_id][i]["lng"]) ,
                            color: 'purple'
                        },
                        rotation: 20,
                        map: map
                    });
                } else {
                    var marker = new google.maps.Marker({
                        position: position,
                        rotation: 20,
                        map: map
                    });
                }
                MARKER_ARRAY.push(marker);
                marker.setMap(map);

                var infoWindow = main.generateInfoWindow(marker, data, group_id, i);
                main.onMarkerClick(marker, infoWindow);
            }
        }

        var markerClusterOptions = {
            imagePath: 'https://github.com/gmaps-marker-clusterer/gmaps-marker-clusterer/blob/master/images/',
            gridSize: 50,
            maxZoom: 20
        };
        MARKER_CLUSTER = new MarkerClusterer(map, MARKER_ARRAY, markerClusterOptions);
        return false;
    }


    static setMarker(map, event) {
        main.removeMarker();
        if (event.placeId) {
            var service = new google.maps.places.PlacesService(map);
            service.getDetails({ placeId: event.placeId }, function (place, status) {

                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    var marker = new google.maps.Marker({
                        map: map,
                        position: place.geometry.location
                    });

                    marker.setMap(map);
                    MARKER_ARRAY.push(marker);

                    var content = '';
                    if (place.website) {
                        content += '<a href="' + place.website + '" style="text-decoration:none;"><div style="font-weight:bold;color:#08088A;">' + place.name + '</div></a>';
                    } else {
                        content += '<div><strong>' + place.name + '</strong></div>';
                    }
                    if (place.vicinity) {
                        content += place.vicinity + '<br>';
                    }
                    if (place.formatted_phone_number) {
                        content += '<a href="tel:' + place.formatted_phone_number + '">TEL:' + place.formatted_phone_number + '</a><br>';
                    }
                    content += '<button placename="'+place.name+ '" address="'+place.vicinity+ '" lat="'+marker.position.lat()+ '" lng="'+marker.position.lng()+ '" class="here btn">I\'m here</button>';
                    
                    var infoWindow = new google.maps.InfoWindow({
                        content: content,
                        position: marker.position,
                        maxWidth: 160,
                        pixelOffset: new google.maps.Size(0, -25)
                    });
                    INFO_ARRAY.forEach(function (infoWindow) {
                        infoWindow.setMap(null);
                    });
                    INFO_ARRAY.push(infoWindow);
                    infoWindow.setMap(map);
                    
                    main.onMarkerClick(marker, infoWindow);
                }
            });
        } else {
            var marker = new google.maps.Marker({
                map: map,
                position: event.latLng
            });

            marker.setMap(map);
            MARKER_ARRAY.push(marker);
            var content = '<button lat="'+marker.position.lat()+ '" lng="'+marker.position.lng()+ '"class="here btn">I\'m here</button>';

            var infoWindow = new google.maps.InfoWindow({
                content: content,
                position: marker.position,
                maxWidth: 160,
                pixelOffset: new google.maps.Size(0, -25)
            });
            INFO_ARRAY.forEach(function (infoWindow) {
                infoWindow.setMap(null);
            });
            INFO_ARRAY.push(infoWindow);
            infoWindow.setMap(map);

            main.onMarkerClick(marker, infoWindow);
        }
    }


    static searchBox() {
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        MAP_OBJ.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        var service = new google.maps.places.PlacesService(MAP_OBJ);

        MAP_OBJ.addListener('bounds_changed', function () {
            searchBox.setBounds(MAP_OBJ.getBounds());
        });

        searchBox.addListener('places_changed', function () {
            main.removeSearchboxMarker();

            var places = searchBox.getPlaces();
            if (places.length == 0) {
                return;
            }

            var bounds = new google.maps.LatLngBounds();

            places.forEach(function (place) {
                if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                var icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };

                service.getDetails({ placeId: place.place_id }, function (place, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        var marker = new google.maps.Marker({
                            map: MAP_OBJ,
                            icon: icon,
                            title: place.name,
                            position: place.geometry.location,
                            label: {
                                text: place.name,
                                color: 'purple'
                            }
                        });
                        SEARCHBOX_MARKER_ARRAY.push(marker);

                        var content = '';
                        if (place.website) {
                            content += '<a href="' + place.website + '" style="text-decoration:none;"><div style="font-weight:bold;color:#08088A;">' + place.name + '</div></a>';
                        } else {
                            content += '<div><strong>' + place.name + '</strong></div>';
                        }
                        if (place.vicinity) {
                            content += place.vicinity + '<br>';
                        }
                        if (place.formatted_phone_number) {
                            content += '<a href="tel:' + place.formatted_phone_number + '">TEL:' + place.formatted_phone_number + '</a><br>';
                        }
                        content += '<button placename="' + place.name + '" address="' + place.vicinity + '" class="here btn>I am here</button>';

                        var infoWindow = new google.maps.InfoWindow({
                            content: content,
                            position: marker.position,
                            maxWidth: 160,
                            pixelOffset: new google.maps.Size(-7, -25)
                        });
                        // infoWindow.open(MAP_OBJ);
                        SEARCHBOX_INFO_ARRAY.push(infoWindow);
  
                        google.maps.event.addListener(marker, 'click', function (event) {
                            main.removeMarker();
                            infoWindow.open(MAP_OBJ);
                        });
                    }
                });
                if (place.geometry.viewport) {
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            MAP_OBJ.fitBounds(bounds);
        });
    }


    static generateInfoWindow(marker, data, group_id, i) {
        var content = '';

        content += '<div style="font-weight:bold">' + data[group_id][i]["title"] + '</div>';

        if (data[group_id][i]["place_name"] != '') {
            content += data[group_id][i]["place_name"] + '<br>';
        }

        if (i == 0) {
            var infoWindow = new google.maps.InfoWindow({
                content: content,
                position: marker.position,
                maxWidth: 160,
                pixelOffset: new google.maps.Size(0, -25)
            });
            INFO_ARRAY.push(infoWindow);
            infoWindow.setMap(MAP_OBJ);
            return infoWindow;
        } else if (i == data[group_id].length - 1) {
            INFO_ARRAY[INFO_ARRAY.length - 1].close(MAP_OBJ);
            var infoWindow = new google.maps.InfoWindow({
                content: INFO_ARRAY[INFO_ARRAY.length - 1].content.replace('<button id="group' + group_id + '" class="btn here">I\"m here</button>', '<button id="group' + group_id + '" class="btn">And Other ' + i + '</button>'),
                position: INFO_ARRAY[INFO_ARRAY.length - 1].position,
                maxWidth: 160,
                pixelOffset: new google.maps.Size(0, -25)
            });
            INFO_ARRAY[INFO_ARRAY.length - 1] = infoWindow;
            infoWindow.setMap(MAP_OBJ);
            return infoWindow;
        }
    }


    static onMarkerClick(marker, infoWindow) {
        google.maps.event.addListener(marker, 'click', function (event) {
            infoWindow.open(MAP_OBJ);
        });
    }


    static removeMarker() {
        for (var i = 0; i < MARKER_ARRAY.length; i++) {
            MARKER_ARRAY[i].setMap(null);
        }
        MARKER_ARRAY = [];

        for (var i = 0; i < INFO_ARRAY.length; i++) {
            INFO_ARRAY[i].setMap(null);
        }
        INFO_ARRAY = [];
        for (var i = 0; i < SEARCHBOX_INFO_ARRAY.length; i++) {
            SEARCHBOX_INFO_ARRAY[i].setMap(null);
        }
        if (isset(MARKER_CLUSTER)) {
            MARKER_CLUSTER.clearMarkers();
        }
    }


    static removeSearchboxMarker() {
        for (var i = 0; i < MARKER_ARRAY.length; i++) {
            MARKER_ARRAY[i].setMap(null);
        }
        MARKER_ARRAY = [];

        for (var i = 0; i < INFO_ARRAY.length; i++) {
            INFO_ARRAY[i].setMap(null);
        }
        INFO_ARRAY = [];
        if (isset(MARKER_CLUSTER)) {
            MARKER_CLUSTER.clearMarkers();
        }
        for (var i = 0; i < SEARCHBOX_MARKER_ARRAY.length; i++) {
            SEARCHBOX_MARKER_ARRAY[i].setMap(null);
        }
        SEARCHBOX_MARKER_ARRAY = [];

        for (var i = 0; i < SEARCHBOX_INFO_ARRAY.length; i++) {
            SEARCHBOX_INFO_ARRAY[i].setMap(null);
        }
        SEARCHBOX_INFO_ARRAY = [];
    }


    static onButtonClick() {
        $(document).off('click', '#current_area_icon');$(document).on("click", "#current_area_icon", function (event) {
            event.preventDefault();
            event.stopPropagation();
            drawer.close();
            NORTH = null;
            main.getPosition();
        });

        $(document).off('click', '#search_icon');$(document).on("click", "#search_icon", function (event) {
            event.preventDefault();
            event.stopPropagation();
            drawer.open();
        });
    }
}
new main();