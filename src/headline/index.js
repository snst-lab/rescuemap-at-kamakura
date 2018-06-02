'use strict';

var PARTICIPANT_PAGE = 1;

class headline {
    static show(data, group_id, i) {
        $("#headline_container #headline_title").html(data[group_id][i]["title"]);

        if (
            data[group_id][i]['img_count'] == 7  //Binary 111
        ) {
            $("#headline_container #headline_image1").css(
                {
                    "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/1')",
                    "background-size": "cover",
                    "opacity": "1",
                });
            $("#headline_container #headline_image2").css(
                {
                    "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/2')",
                    "background-size": "cover",
                    "opacity": "0",
                });
            $("#headline_container #headline_image3").css(
                {
                    "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/3')",
                    "background-size": "cover",
                    "opacity": "0",
                });
            clearInterval(this.changeimage);
            this.changeimage = setInterval(function () { changeImage3() }, 4000);
        }
        else if (
            data[group_id][i]['img_count'] == 6 //Binary 110
        ) {
            $("#headline_container #headline_image1").css(
                {
                    "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/1')",
                    "background-size": "cover",
                    "opacity": "1",
                });
            $("#headline_container #headline_image2").css(
                {
                    "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/2')",
                    "background-size": "cover",
                    "opacity": "0",
                });
            $("#headline_container #headline_image3").css(
                {
                    "opacity": "0",
                });
            clearInterval(this.changeimage);
            this.changeimage = setInterval(function () { changeImage2() }, 4000);
        }
        else if (
            data[group_id][i]['img_count'] == 5 //Binary 101
        ) {
            $("#headline_container #headline_image1").css(
                {
                    "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/1')",
                    "background-size": "cover",
                    "opacity": "1",
                });
            $("#headline_container #headline_image2").css(
                {
                    "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/3')",
                    "background-size": "cover",
                    "opacity": "0",
                });
            $("#headline_container #headline_image3").css(
                {
                    "opacity": "0",
                });
            clearInterval(this.changeimage);
            this.changeimage = setInterval(function () { changeImage2() }, 4000);
        }
        else if (
            data[group_id][i]['img_count'] == 4 //Binary 100
        ) {
            $("#headline_container #headline_image1").css(
                {
                    "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/1')",
                    "background-size": "cover",
                    "opacity": "1",
                });
            $("#headline_container #headline_image2").css(
                {
                    "opacity": "0",
                });
            $("#headline_container #headline_image3").css(
                {
                    "opacity": "0",
                });
            clearInterval(this.changeimage);
        }
        else if (
            data[group_id][i]['img_count'] == 3 //Binary 011
        ) {
            $("#headline_container #headline_image1").css(
                {
                    "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/2')",
                    "background-size": "cover",
                    "opacity": "1",
                });
            $("#headline_container #headline_image2").css(
                {
                    "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/3')",
                    "background-size": "cover",
                    "opacity": "0",
                });
            $("#headline_container #headline_image3").css(
                {
                    "opacity": "0",
                });
            clearInterval(this.changeimage);
            this.changeimage = setInterval(function () { changeImage2() }, 4000);
        }
        else if (
            data[group_id][i]['img_count'] == 2 //Binary 010
        ) {
            $("#headline_container #headline_image1").css(
                {
                    "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/2')",
                    "background-size": "cover",
                    "opacity": "1",
                });
            $("#headline_container #headline_image2").css(
                {
                    "opacity": "0",
                });
            $("#headline_container #headline_image3").css(
                {
                    "opacity": "0",
                });
            clearInterval(this.changeimage);
        }
        else if (
            data[group_id][i]['img_count'] == 1 //Binary 001
        ) {
            $("#headline_container #headline_image1").css(
                {
                    "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/3')",
                    "background-size": "cover",
                    "opacity": "1",
                });
            $("#headline_container #headline_image2").css(
                {
                    "opacity": "0",
                });
            $("#headline_container #headline_image3").css(
                {
                    "opacity": "0",
                });
            clearInterval(this.changeimage);
        }

        if (isset(data[group_id][i]["deadline"])) {
            $("#headline_container #headline_deadline").html('Deadline : ' + dateConvertUS(data[group_id][i]["deadline"]) + ' ' + data[group_id][i]["timezone"] + getWeek(data[group_id][i]["deadline"]));
        }
        if (isset(data[group_id][i]["max_participant"])) {
            $("#headline_container #headline_participant").html('Current Member : ' + data[group_id][i]["participant"] + ' / ' + data[group_id][i]["max_participant"] + ' Persons');
        }
        if (!isset(data[group_id][i]["max_participant"])) {
            $("#headline_container #headline_participant").html('Current Member : ' + data[group_id][i]["participant"] + ' Persons');
        }
        $("#headline_container #headline_favorite").empty();
        $("#headline_container #headline_favorite")
            .append(
                $("<div>")
                    .attr({ "class": "favorite" })
                    .html(
                        $("<label class='mdl-icon-toggle mdl-js-icon-toggle mdl-js-ripple-effect' for='favorite" + data[group_id][i]["event_id"] + "'/>").html(
                            "<input type='checkbox' id='favorite" + data[group_id][i]["event_id"] + "' class='favorite_toggle mdl-icon-toggle__input'>"
                            + "<i class='mdl-icon-toggle__label material-icons'>favorite</i>"
                        )
                    )
            )
            .append(
                $("<div>")
                    .attr({ "id": "favorite_count" + data[group_id][i]["event_id"], "class": "favorite_count" })
                    .html(data[group_id][i]["favorite"])
            )

            .append(
                $("<div>")
                    .attr({ "class": "unfavorite"})
                    .html(
                        $("<label class='mdl-icon-toggle mdl-js-icon-toggle mdl-js-ripple-effect' for='unfavorite" + data[group_id][i]["event_id"] + "'/>").html(
                            "<input type='checkbox' id='unfavorite" + data[group_id][i]["event_id"] + "' class='unfavorite_toggle mdl-icon-toggle__input'>"
                            + "<i class='mdl-icon-toggle__label material-icons'>thumb_down</i>"
                        )
                    )
            )
            .append(
                $("<div>")
                    .attr({ "id": "unfavorite_count" + data[group_id][i]["event_id"], "class": "unfavorite_count" })
                    .html(data[group_id][i]["unfavorite"])
            );
        
        componentHandler.upgradeDom();
        clearInterval(this.countdown);

        if(data[group_id][i]["status"]=='abort'){
            $("#headline_container #headline_countdown").html('Aborted by Organizer');
        }
        else{
            countDown(data[group_id][i]["deadline"], data[group_id][i]["timezone"]);
            this.countdown = setInterval(function () { countDown(data[group_id][i]["deadline"], data[group_id][i]["timezone"]); }, 1000);
        }

        $('.rightButton').attr('id', "showTimeline" + data[group_id][i]["event_id"]).text('Show Timeline');
        $("#headline [type=checkbox]").attr("disabled", false);

        if (!isset(data[group_id][i]['voucher']) && localStorage.user_id != data[group_id][i]["organizer_id"]) {
            $('.leftButton').attr('id', "participateIn" + data[group_id][i]["event_id"]).text('Participate in this event');
            headline.participateIn(data, group_id, i);
            headline.updateFavorite(data, group_id, i);
            headline.updateUnfavorite(data, group_id, i); 
        }
        else if (isset(data[group_id][i]['voucher']) && localStorage.user_id != data[group_id][i]["organizer_id"]) {
            $('.leftButton').attr('id', "participateOut" + data[group_id][i]["event_id"]).text('Cancel participation');
            headline.participateOut(data, group_id, i);
            headline.updateFavorite(data, group_id, i);
            headline.updateUnfavorite(data, group_id, i); 
        }
        else {
            $('.leftButton').attr('id', "showEditEvent" + data[group_id][i]["event_id"]).text('Edit Event');
            headline.showEditEvent(data, group_id, i);
            $("#headline [type=checkbox]").attr("disabled", true);
        }
    }

