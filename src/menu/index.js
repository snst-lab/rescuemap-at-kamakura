'use strict';

class menu {
    static open() {
        $("#menu").animate({
            'left': 0,
        }, 200);
        $("#overlay_menu").css({
            'z-index': 1,
        });
        $("#overlay_menu").animate({
            'filter': 'alpha(opacity=0.5)',
            '-moz-opacity': 0.5,
            'opacity': 0.5,
        }, 200);
        // $('#menu').trigger('open');
    }

    static close() {
        $("#menu").animate({
            'left': -$("#menu").width(),
        }, 200);
        $("#overlay_menu").css({
            'z-index': 0,
        });
        $("#overlay_menu").animate({
            'filter': 'alpha(opacity=0)',
            '-moz-opacity': 0,
            'opacity': 0,
        }, 200);
        // $('#menu').trigger('close');
    }

    static onload() {
        if (isset(localStorage.user_id) && isset(localStorage.firstname)) {
          
            if (fileExist(DATA_ROOT + "user/" + localStorage.user_id + "/profile")) {
                $("#menu_container  .userphoto")
                    .css({
                        "background-image": "url('" + DATA_ROOT + "user/" + localStorage.user_id + "/profile?"+ new Date()+"')",
                    })
                    .attr({ "data-uid": localStorage.user_id });
            }
            else {
                $("#menu_container  .userphoto")
                    .css({
                        "background-image": "url('" + HTML_ROOT+"img/nophoto.png')",
                    })
                    .attr({ "data-uid": localStorage.user_id });
            }
            if (fileExist(DATA_ROOT + "user/" + localStorage.user_id + "/cover")) {
                $("#menu_container  #menu_cover")
                .css({
                    "background-image": "url('" + DATA_ROOT + "user/" + localStorage.user_id + "/cover?"+ new Date()+"')",
                });
            }
            else{
                $("#menu_container  #menu_cover")
                        .css({
                            "background": "#aaa",
                        });
            }
    
            $("#menu_container  .name").html(
                localStorage.firstname
            )

        }
        else {
            $("#menu_container  #menu_auth").empty();
            $("#menu_container  #menu_auth")
                .append(
                $("<div class='userphoto'/>").css({
                    "background-image": "url('" + HTML_ROOT+"img/nophoto.png')",
                })
                )
                .append(
                $("<div class='name'/>").html(
                    "no user"
                )
                );
            $("#menu_container  #menu_cover")
            .css({
                "background": "#aaa",
            });
        }
    }

    static showEvent(action) {
        if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
            $('#modal .container').hide();
            $("#auth_container").show();
            modal.open();
            return false;
        }
        var formData = {
            "user_id": localStorage.user_id,
            "hash": localStorage.hash,
        }

        switch (action) {
            case 'eventAsOrganizer':
                var URL = ENDPOINT+"Organizer/PullEventAsOrganizer.php";
                var INDEX='Events you hold';
                break;
            case 'eventAsParticipant':
                var URL = ENDPOINT+"Participant/PullEventAsParticipant.php";
                var INDEX='Events you participate';
                break;
            case 'favoriteEvent':
                var URL = ENDPOINT+"Participant/FavoriteEvent.php";
                var INDEX='Favorite events';
                break;
            case 'cooperateEvent':
                var URL = ENDPOINT+"Organizer/PullEventAsCooperator.php";
                var INDEX='Events you co-organize';
                break;
            default:
                return false;
        }

