'use strict';

var VALID_DAYS = 90;
var USERTIMELINE_PAGE = 1;

class userTimeline {
    static show() {
        if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
            return false;
        }
        USERTIMELINE_PAGE = 1;
        $("#user_timeline").empty();
        userTimeline.pull();

        $(document).off('touchstart', '#user_timeline_container');
        $(document).on('touchstart', '#user_timeline_container', function () {
            var position = $('#drawer').scrollTop();
            $(document).off('touchend', '#user_timeline_container');
            $(document).on('touchend', '#user_timeline_container', function () {
                var scrollHeight = $('#user_timeline_container').height();
                var scrollTop = $('#drawer').scrollTop();
                var scrollPosition = $('#drawer').height() + scrollTop;
                if (scrollHeight - scrollPosition <  0.2*scrollHeight && position <= scrollTop) {
                    USERTIMELINE_PAGE += 1;
                    userTimeline.pull();
                }
                // var scrollPosition = $('#drawer').scrollTop();
                // if (scrollPosition < 20 & position >= scrollPosition) {
                //     $("#user_timeline").empty();
                //     $('#notice_count').empty();
                //     USERTIMELINE_PAGE = 1;
                //     userTimeline.pull(data, group_id, i);
                // }
            });
        });
    }

    static pull() {
        var formData = {
            "user_id": localStorage.user_id,
            "hash": localStorage.hash,
            "page": USERTIMELINE_PAGE,
        }
        $.ajax({
            url: ENDPOINT+"UserTimeline/ShowUserTimeline.php",
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
        .done(function (timeline, textStatus, jqXHR) {
            // console.log(JSON.stringify(timeline, null, '\t'));
            if (!isset(timeline['error_message'])) {
                if (isset(timeline)) {
                    // timeline.sort(function (a, b) {
                    //     if (a.datetime > b.datetime) return 1;
                    //     if (a.datetime < b.datetime) return -1;
                    //     return 0;
                    // });
                    for (var i = 0; i < timeline.length; i++) {
                        $("#user_timeline").append(
                            $("<div>").attr({ "id": "user_timeline" + timeline[i]['timeline_id'], "class": "timeline" })
                        );

                        if (fileExist(DATA_ROOT + "user/" + timeline[i]['user_id'] + "/profile")) {
                            $("#user_timeline" + timeline[i]['timeline_id'])
                                .append(
                                $("<div class='userphoto'/>")
                                    .css({
                                        "background-image": "url('" + DATA_ROOT + "user/" + timeline[i]['user_id'] + "/profile?"+ new Date()+"')",
                                    })
                                    .attr({ "data-uid": timeline[i]['user_id'] })
                                )
                        }
                        else {
                            $("#user_timeline" + timeline[i]['timeline_id'])
                                .append(
                                $("<div class='userphoto'/>").css({
                                    "background-image": "url('" + HTML_ROOT+"img/nophoto.png')",
                                    })
                                    .attr({ "data-uid": timeline[i]['user_id'] })
                                )
                        }

                        $("#user_timeline" + timeline[i]['timeline_id'])
                            .append(
                            $("<div class='name'/>").html(
                                timeline[i]['firstname'] + " " + timeline[i]['lastname']
                            )
                            )
                            .append(
                            $("<div class='datetime'/>").html(
                                dateConvertUS(timeline[i]['datetime'])+' '+timeline[i]['timezone']
                            )
                            );

                        if (timeline[i]['image']==1) {
                            $("#user_timeline" + timeline[i]['timeline_id'])
                                .append(
                                $("<div class='timelineimage'/>").css({
                                    "background-image": "url('" + DATA_ROOT + "timeline/" + timeline[i]['timeline_id'] + "/image/1')",
                                })
                                );
                        }

                        $("#user_timeline" + timeline[i]['timeline_id'])
                            .append(
                            $("<div class='content'/>").html(
                                timeline[i]['content']
                            )
                            )
                            .append(
                            $("<div class='likes_container'>").append(
                                $("<div class='likes'>")
                                    .append(
                                    $("<label class='mdl-icon-toggle mdl-js-icon-toggle mdl-js-ripple-effect' for='user_timeline_likes" + timeline[i]['timeline_id'] + "'/>").html(
                                        "<input type='checkbox' id='user_timeline_likes" + timeline[i]['timeline_id'] + "' class='likes_toggle mdl-icon-toggle__input' disabled><i class='mdl-icon-toggle__label material-icons'>thumb_up</i>"
                                    )
                                    )
                                    .append(
                                    $("<div id='user_timeline_likes_count" + timeline[i]['timeline_id'] + "' class='likes_count'/>").html(
                                        timeline[i]['likes']
                                    )
                                    )
                            )
                            .append(
                            $("<div class='dislikes'>")
                                .append(
                                $("<label class='mdl-icon-toggle mdl-js-icon-toggle mdl-js-ripple-effect' for='user_timeline_dislikes" + timeline[i]['timeline_id'] + "'/>").html(
                                    "<input type='checkbox' id='user_timeline_dislikes" + timeline[i]['timeline_id'] + "' class='dislikes_toggle mdl-icon-toggle__input' disabled><i class='mdl-icon-toggle__label material-icons'>thumb_down</i>"
                                )
                                )
                                .append(
                                $("<div id='user_timeline_dislikes_count" + timeline[i]['timeline_id'] + "' class='dislikes_count'/>").html(
                                    timeline[i]['dislikes']
                                )
                                )
                            )
                        )
                        userTimeline.jump(timeline, i);
                    }
                    userTimeline.updateNotice(timeline);
                    userTimeline.updateUnread(timeline);
                    componentHandler.upgradeDom();
                }

                return false;
            }
            else if (isset(timeline['error_message']) && timeline['error_message'] == 'no_posts') {
                return false;
            }
            else {
                alert(timeline['error_message']);
                return false;
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            return false;
        });
    }

    static pullNotice() {
        if(isset(localStorage.user_id) && isset(localStorage.hash)){
            
            var formData = {
                "user_id": localStorage.user_id,
                "hash": localStorage.hash,
            }
            $.ajax({
                url: ENDPOINT+"UserTimeline/PullNotice.php",
                type: "POST",
                data: formData,
                dataType: "json",
            })
            .done(function (timeline, textStatus, jqXHR) {
                // console.log(JSON.stringify(timeline, null, '\t'));
                if (!isset(timeline['error_message']) && isset(timeline)) {
                    userTimeline.updateNotice(timeline);
                    return false;
                }
                else if (isset(timeline['error_message']) && timeline['error_message'] == 'no_posts') {
                    return false;
                }
                else {
                    console.log(timeline['error_message']);
                    return false;
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                return 0;
            });
        }else{
            $('#notice_count').css({ 'background-color': 'transparent' });
            $('#notice_count').hide();
        }
    }

    static updateNotice(timeline) {
        if (isset(localStorage.already_read)) {
            var already_read = JSON.parse(localStorage.getItem("already_read"));
        } else {
            var already_read = [];
        }

        var notice_count = 0;
        for (var i = 0; i < timeline.length; i++) {
            var idx = already_read.indexOf(parseInt(timeline[i]));
            if (idx == -1) {
                notice_count +=1;
            }
        }
        if ( notice_count > 0) {
            $('#notice_count').show();
            $('#notice_count').css({ 'background-color': '#ff00ea' });
            $('#notice_count').text(notice_count);
            return false;
        }
        else{
            $('#notice_count').css({ 'background-color': 'transparent' });
            $('#notice_count').hide();
            return false;
        }
    }


    static updateUnread(timeline){
        if (isset(localStorage.already_read)) {
            var already_read = JSON.parse(localStorage.getItem("already_read"));
        } else {
            var already_read = [];
        }

        for (var i = 0; i < timeline.length; i++) {
            var idx = already_read.indexOf(parseInt(timeline[i]['timeline_id']));

            if (idx == -1) {
                $("#user_timeline" + timeline[i]['timeline_id']).css({ 'background': '#ffcffd' });
                $("#user_timeline" + timeline[i]['timeline_id'] + ' .content').css({ 'font-weight': '400' });
                $("#user_timeline" + timeline[i]['timeline_id'] + ' .datetime').css({ 'font-weight': '400' });
                $("#user_timeline" + timeline[i]['timeline_id'] + ' .name').css({ 'font-weight': '500' });
            }
        }
    }

    static jump(timeline, i) {
        $(document).off('click', "#user_timeline" + timeline[i]['timeline_id']);
        $(document).on('click', "#user_timeline" + timeline[i]['timeline_id'], function () {
            if (isset(localStorage.already_read)) {
                var already_read = JSON.parse(localStorage.getItem("already_read"));
            }
            else {
                var already_read = [];
            }
            var idx = already_read.indexOf(parseInt(timeline[i]['timeline_id']));
            if (idx == -1) {
                already_read.push(parseInt(timeline[i]['timeline_id']));
                localStorage.setItem('already_read', JSON.stringify(already_read));
                $("#user_timeline" + timeline[i]['timeline_id']).css({ 'background': 'none' });
                $("#user_timeline" + timeline[i]['timeline_id'] + ' .content').css({ 'font-weight': '100' });
                $("#user_timeline" + timeline[i]['timeline_id'] + ' .datetime').css({ 'font-weight': '100' });
                $("#user_timeline" + timeline[i]['timeline_id'] + ' .name').css({ 'font-weight': '200' });
               
                $('#notice_count').html(parseInt($('#notice_count').text()) - 1);

                if (parseInt($('#notice_count').text()) > 0) {
                    $('#notice_count').css({ 'background-color': '#ff00ea' });
                    $('#notice_count').show();
                }
                else {
                    $('#notice_count').css({ 'background-color': 'transparent' });
                    $('#notice_count').hide();
                }
            }

            var formData = {
                "user_id": localStorage.user_id,
                "hash": localStorage.hash,
                "event_id": timeline[i]['event_id']
            }
            $.ajax({
                url: ENDPOINT+"UserTimeline/JumpToTimeline.php",
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
                    var array = [[0]];
                    array[0][0] = data;
                    headline.show(array, 0, 0);
                    detail.show(array, 0, 0);
                    $('#timeline').empty();
                    showTimeline(array, 0, 0);
                    pullTimeline(array, 0, 0);
                    $('#drawer .container').hide();
                    $('#individual_container').show();
                    $('#headline_container').show();
                    $('#headline_container .back').hide();
                    $('#back_to_user_timeline').show();
                    
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
        });
    }
}

$(document).ready(function () {
    userTimeline.pullNotice();
});

$(document).on('succeed', '#login', function (event) {
    // event.preventDefault();
    event.stopPropagation();
    userTimeline.pullNotice();
});

$(document).off("click", "#back_to_user_timeline"); 
$(document).on("click", "#back_to_user_timeline", function (event) {
    event.preventDefault();
    event.stopPropagation();
    $('#drawer .container').hide();
    $('#user_timeline_container').show();
    TIMELINE_PAGE = 1;
    $("#timeline").empty();
    return false;
});