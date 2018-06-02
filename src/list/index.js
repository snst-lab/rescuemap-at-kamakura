
'use strict';

class list{
    static generate(data, group_id, i) {
        $('#list_container').append(
            $("<div>").attr({
                'id': 'individual' + data[group_id][i]["event_id"],
                'class': 'list',
            })
        );
    
        if (
            data[group_id][i]['img_count'] == 7 ||
            data[group_id][i]['img_count'] == 6 ||
            data[group_id][i]['img_count'] == 5 ||
            data[group_id][i]['img_count'] == 4
        ) {
            $("#individual" + data[group_id][i]["event_id"])
                .append(
                $("<div>")
                    .attr({ "class": "list_image" })
                    .css({
                        "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/1')",
                    })
                )
        }
        else if (data[group_id][i]['img_count'] == 3 ||
            data[group_id][i]['img_count'] == 2
        ) {
            $("#individual" + data[group_id][i]["event_id"])
                .append(
                $("<div>")
                    .attr({ "class": "list_image" })
                    .css({
                        "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/2')",
                    })
                )
        }
        else if (data[group_id][i]['img_count'] == 1) {
            $("#individual" + data[group_id][i]["event_id"])
                .append(
                $("<div>")
                    .attr({ "class": "list_image" })
                    .css({
                        "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/3')",
                    })
                )
        }
        $("#individual" + data[group_id][i]["event_id"] + ' .list_image')
            .append(
            $("<div>")
                .attr({ "class": "list_overlay" })
            );
    
        $("#individual" + data[group_id][i]["event_id"]+ ' .list_overlay')
            .append(
            $("<div>")
                .attr({ "class": "calender" })
                .html('<div style="height:50%;font-size:1rem;">'+getMonthString(data[group_id][i]["start"])+'</div>'+
                      '<div style="height:50%;font-size:1.7rem">'+getDay(data[group_id][i]["start"])+'</div>')
            );
    
        $("#individual" + data[group_id][i]["event_id"] + ' .list_overlay')
            .append(
            $("<div>")
                .attr({ "class": "list_title" })
                .text(
                data[group_id][i]["title"]
                )
            );
    
        $("#individual" + data[group_id][i]["event_id"])
            .append(
            $("<div>")
                .attr({ "class": "list_datetime" })
                .html("<i class='mdl-icon-toggle__label material-icons' style='font-size:18px;margin-left:-10px;'>schedule</i>"+dateConvertUS(data[group_id][i]["start"]) +' '+ data[group_id][i]["timezone"] + " ~" )
            );
    
        $("#individual" + data[group_id][i]["event_id"])
            .append(
            $("<div>")
                .attr({ "class": "list_status" })
                .css({ "float":"left"})
                .html(
                getStatusString(
                    data[group_id][i]["status"],
                    data[group_id][i]["timezone"],
                    new Date(data[group_id][i]["deadline"]),
                    new Date(data[group_id][i]["start"]),
                    new Date(data[group_id][i]["end"])
                    )
                )
            );
    
        $("#individual" + data[group_id][i]["event_id"])
            .append(
            $("<div>")
                .attr({ "class": "list_place" })
                .html("<i class='mdl-icon-toggle__label material-icons' style='font-size:18px;margin-left:-10px;'>place</i>"+data[group_id][i]["place_name"])
            );
    
        if (isset(CURRENT_LAT) && isset(CURRENT_LNG)){
            $("#individual" + data[group_id][i]["event_id"])
            .append(
            $("<div>")
                .attr({ "class": "list_distance" })
                .html(
                getDistance(CURRENT_LAT,CURRENT_LNG,data[group_id][i]["lat"],data[group_id][i]["lng"]) + ' mile from here'
                )
            );
        }
    
        $("#individual" + data[group_id][i]["event_id"] + ' .list_image')
            .append(
            $("<div>")
                .attr({ "class": "favorite"})
                .html(
                $("<label class='mdl-icon-toggle mdl-js-icon-toggle mdl-js-ripple-effect' for='list_favorite" + data[group_id][i]["event_id"] + "'/>").html(
                    "<input disabled type='checkbox' id='list_favorite" + data[group_id][i]["event_id"] + "' class='mdl-icon-toggle__input'>"
                    + "<i class='mdl-icon-toggle__label material-icons'>favorite</i>"
                )
                )
            )
            .append(
            $("<div>")
                .attr({ "id": "list_favorite_count" + data[group_id][i]["event_id"], "class": "favorite_count" })
                .html(data[group_id][i]["favorite"])
            )
    
            .append(
            $("<div>")
                .attr({ "class": "unfavorite"})
                .html(
                $("<label class='mdl-icon-toggle mdl-js-icon-toggle mdl-js-ripple-effect' for='list_unfavorite" + data[group_id][i]["event_id"] + "'/>").html(
                    "<input disabled type='checkbox' id='list_unfavorite" + data[group_id][i]["event_id"] + "' class='mdl-icon-toggle__input'>"
                    + "<i class='mdl-icon-toggle__label material-icons'>thumb_down</i>"
                )
                )
            )
            .append(
            $("<div>")
                .attr({ "id": "list_unfavorite_count" + data[group_id][i]["event_id"], "class": "unfavorite_count" })
                .html(data[group_id][i]["unfavorite"])
            );
        
        componentHandler.upgradeDom();
        return false;
    }
}


$(document).off("click", "#back_to_list");
$(document).on("click", "#back_to_list", function (event) {
    event.preventDefault();
    event.stopPropagation();

    $('#drawer .container').hide();
    if (isset(SEARCH_ZOOM)) {
        // if (isset(SEARCH_POSITION) && isset(SEARCH_ZOOM)) {
        // MAP_OBJ.panTo(SEARCH_POSITION);
        MAP_OBJ.setZoom(SEARCH_ZOOM);
        $('#search_container').show();
    }
    $('#list_container').show();
    return false;
});