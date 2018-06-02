'use strict';
var SEARCH_POSITION;
var SEARCH_ZOOM;
var SEARCH_DISTANCE = 200;

class search{
    static exec() {
        $(document).off('click', '#searchEvent'); $(document).on('click', '#searchEvent', function (event) {
            event.preventDefault();
            event.stopPropagation();

            var center = MAP_OBJ.getCenter();
            var initLat = center.lat();
            var initLng = center.lng();

            // var area = new Area(initLat,initLng,SEARCH_DISTANCE*1000); //km
            var area = new Area(initLat,initLng,SEARCH_DISTANCE*1609.34); //mile

            var formData = {
                "user_id": localStorage.user_id,
                "hash": localStorage.hash,
                "keyword": $('#search_container [name="keyword"]').val(),
                "north": area.north,
                "south": area.south,
                "east": area.east,
                "west": area.west,
            }
            if ($('#search_container [name="max_cost"]').val() != "") {
                formData["max_cost"] = $('#search_container [name="max_cost"]').val();
            }
            if ($('#search_container [name="max_participant"]').val() != "") {
                formData["max_participant"] = $('#search_container [name="max_participant"]').val();
            }
            if ($('#search_container [name="min_participant"]').val() != "") {
                formData["min_participant"] = $('#search_container [name="min_participant"]').val();
            }
            if ($('#search_container [name="start_from"]').val() != "") {
                formData["start_from"] = dateConvertISO($('#search_container [name="start_from"]').val());
            }
            if ($('#search_container [name="start_to"]').val() != "") {
                formData["start_to"] = dateConvertISO($('#search_container [name="start_to"]').val());
            }
            formData["target_gender"] = $('#search_container .target_gender:checked').val();
            formData["age_lower"] =  $('#search_container [name="target_age"]').val().split(",")[0];
            formData["age_higher"] =  $('#search_container [name="target_age"]').val().split(",")[1];

            $.ajax({
                url: ENDPOINT+"MapControl/Search.php",
                type: "POST",
                data: formData,
                dataType: "json",
                beforeSend: function (xhr, setting) {
                    $('button').attr('disabled', true);
                    $('#drawer_loading').show();
                },
                complete: function (xhr, textStatus) {
                    $('button').attr('disabled', false);
                    $('#drawer_loading').hide();
                },
            })
            .done(function (data, textStatus, jqXHR) {
                if(isset(data)){
                    main.removeMarker();

                    var center_lat = 0;
                    var center_lng = 0;
                    var max_lat = -90;
                    var max_lng = -180;
                    var min_lat = 90;
                    var min_lng = 180;
                    var count = 0;

                    for (var group_id in data) {
                        center_lat += data[group_id][0]["lat"];
                        center_lng += data[group_id][0]["lng"];
                        count += 1;
    
                        if (data[group_id][0]["lat"] > max_lat) {
                            max_lat = data[group_id][0]["lat"];
                        }
                        if (data[group_id][0]["lng"] > max_lng) {
                            max_lng = data[group_id][0]["lng"];
                        }
                        if (data[group_id][0]["lat"] < min_lat) {
                            min_lat = data[group_id][0]["lat"];
                        }
                        if (data[group_id][0]["lng"] < min_lng) {
                            min_lng = data[group_id][0]["lng"];
                        }
                    }
                  
                    // SEARCH_POSITION = new google.maps.LatLng(center_lat / count, center_lng / count);
                    // MAP_OBJ.panTo(SEARCH_POSITION);

                    for (var level = MAX_ZOOM; level >= 1; level--) {
                        MAP_OBJ.setZoom(level);
                        var bounds = MAP_OBJ.getBounds();
                        var bounds_json = $.parseJSON(JSON.stringify(bounds));
                        if (bounds_json['north'] > max_lat && bounds_json['south'] < min_lat && bounds_json['east'] > max_lng && bounds_json['west'] < min_lng) {
                            SEARCH_ZOOM = level;
                            break;
                        }
                    }
                    $('#list_container').empty();
                    for (var group_id in data) {
                        for (var i in data[group_id]) {
                            list.generate(data, group_id, i);
                            main.showIndividual(data, group_id, i)
                        }
                    }
                    $('#search_container .form_area').hide('slow');
                    $('#search_container button').attr({'id':'back_to_search'});
                    $('#search_container button').text('Back to search');
                    $('#list_container').show();

                    main.setMarker(MAP_OBJ, data);
                    
                    return false;
                }
                else{
                    alert('No results found.')
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                return false;
            });
        });
    }

    static validationSearch(){
        $("#searchEvent").hide();
        $('#search_container input').off('blur change');
        $('#search_container input').on('blur change',function (event) {
            event.preventDefault();
            event.stopPropagation();
            search.validation();
        });
    }

    static validation(){
        $("#search_max_cost").each(function(){
            var cost = $(this).val();
            if(cost!='' && cost.match( /[^0-9]/)){
                $("#search_max_cost_error").text('Participation cost must be an integer value.');
            }
            else{
                $("#search_max_cost_error").empty();
            }
        });
        $("#search_max_participant").each(function(){
            var participant = $(this).val();
            if(participant!='' && participant.match( /[^0-9]/)){
                $("#search_participant_error").text('Number of Participants must be an integer value.');
            }
            else if(participant!='' && parseInt(participant)< parseInt( $("#search_min_participant").val())){
                $("#search_participant_error").text('Max Participants cannot be less than min participants.');
            }
            else{
                $("#search_participant_error").empty();
            }
        });
        $("#search_min_participant").each(function(){
            var participant = $(this).val();
            if(participant!='' && participant.match( /[^0-9]/)){
                $("#search_participant_error").text('Number of Participants must be an integer value.');
            }
            else if(participant!='' && parseInt(participant)> parseInt( $("#search_max_participant").val())){
                $("#search_participant_error").text('Max Participants cannot be less than min participants.');
            }
            else{
                $("#search_participant_error").empty();
            } 
        });
        var valid=true;
        $("#search_container .message_alert").each( function() {
            if(isset($("#search_container .message_alert").text())){
                valid = false;
            }
        });
        if(valid){
            show("#searchEvent");
        }
        else{
            hide("#searchEvent");
        }
    }

    static calenderControl(){
        $('#search_container #search_start_to').bootstrapMaterialDatePicker({ weekStart: 0, format: 'DD/MM/YYYY HH:mm' }).on('change', function (e, date) {
            search.validation();
            $('#search_container #search_start_from').bootstrapMaterialDatePicker('setMaxDate', date);
        });
        $('#search_container #search_start_from').bootstrapMaterialDatePicker({ weekStart: 0, format: 'DD/MM/YYYY HH:mm' }).on('change', function (e, date) {
            search.validation();
            $('#search_container #search_start_to').bootstrapMaterialDatePicker('setMinDate', date);
        });
    }
    static sliderControl(){
        $('#search_container .range-slider-age').jRange({
            from: 18,
            to: 100,
            step: 1,
            scale: [18, 20, 40, 60, 80, 100],
            format: '%s',
            width: "100%",
            showLabels: true,
            isRange: true
        });
        $('#search_container .range-slider-distance').jRange({
            from: 1,
            to: 200,
            step: 1,
            scale: [0, 50, 100, 150, 200],
            format: '%s mile',
            width: "100%",
            showLabels: true,
        });
        $('#search_container .selected-bar').css('width', '100%');
        $('#search_container .pointer-label.low').css('left', '0%');
        $('#search_container .pointer-label.high').css('left', '90%');
        $('#search_container .pointer.low').css('left', '-2%');
        $('#search_container .pointer.high').css('left', '98%');

    }
}

$(document).off('change', '#search_container [name="distance"]');
$(document).on('change', '#search_container [name="distance"]', function (event) {
    SEARCH_DISTANCE = $('#search_container [name="distance"]').val();
});


$(document).off('click', '#back_to_search');
$(document).on('click', '#back_to_search', function (event) {
    $('#search_container .form_area').show('slow');
    $('#search_container button').attr({'id':'searchEvent'});
    $('#search_container button').text('Search');
});