    static participateIn(data, group_id, i) {
        $(document).off('click', '#participateIn' + data[group_id][i]["event_id"]);
        $(document).on('click', '#participateIn' + data[group_id][i]["event_id"], function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
                $("#modal .container").hide();
                $("#auth_container").show();
                modal.open();
                return false;
            }
            $('#modal .container').hide();
            $("#terms_container").show();
            $("#terms_container #terms_message").text('');
            $("#terms_container button").attr({'id':'participateInConfirm'}).text('Agree to the Terms and Participate In');
            modal.open();
            return false;
        });
        $(document).off('click', '#participateInConfirm');
        $(document).on('click', '#participateInConfirm', function (event) {
            event.preventDefault();
            event.stopPropagation();
            headline.sendParticipateIn(data, group_id, i);
        });
    }

    static sendParticipateIn(data, group_id, i) {
        //Generate Voucher Code
        data[group_id][i]["voucher"] = CryptoJS.MD5(data[group_id][i]["event_id"] + localStorage.hash + new Date()).toString();

        var formData = {
            "participant_id": localStorage.user_id,
            "hash": localStorage.hash,
            "event_id": data[group_id][i]["event_id"],
            "voucher": data[group_id][i]["voucher"],
        }
        $.ajax({
            url: ENDPOINT+"Participant/ParticipateIn.php",
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
                data[group_id][i]["participant"] += 1;
                main.setMarker(MAP_OBJ, data);
            },
        })
        .done(function (data, textStatus, jqXHR) {
            if (!isset(data['error_message'])) {
                alert('You completed the booking');
                $("#detail_container #detail_voucher").empty();
                QR_OPTION['text'] = voucher;
                $("#detail_container #detail_voucher").qrcode(QR_OPTION);
                $("#detail_container #voucher").show("slow");
                modal.close();
                // $("#participant").html((data["participant"]+1) + ' / ' + data["max_participant"]);
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

    static participateOut(data, group_id, i) {
        $(document).off('click', '#participateOut' + data[group_id][i]["event_id"]);
        $(document).on('click', '#participateOut' + data[group_id][i]["event_id"], function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (!confirm('Do you cancel participation?')) {
                return false;
            }
            else {
                if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
                    $("#modal .container").hide();
                    $("#auth_container").show();
                    modal.open();
                    return false;
                }

                data[group_id][i]["voucher"] = null;

                var formData = {
                    "participant_id": localStorage.user_id,
                    "hash": localStorage.hash,
                    "event_id": data[group_id][i]["event_id"],
                }
                $.ajax({
                    url: ENDPOINT+"Participant/ParticipateOut.php",
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
                        data[group_id][i]["participant"] -= 1;
                        main.setMarker(MAP_OBJ, data);
                    },
                })
                    .done(function (data, textStatus, jqXHR) {
                        if (!isset(data['error_message'])) {
                            alert('You canceled participation.');
                            $("#detail_container #detail_voucher").empty();
                            $("#detail_container #voucher").hide("slow");
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
        });
    }
    
    static updateFavorite(data, group_id, i) {
        if (isset(data[group_id][i]['is_favorite'])) {
            $('#favorite' + data[group_id][i]["event_id"]).prop('checked', true);
        }
        else {
            $('#favorite' + data[group_id][i]["event_id"]).prop('checked', false);
        }

        if (!isset(localStorage.user_id) || !isset(localStorage.hash) || localStorage.user_id == data[group_id][i]["organizer_id"]) {
            $('.favorite_toggle').prop('disabled', true);
        }

        $(document).off('change', '#favorite' + data[group_id][i]["event_id"]);
        $(document).on('change', '#favorite' + data[group_id][i]["event_id"], function (event) {
            event.preventDefault();
            event.stopPropagation();

            if ($(this).is(':checked')) {
                data[group_id][i]['is_favorite'] = 1;
                data[group_id][i]['favorite'] += 1;
                $('#favorite_count' + data[group_id][i]["event_id"]).text(parseInt($('#favorite_count' + data[group_id][i]["event_id"]).text()) + 1);

                if ($('#unfavorite' + data[group_id][i]["event_id"]).is(':checked')) {
                    data[group_id][i]['unfavorite'] -= 1;
                    $('#unfavorite_count' + data[group_id][i]["event_id"]).text(parseInt($('#unfavorite_count' + data[group_id][i]["event_id"]).text()) - 1);
                    $('#unfavorite' + data[group_id][i]["event_id"]).prop('checked', false);
                }

            } else {
                data[group_id][i]['is_favorite'] = 0;
                data[group_id][i]['favorite'] -= 1;
                $('#favorite_count' + data[group_id][i]["event_id"]).text(parseInt($('#favorite_count' + data[group_id][i]["event_id"]).text()) - 1);
            }

            var formData = {
                "user_id": localStorage.user_id,
                "hash": localStorage.hash,
                "event_id": data[group_id][i]['event_id'],
                "favorite": data[group_id][i]['is_favorite'],
            };
            $.ajax({
                url: ENDPOINT+"Participant/UpdateFavorite.php",
                type: "POST",
                data: formData,
                dataType: "json",
                beforeSend: function (xhr, setting) {
                    $('#drawer_loading').show();
                },
                complete: function (xhr, textStatus) {
                    $('#drawer_loading').hide();
                    main.setMarker(MAP_OBJ, data);
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

    static updateUnfavorite(data, group_id, i) {
        if (isset(data[group_id][i]['is_unfavorite'])) {
            $('#unfavorite' + data[group_id][i]["event_id"]).prop('checked', true);
        }
        else {
            $('#unfavorite' + data[group_id][i]["event_id"]).prop('checked', false);
        }

        if (!isset(localStorage.user_id) || !isset(localStorage.hash) || localStorage.user_id == data[group_id][i]["organizer_id"]) {
            $('.unfavorite_toggle').prop('disabled', true);
        }

        $(document).off('change', '#unfavorite' + data[group_id][i]["event_id"]);
        $(document).on('change', '#unfavorite' + data[group_id][i]["event_id"], function (event) {
            event.preventDefault();
            event.stopPropagation();

            if ($(this).is(':checked')) {
                data[group_id][i]['is_unfavorite'] = 1;
                data[group_id][i]['unfavorite'] += 1;

                $('#unfavorite_count' + data[group_id][i]["event_id"]).text(parseInt($('#unfavorite_count' + data[group_id][i]["event_id"]).text()) + 1);
                if ($('#favorite' + data[group_id][i]["event_id"]).is(':checked')) {
                    data[group_id][i]['favorite'] -= 1;
                    $('#favorite_count' + data[group_id][i]["event_id"]).text(parseInt($('#favorite_count' + data[group_id][i]["event_id"]).text()) - 1);
                    $('#favorite' + data[group_id][i]["event_id"]).prop('checked', false);
                }
            } else {
                data[group_id][i]['is_unfavorite'] = 0;
                data[group_id][i]['unfavorite'] -= 1;
                $('#unfavorite_count' + data[group_id][i]["event_id"]).text(parseInt($('#unfavorite_count' + data[group_id][i]["event_id"]).text()) - 1);
            }

            var formData = {
                "user_id": localStorage.user_id,
                "hash": localStorage.hash,
                "event_id": data[group_id][i]['event_id'],
                "unfavorite": data[group_id][i]['is_unfavorite'],
            };
            $.ajax({
                url: ENDPOINT+"Participant/UpdateUnfavorite.php",
                type: "POST",
                data: formData,
                dataType: "json",
                beforeSend: function (xhr, setting) {
                    $('#drawer_loading').show();
                },
                complete: function (xhr, textStatus) {
                    $('#drawer_loading').hide();
                    main.setMarker(MAP_OBJ, data);
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

    static showEditEvent(data, group_id, i) {
        $(document).off('click', '#showEditEvent' + data[group_id][i]["event_id"]);
        $(document).on('click', '#showEditEvent' + data[group_id][i]["event_id"], function (event) {
            event.preventDefault();
            event.stopPropagation();
            organizer.showEditEvent(data, group_id, i);
        });
    }
}


function countDown(dateString, timezone) {
    var current = getCurrentTime(timezone);
    var limit = new Date(dateString);
    if (current < limit) {
        var left = limit - current;
        var a_day = 24 * 60 * 60 * 1000;
        var d = Math.floor(left / a_day);
        var h = Math.floor((left % a_day) / (60 * 60 * 1000));
        var m = Math.floor((left % a_day) / (60 * 1000)) % 60;
        var s = Math.floor((left % a_day) / 1000) % 60 % 60;
        $("#headline_container #headline_countdown").html(d + ' Days ' + ('00' + h).slice(-2) + ':' + ('00' + m).slice(-2) + ':' + ('00' + s).slice(-2) + ' Left');
    }
    else {
        $("#headline_container #headline_countdown").html('Booking Closed');
    }
}

function changeImage2() {
    if ($("#headline_container #headline_image1").css("opacity") == '1') {
        $("#headline_container #headline_image1").animate({ 'opacity': '0' }, 1000);
        $("#headline_container #headline_image2").animate({ 'opacity': '1' }, 1000);
    }
    else if ($("#headline_container #headline_image2").css("opacity") == '1') {
        $("#headline_container #headline_image2").animate({ 'opacity': '0' }, 1000);
        $("#headline_container #headline_image1").animate({ 'opacity': '1' }, 1000);
    }
}

function changeImage3() {
    if ($("#headline_container #headline_image1").css("opacity") == '1') {
        $("#headline_container #headline_image1").animate({ 'opacity': '0' }, 1000);
        $("#headline_container #headline_image2").animate({ 'opacity': '1' }, 1000);
    }
    else if ($("#headline_container #headline_image2").css("opacity") == '1') {
        $("#headline_container #headline_image2").animate({ 'opacity': '0' }, 1000);
        $("#headline_container #headline_image3").animate({ 'opacity': '1' }, 1000);
    }
    else if ($("#headline_container #headline_image3").css("opacity") == '1') {
        $("#headline_container #headline_image3").animate({ 'opacity': '0' }, 1000);
        $("#headline_container #headline_image1").animate({ 'opacity': '1' }, 1000);
    }
}

var QR_OPTION = {
    // render method: 'canvas', 'image' or 'div'
    render: 'canvas',

    // version range somewhere in 1 .. 40
    minVersion: 1,
    maxVersion: 40,

    // error correction level: 'L', 'M', 'Q' or 'H'
    ecLevel: 'L',

    // offset in pixel if drawn onto existing canvas
    left: 0,
    top: 0,

    // size in pixel
    size: 200,

    // code color or image element
    fill: '#000',

    // background color or image element, null for transparent background
    background: null,

    // content
    text: null,

    // corner radius relative to module width: 0.0 .. 0.5
    radius: 0,

    // quiet zone in modules
    quiet: 0,

    // modes
    // 0: normal
    // 1: label strip
    // 2: label box
    // 3: image strip
    // 4: image box
    mode: 0,

    mSize: 0.1,
    mPosX: 0.5,
    mPosY: 0.5,

    label: 'no label',
    fontname: 'sans',
    fontcolor: '#000',

    image: null
}