'use strict';

var MAP_OBJ;
var MARKER_ARRAY = [];
var INFO_ARRAY = [];
var SEARCHBOX_MARKER_ARRAY = [];
var SEARCHBOX_INFO_ARRAY = [];
var PLACE_SEARCH = false;
var EVENT_SEARCH = false;
var MARKER_CLUSTER;
var LAT, LNG;
var NORTH, SOUTH, EAST, WEST;
var CURRENT_POSITION_MARKER;
var CURRENT_LAT, CURRENT_LNG;
var CELLSIZE = 5;
var MAX_ZOOM = 20;

var MAP_API_KEY_BROWSER = 'AIzaSyDTyfLfyPFK-vudD_ClwtWsfNQ4W3nATbQ';

function init() {
    include("#headline_container", "src/headline");
    include("#detail_container", "src/detail");
    include("#timeline_container", "src/timeline");
    include("#organizer_container", "src/organizer");
    include("#search_container", "src/search");
    include("#password_reset_container", "src/password_reset");
    include("#activation_container", "src/activation");
    include("#user_container", "src/user");
    include("#profile_container", "src/profile");
    include("#user_timeline_container", "src/user_timeline");
    include("#setting_container", "src/setting");
    include("#list_container", "src/list");
    include("#auth_container", "src/auth");
    include("#terms_container", "src/terms");
    include("#payment_container", "src/payment");
    include("#menu_container", "src/menu");

    main.background();
    main.showMap();
}

