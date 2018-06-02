'use strict';
var CANDIDATE_PAGE=1;

class detail {
    static show(data, group_id, i) {
        $("#detail_container  #detail_organizer").empty();

        if (fileExist(DATA_ROOT + "user/" + data[group_id][i]['organizer_id'] + "/profile")) {
            $("#detail_container #detail_organizer")
                .append(
                $("<div class='userphoto'/>")
                    .css({
                        "background-image": "url('" + DATA_ROOT + "user/" + data[group_id][i]['organizer_id'] + "/profile?"+ new Date()+"')",
                    })
                    .attr({ "data-uid": data[group_id][i]['organizer_id']})
                )
        }
        else {
            $("#detail_container #detail_organizer")
                .append(
                $("<div class='userphoto'/>")
                    .css({
                        "background-image": "url('" + HTML_ROOT+"img/nophoto.png')",
                    })
                    .attr({ "data-uid": data[group_id][i]['organizer_id']})
                )
        }

        $("#detail_container  #detail_organizer")
            .append(
            $("<div class='name'/>").html(
                data[group_id][i]['firstname'] + " " + data[group_id][i]['lastname']
            )
            )
        $("#detail_container  #detail_title").html(data[group_id][i]["title"]);
        $("#detail_container  #detail_description").html(data[group_id][i]["description"]);
        $("#detail_container  #detail_cost").html(data[group_id][i]["cost"] + " USD");
        $("#detail_container  #detail_place").html(data[group_id][i]["place_name"]);
        if (isset(data[group_id][i]["address"])) {
            $("#detail_container  #detail_address").html(data[group_id][i]["address"]);
        }
        else {
            $("#detail_container  #detail_address").html(" - ");
        }
        if (isset(data[group_id][i]["max_participant"])) {
            $("#detail_container  #detail_max_participant").html(data[group_id][i]["max_participant"] + " Persons");
        }
        else {
            $("#detail_container  #detail_max_participant").html(" - ");
        }
        
        $("#detail_container  #detail_start").html(dateConvertUS(data[group_id][i]["start"]) + ' ' + data[group_id][i]["timezone"] + ' ' + getWeek(data[group_id][i]["start"]));
        $("#detail_container  #detail_deadline").html(dateConvertUS(data[group_id][i]["deadline"]) + ' ' + data[group_id][i]["timezone"] + ' ' + getWeek(data[group_id][i]["deadline"]));
        $("#detail_container  #detail_end").html(dateConvertUS(data[group_id][i]["end"]) + ' ' + data[group_id][i]["timezone"] + ' ' + getWeek(data[group_id][i]["end"]));
        $("#detail_container  #detail_target_age").html('At the age of ' + data[group_id][i]["age_lower"] + ' to ' +data[group_id][i]["age_higher"]);
        $("#detail_container  #detail_target_gender").html(data[group_id][i]["target_gender"]);
        $("#detail_container  #detail_status").html(
            getStatusString(
                data[group_id][i]["status"],
                data[group_id][i]["timezone"],
                new Date(data[group_id][i]["deadline"]),
                new Date(data[group_id][i]["start"]),
                new Date(data[group_id][i]["end"])
                )
        );
        $("#detail_container #detail_voucher").empty();
        if (isset(data[group_id][i]['voucher'])) {
            QR_OPTION['text'] = data[group_id][i]["voucher"];
            $("#detail_container #detail_voucher").qrcode(QR_OPTION);
            $("#detail_container #detail_voucher").append('<br>Show this QR Code to the organizers.');
            $("#detail_container #voucher").show();
        }
        else {
            $("#detail_container #voucher").hide();
        }

        $('#detail_check_result').empty();
        $('#check_result').css({'height':'0px','display':'none'});
        
        if (isset(data[group_id][i]['is_self']) && typeof(cordova) != "undefined") {
            $("#detail_container #check_voucher").show();
            detail.scanQRCode(data[group_id][i]["event_id"]);
        }
        else {
            $("#detail_container #check_voucher").hide();
        }
        detail.showParticipant(data, group_id, i);
        detail.showCooperator(data, group_id, i);

        $(document).off('click', '#showDetail' + data[group_id][i]["event_id"]);
        $(document).on('click', '#showDetail' + data[group_id][i]["event_id"], function (event) {
            event.preventDefault();
            event.stopPropagation();

            $('#showDetail' + data[group_id][i]["event_id"]).attr({ "id": "showTimeline" + data[group_id][i]["event_id"] }).text("Show Timeline");
            $('#timeline_container').hide('slow');
            $('#detail_container').show('slow');
        });
    }

