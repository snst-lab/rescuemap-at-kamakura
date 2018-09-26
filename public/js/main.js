"use strict";

var QUERY=[];
var MAP_OBJ;
var MARKER_ARRAY = [];
var INFO_ARRAY = [];
var CUSTOM_MARKER_ARRAY = [];
var CUSTOM_INFO_ARRAY = [];

var MARKER_CLUSTER;
var LAT, LNG;
var NORTH, SOUTH, EAST, WEST;
var CURRENT_POSITION_MARKER;
var CURRENT_LAT, CURRENT_LNG;
var CELLSIZE = 3;
var MAX_ZOOM = 20;

var SEARCHBOX_MARKER_ARRAY = [];
var SEARCHBOX_INFO_ARRAY = [];

var MAP_API_KEY = 'AIzaSyDTyfLfyPFK-vudD_ClwtWsfNQ4W3nATbQ';
var APP_ROOT = 'https://kamakura-maps.glitch.me/';
var STORAGE_ROOT = 'https://github.com/snst-lab/rescuemap-at-kamakura/blob/master/public/';


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
        var init_latlng = new google.maps.LatLng(35.319017,139.550689);
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
        if(isset(QUERY)){
            switch(QUERY['facility']){
                case 'aed':
                    var url = APP_ROOT + 'data/aed.csv';
                    $('#header').text('AED設置場所＠鎌倉');
                    MAP_OBJ.setZoom(19);
                    break;
                case 'hydrant':
                    var url = APP_ROOT + 'data/hydrant.csv';
                    $('#header').text('消火栓設置場所＠鎌倉');
                    MAP_OBJ.setZoom(19);
                    break;
                case 'watertank':
                    var url = APP_ROOT + 'data/watertank.csv';
                    $('#header').text('防火水槽設置場所＠鎌倉');
                    MAP_OBJ.setZoom(17);
                    break;
                case 'widearea-shelters':
                    var url = APP_ROOT + 'data/widearea-shelters.csv';
                    $('#header').text('広域避難所＠鎌倉');
                    MAP_OBJ.setZoom(15);
                    break;
                case 'welfare-shelters':
                    var url = APP_ROOT + 'data/widearea-shelters.csv';
                    $('#header').text('福祉避難所＠鎌倉');
                    MAP_OBJ.setZoom(15);
                    break;
                case 'public':
                    var url = APP_ROOT + 'data/public.csv';
                    $('#header').text('公共施設＠鎌倉');
                    MAP_OBJ.setZoom(17);
                    break;
                case 'universal':
                    var url = APP_ROOT + 'data/universal.csv';
                    $('#header').text('バリアフリー施設＠鎌倉');
                    MAP_OBJ.setZoom(17);
                    break;
                default:
                    $('#header').text('レスキューMap＠鎌倉');
                    return false;
                    break;
            }
        }else{
            return false;
        }
        $("#loading").show();
        csv2json(url).then(function(data){
              var dataInCell = [];
              if(getDistance(CURRENT_LAT, CURRENT_LNG, 35.319017,139.550689) >100 ){
                  MAP_OBJ.panTo(new google.maps.LatLng(35.319017,139.550689));
              }
              for(var i=0;i<data.length;i++){
                  data[i]["distance"] = getDistance(CURRENT_LAT, CURRENT_LNG, data[i]["lat"], data[i]["lng"])+' km';
                  if( data[i]['lat'] < north && data[i]['lat'] > south && data[i]['lng'] < east && data[i]['lng'] > west ) {
                      dataInCell.push(data[i]);
                  }
              }
              data = null;
              main.drawMarker(MAP_OBJ, dataInCell);
              $("#loading").hide();
        });
    }

    static drawMarker(map, data) {
        main.removeMarker();

        for (var i in data) {
            if(typeof data[i]["lat"]!=='undefined' && typeof data[i]["lng"]!=='undefined'){
                var position = {
                    lat: Number(data[i]["lat"]),
                    lng: Number(data[i]["lng"])
                };
                if (isset(CURRENT_LAT) && isset(CURRENT_LNG)) {
                    var marker = new google.maps.Marker({
                        position: position,
                        // icon: {
                        //   path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        //   scale: 10
                        // },
                        // label: {
                        //     text: getDistance(CURRENT_LAT, CURRENT_LNG, data[i]["lat"], data[i]["lng"]) ,
                        //     color: 'purple'
                        // },
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

                var infoWindow = main.generateInfoWindow(marker, data, i);
                main.onMarkerClick(marker, infoWindow);
            }
        }

        var markerClusterOptions = {
            imagePath: STORAGE_ROOT + 'img/MarkerClusterer/',
            gridSize: 50,
            maxZoom: 20
        };
        MARKER_CLUSTER = new MarkerClusterer(map, MARKER_ARRAY, markerClusterOptions);
      
        return false;
    }


    static setMarker(map, event) {
        main.removeCustomMarker();
        if (event.placeId) {
            var service = new google.maps.places.PlacesService(map);
            service.getDetails({ placeId: event.placeId }, function (place, status) {

                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    var marker = new google.maps.Marker({
                        map: map,
                        position: place.geometry.location
                    });

                    marker.setMap(map);
                    CUSTOM_MARKER_ARRAY.push(marker);

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
                    content += '<button placename="'+place.name+ '" address="'+place.vicinity+ '" lat="'+marker.position.lat()+ '" lng="'+marker.position.lng()+ '" class="here btn">位置情報を発信</button>';
                    
                    var infoWindow = new google.maps.InfoWindow({
                        content: content,
                        position: marker.position,
                        maxWidth: 160,
                        pixelOffset: new google.maps.Size(0, -25)
                    });
                    CUSTOM_INFO_ARRAY.forEach(function (infoWindow) {
                        infoWindow.setMap(null);
                    });
                    CUSTOM_INFO_ARRAY.push(infoWindow);
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
            CUSTOM_MARKER_ARRAY.push(marker);
            var content = '<button lat="'+marker.position.lat()+ '" lng="'+marker.position.lng()+ '"class="here btn">位置情報を発信</button>';

            var infoWindow = new google.maps.InfoWindow({
                content: content,
                position: marker.position,
                maxWidth: 160,
                pixelOffset: new google.maps.Size(0, -25)
            });
            CUSTOM_INFO_ARRAY.forEach(function (infoWindow) {
                infoWindow.setMap(null);
            });
            CUSTOM_INFO_ARRAY.push(infoWindow);
            infoWindow.setMap(map);

            main.onMarkerClick(marker, infoWindow);
        }
    }


    static generateInfoWindow(marker, data, i) {
        var content = '';
        content += '<div style="font-weight:bold">' + data[i]["name"] + '</div>';
        content += '<div style="font-weight:bold;color:blue">' + data[i]["distance"]  +'</div>';
        content += '<button placename="'+data[i]["name"]+ '" lat="'+data[i]["lat"]+ '" lng="'+data[i]["lng"]+'" class="here btn">位置情報を発信</button>';
      
        var infoWindow = new google.maps.InfoWindow({
            content: content,
            position: marker.position,
            maxWidth: 160,
            pixelOffset: new google.maps.Size(0, -25),
            disableAutoPan: true
        });
        INFO_ARRAY.push(infoWindow);
        infoWindow.setMap(MAP_OBJ);
        return infoWindow;
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
  
    static removeCustomMarker() {
        for (var i = 0; i < CUSTOM_MARKER_ARRAY.length; i++) {
            CUSTOM_MARKER_ARRAY[i].setMap(null);
        }
        CUSTOM_MARKER_ARRAY = [];
        for (var i = 0; i < CUSTOM_INFO_ARRAY.length; i++) {
          CUSTOM_INFO_ARRAY[i].setMap(null);
        }
        CUSTOM_INFO_ARRAY = [];
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
        $("#current_area_icon").on("click");
        $("#current_area_icon").on("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            drawer.close();
            NORTH = null;
            main.getPosition();
        });

        $('#search_icon').off("click");
        $('#search_icon').on("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            drawer.open();
        });

        $('.facility').off('click');
        $('.facility').on('click',function(){
            QUERY['facility']=$(this).attr('facility');
            var bounds = MAP_OBJ.getBounds();
            var bounds_json = $.parseJSON(JSON.stringify(bounds));
            NORTH = bounds_json["north"] + CELLSIZE * (bounds_json["north"] - bounds_json["south"]);
            SOUTH = bounds_json["south"] - CELLSIZE * (bounds_json["north"] - bounds_json["south"]);
            EAST = bounds_json["east"] + CELLSIZE * (bounds_json["east"] - bounds_json["west"]);
            WEST = bounds_json["west"] - CELLSIZE * (bounds_json["east"] - bounds_json["west"]);
            main.pullMarker(NORTH, SOUTH, EAST, WEST);
            drawer.close();
        });
      
        $(document).off("click", "button.here");
        $(document).on("click", "button.here", function (event) {
            event.preventDefault();
            event.stopPropagation();

            var reqBody = {};
            if(isset(QUERY['hash'])){
              reqBody['hash']=QUERY['hash'];
            }else{
              alert('LINE IDを特定できません。もう一度LINE BOTにメッセージを送り地図を開いてください。')
              return false;
            }

            var result = prompt('あなたの位置情報を送信します：追加メッセージがあれば入力してください。','人が倒れています！誰かAEDを持ってきてください！');

           if(result!==null){
              reqBody['message'] = result; 
            }else{
              alert('位置情報の送信をキャンセルしました。');
              return false;
            }

            const self = this;
            ['lat','lng','placename','address'].forEach(function(attr){
                if(isset($(self).attr(attr))){reqBody[attr] = $(self).attr(attr);}
            });

            $.ajax({
                url: "https://kamakura-maps.glitch.me/here",
                type: "POST",
                data: reqBody,
                dataType: "json",
                beforeSend: function (xhr, setting) {
                    $('#main_loading').show();
                }
            });
            alert('位置情報を送信しました。');
            $('#main_loading').hide();
        });
    }
}
new main();