        $.ajax({
            url: URL,
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
            if (!isset(data['error_message'])) {
                if (isset(data)) {
                    $('#drawer .container').hide();
                    $('#list_container').empty();
                    $('#list_container').append('<div class="index">'+INDEX+'</div>');
                    
                    for (var group_id in data) {
                        for (var i in data[group_id]) {
                            list.generate(data, group_id, i);
                            main.showIndividual(data, group_id, i)
                        }
                    }
                    main.setMarker(MAP_OBJ, data);
                    
                    $('#list_container').show();
                    drawer.open();
                    return false;
                }
                else {
                    alert('No results found.')
                }
            }
            else if (isset(data['error_message']) && isset(data['auth'])) {
                alert(data['error_message']);
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


$(document).ready(function(){
    menu.onload();
});

document.addEventListener("resume", function () {
    menu.onload();
}, false);

$(document).on('succeed', '#login', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    menu.onload();
    menu.close();
});

$(document).off('click', '#overlay_menu');
$(document).on('click', '#overlay_menu', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    menu.close();
});

$(document).off('touchstart', '#menu');
$(document).on('touchstart', '#menu', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    var position = event.originalEvent.changedTouches[0].pageX;
      $(document).off('touchend', '#menu');
      $(document).on('touchend', '#menu', function (event) {
        //event.preventDefault();
        event.stopPropagation();
      if(event.originalEvent.changedTouches[0].pageX < position-$('#menu').width()*0.4){
        menu.close();
      }
    });
});

$(document).off('click', '#menu_auth .name');
$(document).on('click', '#menu_auth .name', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    if ($("#menu_dropdown").css("height") == '0px') {
        $('#menu_dropdown').animate({
            'height': '7rem',
            '-moz-opacity': 1,
            'opacity': 1,
        }, 200);
        $(document).on('click', ':not(#menu_dropdown)', function (event) {
            //event.preventDefault();
            event.stopPropagation();
            $('#menu_dropdown').animate({
                'height': '0px',
                '-moz-opacity': 0,
                'opacity': 0,
            }, 200);
            $(document).off('click', ':not(#menu_dropdown)');
        });
    }
});


$(document).off('click', '#menu_login');
$(document).on('click', '#menu_login', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    $('#modal .container').hide();
    $("#auth_container").show();
    modal.open();
});

$(document).off('click', '#menu_logout'); 
$(document).on('click', '#menu_logout', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    if (!confirm('Do you logout?')) {
        return false;
    } else {
        localStorage.clear();
        main.boundsChanged(); 
        menu.onload();
        $('#notice_count').css({ 'background-color': 'transparent' });
        $('#notice_count').hide();
        menu.close();
        $('#modal .container').hide();
        $("#auth_container").show();
        modal.open();
    }
});
$(document).off('click', '#menu_user');
$(document).on('click', '#menu_user', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
        $('#modal .container').hide();
        $("#auth_container").show();
        modal.open();
        return false;
    }
    $('#drawer .container').hide();
    $('#user_container').show();
    drawer.open();
});

$(document).off('click', '#menu_profile');
$(document).on('click', '#menu_profile', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
        $('#modal .container').hide();
        $("#auth_container").show();
        modal.open();
        return false;
    }

    $('#drawer .container').hide();
    $('#profile_container').show();

    profile.edit();
    drawer.open();
});

$(document).off('click', '#notice_count');
$(document).on('click', '#notice_count', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
        $('#modal .container').hide();
        $("#auth_container").show();
        modal.open();
        return false;
    }
    $('#drawer .container').hide();
    $('#user_timeline_container').show();
    userTimeline.show();
    drawer.open();
});

$(document).off('click', '#menu_user_timeline');
$(document).on('click', '#menu_user_timeline', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
        $('#modal .container').hide();
        $("#auth_container").show();
        modal.open();
        return false;
    }
    $('#drawer .container').hide();
    $('#user_timeline_container').show();
    userTimeline.show();
    drawer.open();
});

$(document).off('click', '#menu_event_as_organizer'); $(document).on('click', '#menu_event_as_organizer', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    menu.showEvent('eventAsOrganizer');
});

$(document).off('click', '#menu_event_as_participant'); $(document).on('click', '#menu_event_as_participant', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    menu.showEvent('eventAsParticipant');
});

$(document).off('click', '#menu_event_favorite'); $(document).on('click', '#menu_event_favorite', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    menu.showEvent('favoriteEvent');
});

$(document).off('click', '#menu_event_favorite'); $(document).on('click', '#menu_event_favorite', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    menu.showEvent('favoriteEvent');
});

$(document).off('click', '#menu_event_cooperate'); $(document).on('click', '#menu_event_cooperate', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    menu.showEvent('cooperateEvent');
});

$(document).off('click', '#menu_setting'); $(document).on('click', '#menu_setting', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
        $('#modal .container').hide();
        $("#auth_container").show();
        modal.open();
        return false;
    }
    $('#drawer .container').hide();
    $('#setting_container').show();
    drawer.open();
});

$(document).off('click', '#menu_payment'); $(document).on('click', '#menu_payment', function (event) {
    //event.preventDefault();
    event.stopPropagation();
    if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
        $('#modal .container').hide();
        $("#auth_container").show();
        modal.open();
        return false;
    }
    $('#modal .container').hide();
    $("#payment_container").show();
    modal.open();
});