    static showCooperator(data,group_id,i){
        $('#detail_cooperator_container').hide();
        $('#detail_attr_container').show();
        $("#detail_cooperator").empty();
        $('#detail_select_cooperator').empty();

        if(isset(localStorage.user_id) && localStorage.user_id==data[group_id][i]['organizer_id']){
            $('#detail_cooperator_container').show();
            $("#detail_add_cooperator").show();
            $('#detail_add_cooperator button').attr({'id':'addCooperator'}).text('Add co-organizer from followee');
            detail.addCooperator(data[group_id][i]['event_id'],data[group_id][i]['organizer_id']);
        }
        var formData =
        {
            'event_id': data[group_id][i]['event_id'],
        };
        $.ajax({
            url: ENDPOINT+"Detail/ShowCooperator.php",
            type: "POST",
            data: formData,
            dataType: "json",
            context:{
                event_id : data[group_id][i]['event_id'],
            },
            beforeSend: function (xhr, setting) {
                $('#drawer_loading').show();
            },
            complete: function (xhr, textStatus) {
                $('#drawer_loading').hide();
            },
        })
        .done(function (data, textStatus, jqXHR) {
            // console.log(JSON.stringify(data, null, '\t'));

            if (!isset(data['error_message'])) {
                if (Object.keys(data).length > 1) {
                    for (var i = 0; i < Object.keys(data).length - 1; i++) {
                        $("#detail_cooperator").append(
                            $("<div>").attr({ "id": "cooperator" + data[i]['user_id'], "class": "cooperatorlist"})
                        );
                        if (fileExist(DATA_ROOT + "user/" + data[i]['user_id'] + "/profile")) {
                            $("#cooperator" + data[i]['user_id'])
                                .append(
                                $("<div class='userphoto'/>")
                                    .css({
                                        "background-image": "url('" + DATA_ROOT + "user/" + data[i]['user_id'] + "/profile?"+ new Date()+"')",
                                    })
                                    .attr({ "data-uid": data[i]['user_id'] })
                                )
                        }
                        else {
                            $("#cooperator" + data[i]['user_id'])
                                .append(
                                $("<div class='userphoto'/>")
                                    .css({
                                        "background-image": "url('" + HTML_ROOT+"img/nophoto.png')",
                                    })
                                    .attr({ "data-uid": data[i]['user_id'] })
                                )
                        }
                        $("#cooperator" + data[i]['user_id'])
                            .append(
                            $("<div class='name'/>").html(
                                data[i]['firstname'] + " " + data[i]['lastname']
                            )
                            );

                        $('#detail_check_result').empty();
                        $('#check_result').css({'height':'0px','display':'none'});
                      
                        if (data[i]['user_id']== localStorage.user_id && typeof(cordova) != "undefined")  {
                            $("#detail_container #check_voucher").show();
                            detail.scanQRCode(this.event_id);
                        }
                        else {
                            $("#detail_container #check_voucher").hide();
                        }
                    }
                    $('#detail_cooperator_container').show();
                    $('#detail_cooperator').show();
                   
                    return false;
                }
            }
            else {
                alert(data['error_message']);
                return false;
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            return false;
        });
    }

    static addCooperator(event_id,organizer_id) {
        $(document).off('click', '#addCooperator');
        $(document).on('click', '#addCooperator', function (event) {
            event.preventDefault();
            event.stopPropagation();

            $('#detail_cooperator').hide();
            $('#detail_attr_container').hide('slow');
            $('#detail_add_cooperator button').attr({'id':'cancelAddCooperator'}).text('Cancel add co-organizer');
            
            CANDIDATE_PAGE=1;
            detail.pullCandidate(event_id,organizer_id);
            $(document).off('touchstart', '#detail_cooperator_container');
            $(document).on('touchstart', '#detail_cooperator_container',function(event) {
                var position = event.originalEvent.changedTouches[0].pageY;
                $(document).off('touchend', '#detail_cooperator_container');
                $(document).on('touchend', '#detail_cooperator_container',function(event) {
                    if (event.originalEvent.changedTouches[0].pageY < position -  window.screen.height * 0.2) {
                        CANDIDATE_PAGE+=1;
                        detail.pullCandidate(event_id,organizer_id);
                    }
                });
            });
        });

        $(document).off('click', '#cancelAddCooperator');
        $(document).on('click', '#cancelAddCooperator', function (event) {
            event.preventDefault();
            event.stopPropagation();
            $('#detail_attr_container').show('slow');
            $('#detail_cooperator').show();
            $('#detail_select_cooperator').empty();
            $('#detail_add_cooperator button').attr({'id':'addCooperator'}).text('Add co-organizer from followee');
            $(document).off('touchstart', '#detail_cooperator_container');
            $(document).off('touchend', '#detail_cooperator_container');
        });


    }

    static pullCandidate(event_id,organizer_id){
        var formData =
        {
            'event_id': event_id,
            'user_id': organizer_id,
            'page': CANDIDATE_PAGE,
        };
        $.ajax({
            url: ENDPOINT+"Detail/PullCandidate.php",
            type: "POST",
            data: formData,
            dataType: "json",
            beforeSend: function (xhr, setting) {
                $('#drawer_loading').show();
            },
            complete: function (xhr, textStatus) {
                $('#drawer_loading').hide();
            },
        })
        .done(function (data, textStatus, jqXHR) {
            if (!isset(data['error_message'])) {
                if (Object.keys(data).length > 1) {
                    $('#detail_select_cooperator').show();

                    for (var i = 0; i < Object.keys(data).length-1; i++) {
                        $("#detail_select_cooperator").append(
                            $("<div>").attr({ "id": "candidate" + data[i]['user_id'], "class": "cooperatorlist" })
                        );
                        if (fileExist(DATA_ROOT + "user/" + data[i]['user_id'] + "/profile")) {
                            $("#candidate" + data[i]['user_id'])
                                .append(
                                $("<div class='userphoto'/>")
                                .css({
                                    "background-image": "url('" + DATA_ROOT + "user/" + data[i]['user_id'] + "/profile?"+ new Date()+"')",
                                })
                                .attr({"data-uid": data[i]['user_id']})
                                )
                        }
                        else {
                            $("#candidate" + data[i]['user_id'])
                                .append(
                                $("<div class='userphoto'/>").css({
                                    "background-image": "url('" + HTML_ROOT+"img/nophoto.png')",
                                })
                                .attr({"data-uid": data[i]['user_id']})
                                )
                        }
                        $("#candidate" + data[i]['user_id'])
                            .append(
                            $("<div class='name'/>").html(
                                data[i]['firstname'] + " " + data[i]['lastname']
                            )
                        );
                        $("#candidate" + data[i]['user_id'])
                            .append(
                                $("<button>").attr({'class':'btn3','data-cid': data[i]['user_id']})
                            .text('Request')
                        );
         
                    }
                    return false;
                }

            }
            else if(isset(data['error_message']) && data['error_message']=='no_following') {
                alert('No candidate found.');
                return false;
            }
            else{
                alert(data['error_message']);
                return false;
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            return false;
        });
        
        $(document).off('click', '[data-cid]');
        $(document).on('click', '[data-cid]', function (event) {
            event.preventDefault();
            event.stopPropagation();
            detail.requestCooperate(event_id,$(this).data('cid'));
        });
    }

    static requestCooperate(event_id,cid){
        if (!confirm('Do you request the followee to co-organize?')) {
            return false;
        } else {
            var formData =
            {
                'event_id': event_id,
                'cooperator_id': cid,
            };
        $.ajax({
            url: ENDPOINT+"Detail/RequestCooperate.php",
            type: "POST",
            data: formData,
            dataType: "json",
            beforeSend: function (xhr, setting) {
                $('#drawer_loading').show();
            },
            complete: function (xhr, textStatus) {
                $('#drawer_loading').hide();
            },
        })
        .done(function (data, textStatus, jqXHR) {
            if (!isset(data['error_message'])) {
                // console.log(JSON.stringify(data, null, '\t'));
                alert('The Request was sent to the followee.');
                return false;
            }
            else {
                alert(data['error_message']);
                return false;
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            alert('The Request was sent to the followee.');
            return false;
        });
        }
    }

    static acceptCooperate(event_id){
        if (!confirm('Do you accept to co-organize this gathering?')) {
            return false;
        } else {
            var formData =
            {
                'event_id': event_id,
                'cooperator_id': localStorage.user_id,
                'hash': localStorage.hash,
                'cooperator_hash': QUERY['hash'],
            };
        $.ajax({
            url: ENDPOINT+"Detail/AcceptCooperate.php",
            type: "POST",
            data: formData,
            dataType: "json",
            beforeSend: function (xhr, setting) {
                $('#drawer_loading').show();
            },
            complete: function (xhr, textStatus) {
                $('#drawer_loading').hide();
            },
        })
        .done(function (data, textStatus, jqXHR) {
            if (!isset(data['error_message'])) {
                // console.log(JSON.stringify(data, null, '\t'));
                alert('You joined the ranks of co-organizers.');
                $('#detail_add_cooperator').hide();
                if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
                    location.href = URL_SCHEME;
                }
                else{
                    location.href = APP_ROOT;
                }
                return false;
            }
            if (isset(data['error_message']) && isset(data['auth'])) {
                $('#modal .container').hide();
                $("#auth_container").show();
                modal.open();
                return false;
            }
            else {
                alert(data['error_message']);
                return false;
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            return false;
        });
        }
    }

    static showParticipant(data, group_id, i) {
        $('#headline_participant').css({ 'font-weight': '100', 'color': '#ffffff' });
        
        $(document).off('click', '#headline_container #headline_participant');
        $(document).on('click', '#headline_container #headline_participant', function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (data[group_id][i]["participant"] == 0) {
                return false;
            }
            if ($('.participantlist').css('height') == '70px') {
                $('#headline_participant').css({ 'font-weight': '100', 'color': '#ffffff' });
                $("#participant_container").empty();
                // $('.participantlist').animate({ 'height': '0px', 'border': '0px' }, 300);
                // setTimeout(function () { $("#participant_container").empty(); }, 300);
                // $('#participant_container').hide("slow");
                if ($('.rightButton').text() == 'Show Timeline') {
                    $('#detail_container').show();
                }
                else if ($('.rightButton').text() == 'Show Detail') {
                    $('#timeline_container').show();
                }
                return false;
            }
            if ($('.rightButton').text() == 'Show Timeline') {
                $('#detail_container').hide();
            }
            else if ($('.rightButton').text() == 'Show Detail') {
                $('#timeline_container').hide();
            }
            $("#participant_container").empty();
            PARTICIPANT_PAGE = 1;
            detail.pullParticipant(data[group_id][i]["event_id"]);
        });

        $(document).off('touchstart', '#participant_container');
        $(document).on('touchstart', '#participant_container', function () {
            if (data[group_id][i]["participant"] == 0) {
                return false;
            }
            var position = $('#participant_container').scrollTop();
            $(document).off('touchend', '#participant_container');
            $(document).on('touchend', '#participant_container', function () {
                var scrollHeight = $('#participant_container').height();
                var scrollPosition = $('#participant_container').height() + $('#participant_container').scrollTop();
                if (scrollHeight - scrollPosition < 20 & position <= $('#participant_container').scrollTop()) {
                    PARTICIPANT_PAGE += 1;
                    detail.pullParticipant(data[group_id][i]["event_id"]);
                }
            });
        });
    }

    static pullParticipant(event_id) {
        var formData =
            {
                'event_id': event_id,
                'page': PARTICIPANT_PAGE,
            };
        $.ajax({
            url: ENDPOINT+"Detail/PullParticipant.php",
            type: "POST",
            data: formData,
            dataType: "json",
            beforeSend: function (xhr, setting) {
                $('#drawer_loading').show();
            },
            complete: function (xhr, textStatus) {
                $('#drawer_loading').hide();
            },
        })
            .done(function (data, textStatus, jqXHR) {
                // console.log(JSON.stringify(data, null, '\t'));

                if (!isset(data['error_message'])) {
                    if (Object.keys(data).length > 1) {
                        $('#participant_container').show();

                        for (var i = 0; i < Object.keys(data).length - 1; i++) {
                            $("#participant_container").append(
                                $("<div>").attr({ "id": "participant" + data[i]['user_id'], "class": "participantlist" })
                            );

                            if (fileExist(DATA_ROOT + "user/" + data[i]['user_id'] + "/profile")) {
                                $("#participant" + data[i]['user_id'])
                                    .append(
                                    $("<div class='userphoto'/>")
                                        .css({
                                            "background-image": "url('" + DATA_ROOT + "user/" + data[i]['user_id'] + "/profile?"+ new Date()+"')",
                                        })
                                        .attr({ "data-uid": data[i]['user_id'] })
                                    )
                            }
                            else {
                                $("#participant" + data[i]['user_id'])
                                    .append(
                                    $("<div class='userphoto'/>")
                                        .css({
                                            "background-image": "url('" + HTML_ROOT+"img/nophoto.png')",
                                        })
                                        .attr({ "data-uid": data[i]['user_id'] })
                                    )
                            }
                            $("#participant" + data[i]['user_id'])
                                .append(
                                $("<div class='name'/>").html(
                                    data[i]['firstname'] + " " + data[i]['lastname']
                                )
                                );
                            if (data[i]['status']=='checked_in') {
                                $("#participant" + data[i]['user_id'])
                                    .append("<img src='img/checked_in.png' style='margin:5px;margin-right:40px;width:30px;height:30px;float:right;'>")
                                    .append("<div style='margin-right:20px;height:10px;float:right;color:#555'>Checked in</div>");
                            }
                            else if (data[i]['status']=='re_entry') {
                                $("#participant" + data[i]['user_id'])
                                    .append("<img src='img/re_entry.png' style='margin:5px;margin-right:40px;width:30px;height:30px;float:right;'>")
                                    .append("<div style='margin-right:20px;height:10px;float:right;color:#555'>Re-entry</div>");
                            }
                        }
                        $('#headline_participant').css({ 'font-weight': '300', 'color': '#ff00ea' });
                        $('.participantlist').animate({ 'height': '70px', 'border': '1px solid #ddd' }, 300);
                        return false;
                    }
                }
                else if (isset(data['error_message']) && data['error_message'] == 'no_participant') {
                    return false;
                }
                else {
                    alert(data['error_message']);
                    return false;
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                return false;
            });
    }

    static scanQRCode(event_id){
        $(document).off('click', '#detail_container #checkVoucher');
        $(document).on('click', '#detail_container #checkVoucher', function () {
            cordova.plugins.barcodeScanner.scan(
                function (result) {                       
                    var formData = {
                        'user_id': localStorage.user_id,
                        'hash': localStorage.hash,
                        'event_id': event_id,
                        'voucher': result.text,
                    }
                    $.ajax({
                        url: ENDPOINT+"Organizer/CheckVoucher.php",
                        type: "POST",
                        data: formData,
                        dataType: "json",
                        beforeSend: function (xhr, setting) {
                            $('#drawer_loading').show();
                        },
                        complete: function (xhr, textStatus) {
                            $('#drawer_loading').hide();
                        },
                    })
                    .done(function (data, textStatus, jqXHR) {
                        if(!isset(data['error_message'])){
                            $("#detail_container  #detail_check_result").empty();
                            if(isset(data['participant_id'])){
                                if (fileExist(DATA_ROOT + "user/" + data['participant_id'] + "/profile")) {
                                    $("#detail_container #detail_check_result")
                                        .append(
                                        $("<div class='userphoto'/>")
                                            .css({
                                                "background-image": "url('" + DATA_ROOT + "user/" + data['participant_id'] + "/profile?"+ new Date()+"')",
                                            })
                                            .attr({ "data-uid": data['participant_id']})
                                        )
                                }
                                else {
                                    $("#detail_container #detail_check_result")
                                        .append(
                                        $("<div class='userphoto'/>")
                                            .css({
                                                "background-image": "url('" + HTML_ROOT+"img/nophoto.png')",
                                            })
                                            .attr({ "data-uid": data['participant_id']})
                                        )
                                }
                        
                                $("#detail_container  #detail_check_result")
                                    .append(
                                    $("<div class='name'/>").html(
                                        data['firstname'] + " " + data['lastname']
                                    )
                                    )
                            }
                            if (data['status']=='checked_in') {
                                ok_sound.play();
                                $('#detail_check_result')
                                    .append("<img src='img/checked_in.png' style='margin:5px;margin-right:40px;width:30px;height:30px;float:right;'>")
                                    .append("<div style='margin-right:20px;height:10px;float:right;color:#555'>Checked In</div>");
                            }
                            else if (data['status']=='re_entry') {
                                reentry_sound.play();
                                $('#detail_check_result')
                                    .append("<img src='img/re_entry.png' style='margin:5px;margin-right:40px;width:30px;height:30px;float:right;'>")
                                    .append("<div style='margin-right:20px;height:10px;float:right;color:#555'>Re-entry</div>");
                            }
                            else if (data['status']=='no_reserve') {
                                $('#detail_check_result')
                                    .append("<img src='img/no_reserve.png' style='margin:5px;margin-right:40px;width:30px;height:30px;float:right;'>")
                                    .append("<div style='margin-right:20px;height:10px;float:right;color:#555'>No reservation</div>");
                            }
                            $('#detail_check_result').show("slow");
                            $('#check_result').show("slow");
                            $('#check_result').animate({'height':'80px'},300);
                            return false;
                        }
                        else {
                            alert(data['error_message']);
                            return false;
                        }
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                        return false;
                    });
                }, 
                function (error) {
                    alert("Scanning failed: " + error);
                }
            );
        });
    }
}

$(document).off('click', '#acceptCooperate');
$(document).on('click', '#acceptCooperate', function (event) {
    event.preventDefault();
    event.stopPropagation();
    detail.acceptCooperate(QUERY['event_id']);
});
