'use strict';
var SHOW_PROFILE;
var FOLLOWER_PAGE=1;
var FOLLOWING_PAGE=1;

class profile {
    static edit() {
        $('#follower_count').css({'color':'#ffffff'});
        $('.followerlist').css({'height':'0px','border':'0px'});
        $('.followinglist').css({'height':'0px','border':'0px'});
        $("#profile_followerlist").empty();

        if (isset(localStorage.firstname) && isset(localStorage.lastname) && !isset(QUERY['user_id'])) {
            $('#profile_container #profile_name').text(localStorage.firstname + ' ' +localStorage.lastname);
            $('#profile_container .profile_introduction').show();
            $('#profile_container #profile_introduction').text(localStorage.introduction);
            $('#profile_container #profile_introduction').attr({"contenteditable": "true"});                   
            $('#profile_container #profile_introduction').css({'box-shadow':'0 1px 2px rgba(0, 0, 0, 0.12) inset'});
            $('#profile_container .profile_introduction button').show();
            $("#profile_container #profile_follow").hide();
            $('.profile_eventlist').hide();
      
            if (fileExist(DATA_ROOT + "user/" + localStorage.user_id + "/cover")) {
                $("#profile_container #profile_cover_preview").html(
                    $("<div>").attr({ "id": "coverimage", "class": "selectimage" })
                        .css({ "background-image": "url('" + DATA_ROOT + "user/" + localStorage.user_id + "/cover?"+ new Date()+"')" })
                );
            }
            else {
                $("#profile_container #profile_cover_preview").html(
                    $("<div>").attr({ "id": "coverimage", "class": "selectimage" })
                        .css({ "background":"#aaa" })
                );
            }
            if (fileExist(DATA_ROOT + "user/" +localStorage.user_id+ "/profile")) {
                $("#profile_container #profile_img_preview").html(
                    $("<div>").attr({ "id": "profileimage","class": "profileimage" })
                        .css({ "background-image": "url('" + DATA_ROOT + "user/" + localStorage.user_id+ "/profile?"+ new Date()+"')" })
                );
            }else{
                $("#profile_container #profile_img_preview").html(
                    $("<div>").attr({ "id": "profileimage","class": "profileimage" })
                        .css({ "background-image": "url('" + HTML_ROOT+"img/nophoto.png')" })
                );
            }

            profile.selectImage();
            // profile.resetImage();
            return false;
        }

        else if (isset(QUERY['user_id'])) {
            profile.show(QUERY['user_id']);
        }
        else {
            return false;
        }
    }