class main {
    constructor() {
        includeScript('lib/MDL/material.min.js');
        includeScript('lib/MarkerClusterer/markerclusterer.js');
        includeScript('lib/JRange/jquery.range.js');
        includeScript('lib/DateTimePicker/moment.min.js');
        includeScript('lib/DateTimePicker/js/bootstrap-material-datetimepicker.js');
        includeScript('lib/CryptoJS/md5.js');
        includeScript('lib/JqueryQRCode/jquery-qrcode.js');
        includeScript('lib/JqueryQRCode/qrcode.js');
        includeScript('lib/JqueryQRCode/qr-packed.js');

        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
            var MAP_API_KEY = MAP_API_KEY_ANDROID ;
        }
        else{
            var MAP_API_KEY = MAP_API_KEY_BROWSER ;
        }
        includeScript('https://maps.googleapis.com/maps/api/js?key=' + MAP_API_KEY + '&libraries=places&language=en&region=US&callback=init');
    }

    static pushNotice() {
        if (isset(localStorage.user_id) && isset(localStorage.hash)) {
            userTimeline.pullNotice();
            var noticeCount = $('#notice_count').text();
            if (noticeCount > 0) {
                cordova.plugins.notification.local.schedule({
                    // icon: https://gatherlink.site/img/icon.png",
                    sound: 'https://gatherlink.site/sound/push.wav',
                    title: APP_NAME,
                    text: 'There is ' + noticeCount + ' unread notifications',
                });
            }
        }
    }

    static background() {
        if (typeof (cordova) != "undefined" && !isset(localStorage.disable_notice)) {
            cordova.plugins.backgroundMode.enable();
            cordova.plugins.backgroundMode.overrideBackButton();
            cordova.plugins.backgroundMode.setDefaults({
                resume: true,
                hidden: false,
                silent: true,
                bigText: true,
            })
            cordova.plugins.backgroundMode.on('activate', function () {
                var interval = 3 * 3600000; //3hours
                this.backgroundProcess = setInterval(function () {
                    main.pushNotice();
                }, interval);
            });
            cordova.plugins.backgroundMode.on('deactivate', function () {
                clearInterval(this.backgroundProcess);
            });
        }
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
            },
        };
        MAP_OBJ = new google.maps.Map(map_canvas, options);

        google.maps.event.addListener(MAP_OBJ, 'bounds_changed', function (event) {
            if(!PLACE_SEARCH){
                main.boundsChanged();
            }
        });
        google.maps.event.addListener(MAP_OBJ, 'click', function (event) {
            event.stop();
            main.setMarkerAsOrganizer(MAP_OBJ, event);
        });
        main.getPosition();
        main.onButtonClick();
        main.searchBox();
    }

    static getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    var current_position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    CURRENT_LAT = current_position.lat();
                    CURRENT_LNG = current_position.lng();

                    if (CURRENT_POSITION_MARKER) {
                        CURRENT_POSITION_MARKER.setPosition(current_position);
                    }
                    else {
                        CURRENT_POSITION_MARKER = new google.maps.Marker({
                            flat: true,
                            icon: new google.maps.MarkerImage(
                                'img/current_position.png',
                                null, // size
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

                },
                function (error) {
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
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000
                }
            );
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
            west: west,
        };

        if (isset(localStorage.user_id) && isset(localStorage.hash)) {
            formData['user_id'] = localStorage.user_id;
            formData['hash'] = localStorage.hash;
        }

        $.ajax({
            url: ENDPOINT + "MapControl/PullMarker.php",
            type: "POST",
            data: formData,
            dataType: "json",
            beforeSend: function (xhr, setting) {
                $('#main_loading').show();
            },
            complete: function (xhr, textStatus) {
                $('#main_loading').hide();
            },
        })
            .done(function (data, textStatus, jqXHR) {
                // console.log(JSON.stringify(data, null, '\t'));
                main.setMarker(MAP_OBJ, data);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            });
    }

    static setMarker(map, data) {
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
                            text: getDistance(CURRENT_LAT, CURRENT_LNG, data[group_id][i]["lat"], data[group_id][i]["lng"]) + ' mile',
                            color: 'purple'
                        },
                        rotation: 20,
                        map: map,
                    });
                } else {
                    var marker = new google.maps.Marker({
                        position: position,
                        rotation: 20,
                        map: map,
                    });
                }
                MARKER_ARRAY.push(marker);
                marker.setMap(map);

                var infoWindow = main.generateInfoWindow(marker, data, group_id, i);
                main.onMarkerClick(marker, infoWindow);
            }
        }

        for (var group_id in data) {
            if (isset(QUERY) && isset(QUERY['event_id'])) {
                main.showGoupByQuery(data, group_id);
            }
            else {
                main.showGroup(data, group_id);
            }
        }

        var markerClusterOptions = {
            imagePath: 'lib/MarkerClusterer/',
            gridSize: 50,
            maxZoom: 20,
        };
        MARKER_CLUSTER = new MarkerClusterer(map, MARKER_ARRAY, markerClusterOptions);

        return false;
    }

    static setMarkerAsOrganizer(map, event) {
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
                    }
                    else {
                        content += '<div><strong>' + place.name + '</strong></div>';
                    }
                    if (place.vicinity) {
                        content += place.vicinity + '<br>';
                    }
                    if (place.formatted_phone_number) {
                        content += '<a href="tel:' + place.formatted_phone_number + '">TEL:' + place.formatted_phone_number + '</a><br>';
                    }
                    content += '<button id="showCreateEvent" data-placename="' + place.name + '" data-address="' + place.vicinity + '"class="btn0">Organize An Event Here</button>';

                    var infoWindow = new google.maps.InfoWindow({
                        content: content,
                        position: marker.position,
                        maxWidth:160,
                        pixelOffset: new google.maps.Size(0, -25),
                    });
                    INFO_ARRAY.forEach(function (infoWindow) {
                        infoWindow.setMap(null);
                    });
                    INFO_ARRAY.push(infoWindow);
                    infoWindow.setMap(map);

                    main.onMarkerClick(marker, infoWindow);

                    LAT = marker.position.lat();
                    LNG = marker.position.lng();
                }
            });
        }
        else {
            var marker = new google.maps.Marker({
                map: map,
                position: event.latLng
            });

            marker.setMap(map);
            MARKER_ARRAY.push(marker);

            var content = '<button id="showCreateEvent" class="btn0">Organize An Event Here</button>';

            var infoWindow = new google.maps.InfoWindow({
                content: content,
                position: marker.position,
                maxWidth:160,
                pixelOffset: new google.maps.Size(0, -25),
            });
            INFO_ARRAY.forEach(function (infoWindow) {
                infoWindow.setMap(null);
            });
            INFO_ARRAY.push(infoWindow);
            infoWindow.setMap(map);

            main.onMarkerClick(marker, infoWindow);

            LAT = marker.position.lat();
            LNG = marker.position.lng();
        }
    }

    static searchBox() {
        $(document).off('focus', '#pac-input'); $(document).on("focus", "#pac-input", function (event) {
            event.preventDefault();
            event.stopPropagation();
            $("#overlay_drawer").css({
                'z-index': 1,
            });
            $("#overlay_drawer").animate({
                'filter': 'alpha(opacity=0.5)',
                '-moz-opacity': 0.5,
                'opacity': 0.5,
            }, 300);
        });

        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        MAP_OBJ.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        var service = new google.maps.places.PlacesService(MAP_OBJ);

        MAP_OBJ.addListener('bounds_changed', function () {
            if(!isset(SEARCH_POSITION)){
                searchBox.setBounds(MAP_OBJ.getBounds());
            }
        });

        searchBox.addListener('places_changed', function () {
            main.removeSearchboxMarker();
            
            $("#overlay_drawer").css({
                'z-index': 0,
            });
            $("#overlay_drawer").animate({
                'filter': 'alpha(opacity=0)',
                '-moz-opacity': 0,
                'opacity': 0,
            }, 300);

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
                            },
                        });
                        SEARCHBOX_MARKER_ARRAY.push(marker);

                        var content = '';
                        if (place.website) {
                            content += '<a href="' + place.website + '" style="text-decoration:none;"><div style="font-weight:bold;color:#08088A;">' + place.name + '</div></a>';
                        }
                        else {
                            content += '<div><strong>' + place.name + '</strong></div>';
                        }
                        if (place.vicinity) {
                            content += place.vicinity + '<br>';
                        }
                        if (place.formatted_phone_number) {
                            content += '<a href="tel:' + place.formatted_phone_number + '">TEL:' + place.formatted_phone_number + '</a><br>';
                        }
                        content += '<button id="showCreateEvent" data-placename="' + place.name + '" data-address="' + place.vicinity + '"class="btn0">Organize An Event Here</button>';

                        var infoWindow = new google.maps.InfoWindow({
                            content: content,
                            position: marker.position,
                            maxWidth:160,
                            pixelOffset: new google.maps.Size(-7, -25),
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
            PLACE_SEARCH = true;
            setTimeout(function(){PLACE_SEARCH = false;},5000);
            MAP_OBJ.fitBounds(bounds);
        });
    }

    static showGroup(data, group_id) {
        $(document).off("click", "#group" + group_id);
        $(document).on("click", "#group" + group_id, function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (data[group_id].length == 1) {
                $('.back').hide();
                headline.show(data, group_id, 0);
                detail.show(data, group_id, 0);
                timeline.show(data, group_id, 0);

                $('#drawer .container').hide();
                $('#individual_container').show();
                $('#headline_container').show();
                $('#detail_container').show();
            }
            else {
                $('#list_container').empty();
                for (var i = 0; i < data[group_id].length; i++) {
                    list.generate(data, group_id, i);
                    main.showIndividual(data, group_id, i)
                }
                $('#drawer .container').hide();
                $('#list_container').show();
            }
            drawer.open();
            return false;
        });
    }

    static showGoupByQuery(data, group_id) {
        for (var i = 0; i < data[group_id].length; i++) {
            if (data[group_id][i]['event_id'] == QUERY['event_id']) {
                QUERY['group_id'] = group_id;
                QUERY['i'] = i;

                headline.show(data, QUERY['group_id'], QUERY['i']);
                detail.show(data, QUERY['group_id'], QUERY['i']);
                timeline.show(data, QUERY['group_id'], QUERY['i']);

                $('#headline_container .back').hide();
                $('#drawer .container').hide();
                $('#individual_container').show();
                $('#headline_container').show();
                $('#detail_container').show();
                drawer.open();

                if (isset(QUERY['action']) && QUERY['action'] == 'cooperate' && isset(QUERY['hash'])) {
                    $(document).on('succeed', '#login', function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        $('#detail_cooperator_container').show();
                        $('#detail_add_cooperator').show();
                        $('#detail_add_cooperator button').attr({ 'id': 'acceptCooperate' }).text('Accept the request for co-organization.');
                        return false;
                    });
                    if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
                        $('#modal .container').hide();
                        $("#auth_container").show();
                        modal.open();
                        return false;
                    }
                    else {
                        $('#detail_cooperator_container').show();
                        $('#detail_add_cooperator').show();
                        $('#detail_add_cooperator button').attr({ 'id': 'acceptCooperate' }).text('Accept the request for co-organization.');
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
    }

    static showIndividual(data, group_id, i) {
        $(document).off("click", "#individual" + data[group_id][i]["event_id"]);
        $(document).on("click", "#individual" + data[group_id][i]["event_id"], function (event) {
            event.preventDefault();
            event.stopPropagation();

            MAP_OBJ.panTo(new google.maps.LatLng(data[group_id][i]["lat"], data[group_id][i]["lng"]));
            MAP_OBJ.setZoom(MAX_ZOOM);

            headline.show(data, group_id, i);
            detail.show(data, group_id, i);
            timeline.show(data, group_id, i);
            $('#drawer .container').hide();
            $('#individual_container').show();
            $("#individual_container").scrollTop(0);
            $('#headline_container').show();
            $('#detail_container').show();
            $('.back').hide();
            $('#back_to_list').show();
            return false;
        });
    }

    static generateInfoWindow(marker, data, group_id, i) {
        var content = '';
        if (data[group_id][i]['img_count'] > 0) {
            content += '<img src="' + DATA_ROOT + 'gathering/' + data[group_id][i]["event_id"] + '/ref_img/1" onerror=this.style.display="none" style="width:70%;"><br>'
        }
        content += '<div style="font-weight:bold">' + data[group_id][i]["title"] + '</div>';

        if (data[group_id][i]["place_name"] != '') {
            content += data[group_id][i]["place_name"] + '<br>';
        }
        content
            += 'Start: ' + dateConvertUS(data[group_id][i]["start"]) + '<br>'
            + getStatusString(
                data[group_id][i]["status"],
                data[group_id][i]["timezone"],
                new Date(data[group_id][i]["deadline"]),
                new Date(data[group_id][i]["start"]),
                new Date(data[group_id][i]["end"])
            )
            + '<button id="group' + group_id + '" class="btn0">Show Detail</button>';

        if (i == 0) {
            var infoWindow = new google.maps.InfoWindow({
                content: content,
                position: marker.position,
                maxWidth:160,
                pixelOffset: new google.maps.Size(0, -25),
            });
            INFO_ARRAY.push(infoWindow);
            infoWindow.setMap(MAP_OBJ);
            return infoWindow;
        }
        else if (i == data[group_id].length - 1) {
            INFO_ARRAY[INFO_ARRAY.length - 1].close(MAP_OBJ);
            var infoWindow = new google.maps.InfoWindow({
                content: INFO_ARRAY[INFO_ARRAY.length - 1].content
                    .replace('<button id="group' + group_id + '" class="btn0">Show Detail</button>', '<button id="group' + group_id + '" class="btn0">And Other ' + i + '</button>'),
                position: INFO_ARRAY[INFO_ARRAY.length - 1].position,
                maxWidth:160,
                pixelOffset: new google.maps.Size(0, -25),
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

    static onButtonClick() {
        $(document).off('click', '#menu_icon'); $(document).on("click", "#menu_icon", function (event) {
            event.preventDefault();
            event.stopPropagation();
            menu.open();
            userTimeline.pullNotice();

        });
        $(document).off('click', '#current_area_icon'); $(document).on("click", "#current_area_icon", function (event) {
            event.preventDefault();
            event.stopPropagation();

            drawer.close();
            $('#drawer .container').hide("slow");
            NORTH = null;
            main.getPosition();
        });
        $(document).off('click', '#search_icon'); $(document).on("click", "#search_icon", function (event) {
            event.preventDefault();
            event.stopPropagation();
            $('#drawer .container').hide();
            $('#search_container').show();
            componentHandler.upgradeDom();
            drawer.open();

            search.validationSearch();
            search.calenderControl();
            search.sliderControl();
            search.exec();
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
}
new main();