    static show(uid) {
        $('#follower_count').css({'color':'#ffffff'});
        $('.followerlist').css({'height':'0px','border':'0px'});
        $('.followinglist').css({'height':'0px','border':'0px'});
        $("#profile_followerlist").empty();
        $('#profile_form').show();
        $('.profile_eventlist').show();
        $('#profile_followerlist').hide();
        $('#profile_followinglist').hide();
        profile.showFollower(uid);
        profile.showFollowing(uid);
        profile.showEventAsOrganizer(uid);

        var formData =
            {
                'user_id': uid,
            };
        if (isset(localStorage.user_id) && isset(localStorage.hash)) {
            formData['watcher_id'] = localStorage.user_id;
            formData['hash'] = localStorage.hash;
        }
        $.ajax({
            url: ENDPOINT+"Profile/ShowProfile.php",
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

            if (!isset(data['error_message']) && isset(data['user_id'])) {
                $("#profile_container #profile_follow").empty();
                $("#profile_container #profile_follow")
                .append(
                    $("<div>")
                        .attr({ "class": "follower", "style":"float:left;width:10%;margin-left:5%;"})
                        .html(
                        $("<label class='mdl-icon-toggle mdl-js-icon-toggle mdl-js-ripple-effect' for='follower'/>").html(
                            "<input disabled type='checkbox' id='follower' class='follower_toggle mdl-icon-toggle__input'>"
                            +"<i class='mdl-icon-toggle__label material-icons'>favorite</i>"
                        )
                    )
                )
                .append(
                    $("<div>")
                        .attr({ "id" : "follower_count" , "class":"follow_count" })
                        .html( data['follower'] + ' follower')
                    )
                .append(
                    $("<div>")
                        .attr({ "class": "following", "style":"float:left;width:10%;margin-left:5%;"})
                        .html(
                        $("<label class='mdl-icon-toggle mdl-js-icon-toggle mdl-js-ripple-effect' for='following'/>").html(
                            "<input disabled type='checkbox' id='following' class='following_toggle mdl-icon-toggle__input'>"
                            +"<i class='mdl-icon-toggle__label material-icons'>person</i>"
                        )
                    )
                )
                .append(
                    $("<div>")
                        .attr({ "id" : "following_count" , "class":"follow_count" })
                        .html( data['following'] + ' follow')
                    )
                $("#profile_container #profile_follow").show();
                $('#profile_container #profile_name').text(data['firstname']+' '+data['lastname']);

                if(isset(data['introduction'])){
                    $('#profile_container .profile_introduction').show();
                    $('#profile_container #profile_introduction').attr({"contenteditable": "false"});                   
                    $('#profile_container #profile_introduction').css({'box-shadow':'none'});
                    $('#profile_container #profile_introduction').text(data['introduction']);
                }
                else{
                    $('#profile_container .profile_introduction').hide();
                    $('#profile_container #profile_introduction').attr({"contenteditable": "false"});                   
                    $('#profile_container #profile_introduction').css({'box-shadow':'none'});
                }
                  $('#profile_container .profile_introduction button').hide();

                if (fileExist(DATA_ROOT + "user/" + data['user_id'] + "/cover")) {
                    $("#profile_container #profile_cover_preview").html(
                        $("<div>").attr({ "class": "coverimage" })
                            .css({ "background-image": "url('" + DATA_ROOT + "user/" + data['user_id'] + "/cover?"+ new Date()+"')" })
                    );
                }else{
                    $("#profile_container #profile_cover_preview").html(
                        $("<div>").attr({ "class": "coverimage" })
                            .css({ "background": "#aaa" })
                    );
                }
                if (fileExist(DATA_ROOT + "user/" + data['user_id'] + "/profile")) {
                    $("#profile_container #profile_img_preview").html(
                        $("<div>").attr({ "class": "profileimage" })
                            .css({ "background-image": "url('" + DATA_ROOT + "user/" + data['user_id'] + "/profile?"+ new Date()+"')" })
                    );
                }else{
                    $("#profile_container #profile_img_preview").html(
                        $("<div>").attr({ "class": "profileimage" })
                            .css({ "background-image": "url('" + HTML_ROOT+"img/nophoto.png')" })
                    );
                }

                $('#drawer .container').hide();
                $('#profile_container').show();

                profile.updateFollow(data);
                componentHandler.upgradeDom();

                drawer.open();
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

    static showFollower(uid){
        $(document).off('click', '#follower_count');
        $(document).on('click', '#follower_count', function (event) {
            event.preventDefault();
            event.stopPropagation();
            $('#follower_count').css({'color':'#ff0000'});
            $('#profile_followerlist').show();
            $('#following_count').css({'color':'#ffffff'});
            $('#profile_followinglist').hide();

            if($('#follower_count').text()=='0 follower'){
                return false;
            }
            if($('.followerlist').css('height') == '70px'){
                $('#follower_count').css({'color':'#ffffff'});
                $('.followerlist').animate({'height':'0px','border':'0px'},300);
                setTimeout(function(){$("#profile_followerlist").empty();},300);
                $('#profile_form').show();
                $('.profile_eventlist').show('slow');
                $('#list_container').show('slow');
                return false;
            }
            $('#profile_form').hide();
            $('.profile_eventlist').hide('slow');
            $('#list_container').hide('slow');
            $("#profile_followerlist").empty();
            $("#profile_followinglist").empty();
            FOLLOWER_PAGE=1;
            profile.pullFollower(uid)
        });

        $(document).off('touchstart', '#profile_container');
        $(document).on('touchstart', '#profile_container',function() {
            if($('#follower_count').text()=='0 follower'){
                return false;
            }
            var position = $('#profile_container').scrollTop();
            $(document).off('touchend', '#profile_container');
            $(document).on('touchend', '#profile_container',function() {
                var scrollHeight = $('#profile_container').height();
                var scrollTop = $('#profile_container').scrollTop();
                var scrollPosition = $('#profile_container').height() + scrollTop;
                if (scrollHeight - scrollPosition < 0.2*scrollHeight && position <= scrollTop) {
                    FOLLOWER_PAGE+=1;
                    profile.pullFollower(uid);
                }
            });
        });
    }

    static pullFollower(uid){
        var formData =
        {
            'user_id': uid,
            'page': FOLLOWER_PAGE,
        };
        $.ajax({
            url: ENDPOINT+"Profile/ShowFollower.php",
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
                    for (var i = 0; i < Object.keys(data).length-1; i++) {
                        $("#profile_followerlist").append(
                            $("<div>").attr({ "id": "follower" + data[i]['user_id'], "class": "followerlist" })
                        );

                        if (fileExist(DATA_ROOT + "user/" + data[i]['user_id'] + "/profile")) {
                            $("#follower" + data[i]['user_id'])
                                .append(
                                $("<div class='userphoto'/>")
                                .css({
                                    "background-image": "url('" + DATA_ROOT + "user/" + data[i]['user_id'] + "/profile?"+ new Date()+"')",
                                })
                                .attr({"data-uid": data[i]['user_id']})
                                )
                        }
                        else {
                            $("#follower" + data[i]['user_id'])
                                .append(
                                $("<div class='userphoto'/>").css({
                                    "background-image": "url('" + HTML_ROOT+"img/nophoto.png')",
                                })
                                .attr({"data-uid": data[i]['user_id']})
                                )
                        }
                        $("#follower" + data[i]['user_id'])
                            .append(
                            $("<div class='name'/>").html(
                                data[i]['firstname'] + " " + data[i]['lastname']
                            )
                        );
                    }
                    $('.followerlist').animate({'height':'70px','border':'1px solid #ddd'},300);
                    return false;
                }
            }
            else if(isset(data['error_message']) && data['error_message']=='no_follower') {
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
    }


    static showFollowing(uid){
        $(document).off('click', '#following_count');
        $(document).on('click', '#following_count', function (event) {
            event.preventDefault();
            event.stopPropagation();
            $('#following_count').css({'color':'#0000ff'});
            $('#profile_followinglist').show();
            $('#follower_count').css({'color':'#ffffff'});
            $('#profile_followerlist').hide();

            if($('#following_count').text()=='0 follow'){
                return false;
            }
            if($('.followinglist').css('height') == '70px'){
                $('#following_count').css({'color':'#ffffff'});
                $('.followinglist').animate({'height':'0px','border':'0px'},300);
                setTimeout(function(){$("#profile_followinglist").empty();},300);
                $('#profile_form').show();
                $('.profile_eventlist').show('slow');
                $('#list_container').show('slow');
                return false;
            }
            $('#profile_form').hide();
            $('.profile_eventlist').hide('slow');
            $('#list_container').hide('slow');
            $("#profile_followerlist").empty();
            $("#profile_followinglist").empty();
            FOLLOWING_PAGE=1;
            profile.pullFollowing(uid)
        });
        // $(document).off('touchstart', '#profile_container');
        $(document).on('touchstart', '#profile_container',function() {
            if($('#following_count').text()=='0 follow'){
                return false;
            }
            var position = $('#profile_container').scrollTop();
            $(document).off('touchend', '#profile_container');
            $(document).on('touchend', '#profile_container',function() {
                var scrollHeight = $('#profile_container').height();
                var scrollTop = $('#profile_container').scrollTop();
                var scrollPosition = $('#profile_container').height() + scrollTop;
                if (scrollHeight - scrollPosition < 0.2*scrollHeight && position <= scrollTop) {
                    FOLLOWING_PAGE+=1;
                    profile.pullFollowing(uid);
                }
            });
        });
    }

    static pullFollowing(uid){
        var formData =
        {
            'user_id': uid,
            'page': FOLLOWING_PAGE,
        };
        $.ajax({
            url: ENDPOINT+"Profile/ShowFollowing.php",
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
                    for (var i = 0; i < Object.keys(data).length-1; i++) {
                        $("#profile_followinglist").append(
                            $("<div>").attr({ "id": "following" + data[i]['user_id'], "class": "followinglist" })
                        );

                        if (fileExist(DATA_ROOT + "user/" + data[i]['user_id'] + "/profile")) {
                            $("#following" + data[i]['user_id'])
                                .append(
                                $("<div class='userphoto'/>")
                                .css({
                                    "background-image": "url('" + DATA_ROOT + "user/" + data[i]['user_id'] + "/profile?"+ new Date()+"')",
                                })
                                .attr({"data-uid": data[i]['user_id']})
                                )
                        }
                        else {
                            $("#following" + data[i]['user_id'])
                                .append(
                                $("<div class='userphoto'/>").css({
                                    "background-image": "url('" + HTML_ROOT+"img/nophoto.png')",
                                })
                                .attr({"data-uid": data[i]['user_id']})
                                )
                        }
                        $("#following" + data[i]['user_id'])
                            .append(
                            $("<div class='name'/>").html(
                                data[i]['firstname'] + " " + data[i]['lastname']
                            )
                        );
                    }

                    $('.followinglist').animate({'height':'70px','border':'1px solid #ddd'},300);
                    return false;
                }
            }
            else if(isset(data['error_message']) && data['error_message']=='no_following') {
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
    }

    static showEventAsOrganizer(uid) {
        var formData =
            {
                "user_id": localStorage.user_id,
                "hash": localStorage.hash,
                'organizer_id': uid,
            };
        $.ajax({
            url: ENDPOINT+"Profile/ShowEventAsOrganizer.php",
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
                if (Object.keys(data).length > 0) {
                    $('.profile_eventlist').show();
                    $('#list_container').empty();
                    $('#list_container').show();

                    for (var group_id in data) {
                        for (var i in data[group_id]) {
                            list.generate(data, group_id, i);
                            profile.showIndividual(data, group_id, i);
                        }
                    }
                    SHOW_PROFILE = true;
                    return false;
                }
                else{
                    $('.profile_eventlist').hide();
                }
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
            $("#individual_container").scrollTop = 0;
            
            $('#headline_container').show();
            $('#detail_container').show();
            $('.back').hide();
            $('#back_to_profile').show();
    
            return false;
        });
    }

    static selectImage() {
        $(document).off('click','#profile_container #coverimage'); 
        $(document).on('click', '#profile_container #coverimage', function () {
            $('#profile_container #profile_cover').click();
            return false;
        });
        $(document).off('change','#profile_container #profile_cover'); 
        $(document).on('change','#profile_container #profile_cover', function () {
            var reader = new FileReader();
            $(reader).on("load", function () {
                $("#profile_container #coverimage").css({ "background-image": "url('" + this.result + "')", "background-size": "cover", "background-repeat": "no-repeat" });
            });
            if (this.files[0]) {
                reader.readAsDataURL(this.files[0]);
            }
        });

        $(document).off('click','#profile_container #profileimage'); 
        $(document).on('click', '#profile_container #profileimage', function () {
            $('#profile_container #profile_img').click();
            return false;
        });
        $(document).off('change','#profile_container #profile_img'); 
        $(document).on('change','#profile_container #profile_img', function () {
            var reader = new FileReader();
            $(reader).on("load", function () {
                $("#profile_container #profileimage").css({ "background-image": "url('" + this.result + "')", "background-size": "cover", "background-repeat": "no-repeat" });
            });
            if (this.files[0]) {
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    static resetImage() {
        $('#profile_container #profile_cover_preview').append($('<div>').attr({ "id": "removeimage_cover"}));
        $(document).off('click', '#profile_container #removeimage_cover');
        $(document).on('click', '#profile_container #removeimage_cover', function () {
            $('#profile_container #profile_cover').val(null);
            $("#profile_container #coverimage").css({ "background":"#aaa", "background-size": "cover", "background-repeat": "no-repeat" });
        });
        $('#profile_container #profile_img_preview').append($('<div>').attr({ "id": "removeimage_profile"}));
        $(document).off('click', '#profile_container #removeimage_profile');
        $(document).on('click', '#profile_container #removeimage_profile', function () {
            $('#profile_container #profile_img').val(null);
            $("#profile_container #profileimage").css({ "background-image": "url('" + HTML_ROOT+"img/nophoto.png')", "background-size": "cover", "background-repeat": "no-repeat" });
        });
    }

    static updateProfile() {
        if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
            $('#modal .container').hide();
            $("#auth_container").show();
            modal.open();
            return false;
        }
        var formData = new FormData();
        formData.append("user_id", localStorage.user_id);
        formData.append("hash", localStorage.hash);
        formData.append("introduction", $('#profile_container [name="introduction"]').text());
        formData.append('cover', $('#profile_container [type=file]')[0].files[0]);
        formData.append('profile', $('#profile_container [type=file]')[1].files[0]);

        $.ajax({
            url: ENDPOINT+"Profile/UpdateProfile.php",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
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
            if (!isset(data['error_message'])) {
                alert('Your profile has been updated.');
                localStorage.introduction = data['introduction'];
                drawer.close();
                return false;
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

    static updateFollow(data) {
        if (isset(localStorage.user_id) && isset(localStorage.hash)) {
            $('.follower_toggle').prop('disabled', false);
            if (isset(data['followed'])) {
                $('#follower').prop('checked', true);
            }
            else {
                $('#follower').prop('checked', false);
            }
        }

        if(isset(localStorage.user_id) && localStorage.user_id == data['user_id']){
            $('.follower_toggle').prop('disabled', true);
        }

        $(document).off('change', '#follower'); 
        $(document).on('change', '#follower', function (event) {
            event.preventDefault();
            event.stopPropagation();
    
            if ($(this).is(':checked')) {
                var follow = 1;
                $('#follower_count').text((parseInt($('#follower_count').text()) + 1)+' follower');
            } else {
                var follow = 0;
                $('#follower_count').text((parseInt($('#follower_count').text()) - 1)+' follower');
            }
    
            var formData = {
                "user_id": data['user_id'],
                "watcher_id": localStorage.user_id,
                "hash": localStorage.hash,
                "follow": follow,
            };
            $.ajax({
                url: ENDPOINT+"Profile/UpdateFollow.php",
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
                    return false;
                } else {
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

$(document).off('click', '[data-uid]'); $(document).on('click', '[data-uid]', function (event) {
    event.preventDefault();
    event.stopPropagation();
    profile.show($(this).data('uid'));
});

$(document).off('click', '#updateProfile'); $(document).on('click', '#updateProfile', function (event) {
    event.preventDefault();
    event.stopPropagation();
    profile.updateProfile();
});

$(document).off("click", "#back_to_profile"); $(document).on("click", "#back_to_profile", function (event) {
    event.preventDefault();
    event.stopPropagation();
    $('#drawer .container').hide();
    $('#profile_container').show();
    $('#list_container').show();
    return false;
});