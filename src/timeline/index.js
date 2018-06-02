'use strict';
var TIMELINE_PAGE = 1;

class timeline {
    static show(data, group_id, i) {
        $(document).off('click', '#showTimeline' + data[group_id][i]["event_id"]);
        $(document).on('click', '#showTimeline' + data[group_id][i]["event_id"], function (event) {
            event.preventDefault();
            event.stopPropagation();

            if(isset(data[group_id][i]['is_self']) || isset(data[group_id][i]['voucher'])){
                $('#postTimelineForm').show();
                timeline.post(data, group_id, i);
                timeline.selectImage();
                timeline.resetImage();
            }
            else {
                $('#postTimelineForm').hide();
            }
            TIMELINE_PAGE = 1;
            $("#timeline").empty();
            timeline.pull(data, group_id, i);
        });

        $(document).off('touchstart', '#timeline_container');
        $(document).on('touchstart', '#timeline_container', function () {
            var position = $('#drawer').scrollTop();
            $(document).off('touchend', '#timeline_container');
            $(document).on('touchend', '#timeline_container', function () {
                var scrollHeight = $('#individual_container').height();
                var scrollTop = $('#drawer').scrollTop();
                var scrollPosition = $('#drawer').height() + scrollTop;
                if (scrollHeight - scrollPosition < 0.2*scrollHeight && position <= scrollTop) {
                    TIMELINE_PAGE += 1;
                    timeline.pull(data, group_id, i);

                }
                // var scrollPosition = $('#drawer').scrollTop();
                // if (scrollPosition < 0.2*scrollHeight & position >= scrollPosition) {
                //     $("#timeline").empty();
                //     TIMELINE_PAGE = 1;
                //     timeline.pull(data, group_id, i);
                // }
            });
        });
    }

    static pull(data, group_id, i, page) {
        $('#showTimeline' + data[group_id][i]["event_id"]).attr({ "id": "showDetail" + data[group_id][i]["event_id"] }).text("Show Detail");
        $('.postTimeline').attr('id', "postTimeline" + data[group_id][i]["event_id"]);

        var formData = {
            "user_id": localStorage.user_id,
            "hash": localStorage.hash,
            "event_id": data[group_id][i]["event_id"],
            "page": TIMELINE_PAGE,
        }
        $.ajax({
            url: ENDPOINT+"Timeline/ShowTimeline.php",
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
            if (!isset(timeline['error_message'])) {
                if (isset(timeline)) {
                    for (var i = 0; i < timeline.length; i++) {
                        $("#timeline").append(
                            $("<div>").attr({ "id": "timeline" + timeline[i]['timeline_id'], "class": "timeline" })
                        );

                        if (fileExist(DATA_ROOT + "user/" + timeline[i]['user_id'] + "/profile")) {
                            $("#timeline" + timeline[i]['timeline_id'])
                                .append(
                                $("<div class='userphoto'/>")
                                    .css({
                                        "background-image": "url('" + DATA_ROOT + "user/" + timeline[i]['user_id'] + "/profile?"+ new Date()+"')",
                                    })
                                    .attr({ "data-uid": timeline[i]['user_id'] })
                                )
                        }
                        else {
                            $("#timeline" + timeline[i]['timeline_id'])
                                .append(
                                $("<div class='userphoto'/>")
                                    .css({
                                        "background-image": "url('" + HTML_ROOT+"img/nophoto.png')",
                                    })
                                    .attr({ "data-uid": timeline[i]['user_id'] })
                                )
                        }

                        $("#timeline" + timeline[i]['timeline_id'])
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
                            $("#timeline" + timeline[i]['timeline_id'])
                                .append(
                                $("<div class='timelineimage'/>").css({
                                    "background-image": "url('" + DATA_ROOT + "timeline/" + timeline[i]['timeline_id'] + "/image/1')",
                                })
                                );
                        }

                        $("#timeline" + timeline[i]['timeline_id'])
                            .append(
                            $("<div class='content' contenteditable='true'/>").html(
                                timeline[i]['content']
                            )
                            )
                            .append(
                            $("<div class='likes_container'>").append(
                                $("<div class='likes'>")
                                    .append(
                                    $("<label class='mdl-icon-toggle mdl-js-icon-toggle mdl-js-ripple-effect' for='likes" + timeline[i]['timeline_id'] + "'/>").html(
                                        "<input type='checkbox' id='likes" + timeline[i]['timeline_id'] + "' class='likes_toggle mdl-icon-toggle__input'>"
                                        + "<i class='mdl-icon-toggle__label material-icons'>thumb_up</i>"
                                    )
                                    )
                                    .append(
                                    $("<div id='likes_count" + timeline[i]['timeline_id'] + "' class='likes_count'/>").html(
                                        timeline[i]['likes']
                                    )
                                    )
                            )
                                .append(
                                $("<div class='dislikes'>")
                                    .append(
                                    $("<label class='mdl-icon-toggle mdl-js-icon-toggle mdl-js-ripple-effect' for='dislikes" + timeline[i]['timeline_id'] + "'/>").html(
                                        "<input type='checkbox' id='dislikes" + timeline[i]['timeline_id'] + "' class='dislikes_toggle mdl-icon-toggle__input'>"
                                        + "<i class='mdl-icon-toggle__label material-icons'>thumb_down</i>"
                                    )
                                    )
                                    .append(
                                    $("<div id='dislikes_count" + timeline[i]['timeline_id'] + "' class='dislikes_count'/>").html(
                                        timeline[i]['dislikes']
                                    )
                                    )
                                )
                            ).append(
                            $("<div class='button_container'>")
                                .append(
                                $("<i id='timeline_remove" + timeline[i]['timeline_id'] + "' class='mdl-icon-toggle__label material-icons' style='font-size:2rem;display:none;'>close</i>")
                                )
                                .append(
                                $("<i id='timeline_edit" + timeline[i]['timeline_id'] + "' class='mdl-icon-toggle__label material-icons' style='font-size:2rem;display:none;'>refresh</i>")
                                )
                            )

                        if (timeline[i]['status'] == 'comment' && isset(timeline[i]['is_self'])) {
                            $("#timeline_remove" + timeline[i]['timeline_id']).show();
                            $("#timeline" + timeline[i]['timeline_id'] + " .content").attr({ "contenteditable": true });
                            $("#timeline" + timeline[i]['timeline_id'] + " [type=checkbox]").attr("disabled", true);
                            editTimeline(timeline, i);
                            removeTimeline(timeline, i);
                        }
                        else if(timeline[i]['status'] != 'comment' && isset(timeline[i]['is_self'])){
                            $("#timeline" + timeline[i]['timeline_id'] + " .content").attr({ "contenteditable": false });
                            $("#timeline" + timeline[i]['timeline_id'] + " [type=checkbox]").attr("disabled", true);
                        }
                        else{
                            $("#timeline_remove" + timeline[i]['timeline_id']).hide();
                            $("#timeline" + timeline[i]['timeline_id'] + " .content").attr({ "contenteditable": false });
                            $("#timeline" + timeline[i]['timeline_id'] + " [type=checkbox]").attr("disabled", false);
                            updateLikes(timeline, i);
                            updateDislikes(timeline, i);
                        }
                    }
                    componentHandler.upgradeDom();
                }
                $('#detail_container').hide('slow');
                $("#timeline_container").show("slow");
                
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

    static post(data, group_id, i) {
        $(document).off('click', '#postTimeline' + data[group_id][i]["event_id"]);
        $(document).on('click', '#postTimeline' + data[group_id][i]["event_id"], function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
                $('#modal .container').hide();
                $("#auth_container").show();
                modal.open();
                return false;
            }
            var formData = new FormData();
            formData.append("user_id", localStorage.user_id);
            formData.append("hash", localStorage.hash);
            formData.append("event_id", data[group_id][i]["event_id"]);
            formData.append("content", $('#timeline_container [name="content"]').text());
            formData.append("img", $('#timeline_container [type=file]')[0].files[0]);

            $.ajax({
                url: ENDPOINT+"Timeline/PostTimeline.php",
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
            .done(function (timeline, textStatus, jqXHR) {
                if (!isset(timeline['error_message'])) {
                    $("#timeline").prepend(
                        $("<div>").attr({ "id": "timeline" + timeline[0]['timeline_id'], "class": "timeline" })
                    );

                    if (fileExist(DATA_ROOT + "user/" + timeline[0]['user_id'] + "/profile")) {
                        $("#timeline" + timeline[0]['timeline_id'])
                            .append(
                            $("<div class='userphoto'/>")
                                .css({
                                    "background-image": "url('" + DATA_ROOT + "user/" + timeline[0]['user_id'] + "/profile?"+ new Date()+"')",
                                })
                                .attr({ "data-uid": timeline[0]['user_id'] })
                            )
                    }
                    else {
                        $("#timeline" + timeline[0]['timeline_id'])
                            .append(
                            $("<div class='userphoto'/>")
                                .css({
                                    "background-image": "url('" + HTML_ROOT+"img/nophoto.png')",
                                })
                                .attr({ "data-uid": timeline[0]['user_id'] })
                            )
                    }

                    $("#timeline" + timeline[0]['timeline_id'])
                        .append(
                        $("<div class='name'/>").html(
                            timeline[0]['firstname'] + " " + timeline[0]['lastname']
                        )
                        )
                        .append(
                        $("<div class='datetime'/>").html(
                            dateConvertUS(timeline[0]['datetime'])+' '+timeline[0]['timezone']
                        )
                        );
                    if (timeline[0]['image']==1) {
                        $("#timeline" + timeline[0]['timeline_id'])
                            .append(
                            $("<div class='timelineimage'/>").css({
                                "background-image": "url('" + DATA_ROOT + "timeline/" + timeline[0]['timeline_id'] + "/image/1')",
                            })
                            );
                    }

                    $("#timeline" + timeline[0]['timeline_id'])
                        .append(
                        $("<div class='content' contenteditable='true'/>").html(
                            timeline[0]['content']
                        )
                        )
                        .append(
                        $("<div class='likes_container'>").append(
                            $("<div class='likes'>")
                                .append(
                                $("<label class='mdl-icon-toggle mdl-js-icon-toggle mdl-js-ripple-effect' for='likes" + timeline[i]['timeline_id'] + "'/>").html(
                                    "<input type='checkbox' id='likes" + timeline[i]['timeline_id'] + "' class='likes_toggle mdl-icon-toggle__input'><i class='mdl-icon-toggle__label material-icons'>thumb_up</i>"
                                )
                                )
                                .append(
                                $("<div id='likes_count" + timeline[i]['timeline_id'] + "' class='likes_count'/>").html(
                                    timeline[i]['likes']
                                )
                                )
                        )
                            .append(
                            $("<div class='dislikes'>")
                                .append(
                                $("<label class='mdl-icon-toggle mdl-js-icon-toggle mdl-js-ripple-effect' for='dislikes" + timeline[i]['timeline_id'] + "'/>").html(
                                    "<input type='checkbox' id='dislikes" + timeline[i]['timeline_id'] + "' class='dislikes_toggle mdl-icon-toggle__input'><i class='mdl-icon-toggle__label material-icons'>thumb_down</i>"
                                )
                                )
                                .append(
                                $("<div id='dislikes_count" + timeline[i]['timeline_id'] + "' class='dislikes_count'/>").html(
                                    timeline[i]['dislikes']
                                )
                                )
                            )
                        ).append(
                        $("<div class='button_container'>")
                            .append(
                            $("<i id='timeline_remove" + timeline[0]['timeline_id'] + "' class='mdl-icon-toggle__label material-icons' style='font-size:2rem;display:none;'>close</i>")
                            )
                            .append(
                            $("<i id='timeline_edit" + timeline[0]['timeline_id'] + "' class='mdl-icon-toggle__label material-icons' style='font-size:2rem;display:none;'>refresh</i>")
                            )
                        )

                    if (timeline[0]['status'] == 'comment') {
                        $("#timeline_remove" + timeline[0]['timeline_id']).show();
                        $("#timeline" + timeline[0]['timeline_id'] + " .content").attr({ "contenteditable": true });
                        $("#timeline" + timeline[0]['timeline_id'] + " [type=checkbox]").attr("disabled", true);
                        editTimeline(timeline, 0);
                        removeTimeline(timeline, 0);
                    }

                    componentHandler.upgradeDom();

                    return false;
                }
                else if (isset(timeline['error_message']) && isset(timeline['auth'])) {
                    alert(timeline['error_message']);
                    $('#modal .container').hide();
                    $("#auth_container").show();
                    modal.open();
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
        });
    }

    static selectImage() {
        $('#timeline_img_preview_container').hide();
        $('#timeline_container #timeline_img_preview').empty();
        $("#timeline_container #timeline_img_preview").append(
            $("<div>").css({ "background-image": "url('" + HTML_ROOT+"img/noimage.png')" })
                .attr({ "id": "selectimage", "class": "selectimage" })
        );
        $('#timeline_img_add').show();
        
        $('#timeline_container #timeline_img').off('change');
        $('#timeline_container #timeline_img').on('change', function () {
            var reader = new FileReader();
            $(reader).on("load", function () {
                $("#timeline_container #selectimage").css({ "background-image": "url('" + this.result + "')", "background-size": "cover", "background-repeat": "no-repeat" });
            });
            if (this.files[0]) {
                reader.readAsDataURL(this.files[0]);
            }
            $('#timeline_img_preview_container').show('slow');
            $('#timeline_img_add').hide('slow');
        });
        $('#timeline_container #timeline_img_add').off('click');
        $('#timeline_container #timeline_img_add').on('click', function () {
            $('#timeline_container #timeline_img').click();
            return false;
        });
        $(document).off('click', '#timeline_container #selectimage');
        $(document).on('click', '#timeline_container #selectimage', function () {
            $('#timeline_container #timeline_img').click();
            return false;
        });
    }

    static resetImage() {
        $('#timeline_container #timeline_img_preview').append($('<div>').attr({ "id": "removeimage", "class": "removeimage" }));

        $(document).off('click', '#timeline_container #removeimage');
        $(document).on('click', '#timeline_container #removeimage', function () {
            $('#timeline_img_preview_container').hide('slow');
            $('#timeline_img_add').show('slow');
            $('#timeline_container #timeline_img').val(null);
            $("#timeline_container #selectimage").css({ "background-image": "url('" + HTML_ROOT+"img/noimage.png')", "background-size": "cover", "background-repeat": "no-repeat" });
        });
    }
}

function editTimeline(timeline, i) {
    $(document).off('blur', "#timeline" + timeline[i]['timeline_id'] + ' .content')
    $(document).on('blur', "#timeline" + timeline[i]['timeline_id'] + ' .content', function (event) {
        event.preventDefault();
        event.stopPropagation();
        $('#timeline_edit' + timeline[i]['timeline_id']).show("slow");
    });

    $(document).off('click', '#timeline_edit' + timeline[i]['timeline_id'])
    $(document).on('click', '#timeline_edit' + timeline[i]['timeline_id'], function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
            $('#modal .container').hide();
            $("#auth_container").show();
            modal.open();
            return false;
        }
        var formData =
            {
                "user_id": localStorage.user_id,
                "hash": localStorage.hash,
                "timeline_id": timeline[i]['timeline_id'],
                "content": $("#timeline" + timeline[i]['timeline_id'] + ' .content').text(),
            };
        $.ajax({
            url: ENDPOINT+"Timeline/EditTimeline.php",
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
            .done(function (timeline, textStatus, jqXHR) {
                if (!isset(timeline['error_message'])) {
                    alert('Timeline update succeeded.');
                    return false;
                }
                else if (isset(timeline['error_message']) && isset(timeline['auth'])) {
                    alert(timeline['error_message']);
                    $('#modal .container').hide();
                    $("#auth_container").show();
                    modal.open();
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
    });
}

function removeTimeline(timeline, i) {
    $(document).off('click', '#timeline_remove' + timeline[i]['timeline_id'])
    $(document).on('click', '#timeline_remove' + timeline[i]['timeline_id'], function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
            $('#modal .container').hide();
            $("#auth_container").show();
            modal.open();
            return false;
        }

        if (!confirm('Are you sure you want to remove the post?')) {
            return false;
        }
        var timeline_id = timeline[i]['timeline_id'];
        var formData =
            {
                "user_id": localStorage.user_id,
                "hash": localStorage.hash,
                "timeline_id": timeline_id,
            };
        $.ajax({
            url: ENDPOINT+"Timeline/RemoveTimeline.php",
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
            .done(function (timeline, textStatus, jqXHR) {
                if (!isset(timeline['error_message'])) {
                    $("#timeline" + timeline_id).hide('slow');
                    return false;
                }
                else if (isset(timeline['error_message']) && isset(timeline['auth'])) {
                    alert(timeline['error_message']);
                    $('#modal .container').hide();
                    $("#auth_container").show();
                    modal.open();
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
    });
}

function showTimeline(data, group_id, i){
    timeline.show(data, group_id, i)
}

function pullTimeline(data, group_id, i){
    timeline.pull(data, group_id, i)
}

function updateLikes(timeline, i) {

    if (isset(timeline[i]['liked'])) {
        $('#likes' + timeline[i]['timeline_id']).prop('checked', true);
    }
    else {
        $('#likes' + timeline[i]['timeline_id']).prop('checked', false);
    }

    if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
        $('.likes_toggle').prop('disabled', true);
    }

    $(document).off('change', '#likes' + timeline[i]['timeline_id']);
    $(document).on('change', '#likes' + timeline[i]['timeline_id'], function (event) {
        event.preventDefault();
        event.stopPropagation();

        if ($(this).is(':checked')) {
            var likes = 1;
            $('#likes_count' + timeline[i]['timeline_id']).text(parseInt($('#likes_count' + timeline[i]['timeline_id']).text()) + 1);
            if ($('#dislikes' + timeline[i]['timeline_id']).is(':checked')) {
                $('#dislikes_count' + timeline[i]['timeline_id']).text(parseInt($('#dislikes_count' + timeline[i]['timeline_id']).text()) - 1);
                $('#dislikes' + timeline[i]['timeline_id']).prop('checked', false);
            }
        } else {
            var likes = 0;
            $('#likes_count' + timeline[i]['timeline_id']).text(parseInt($('#likes_count' + timeline[i]['timeline_id']).text()) - 1);
        }

        var formData = {
            "user_id": localStorage.user_id,
            "hash": localStorage.hash,
            "timeline_id": timeline[i]['timeline_id'],
            "likes": likes,
        };
        $.ajax({
            url: ENDPOINT+"Timeline/UpdateLikes.php",
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

function updateDislikes(timeline, i) {

    if (isset(timeline[i]['disliked'])) {
        $('#dislikes' + timeline[i]['timeline_id']).prop('checked', true)
    }
    else {
        $('#dislikes' + timeline[i]['timeline_id']).prop('checked', false)
    }

    if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
        $('.dislikes_toggle').prop('disabled', true);
    }

    $(document).off('change', '#dislikes' + timeline[i]['timeline_id']);
    $(document).on('change', '#dislikes' + timeline[i]['timeline_id'], function (event) {
        event.preventDefault();
        event.stopPropagation();

        if ($(this).is(':checked')) {
            var dislikes = 1;
            $('#dislikes_count' + timeline[i]['timeline_id']).text(parseInt($('#dislikes_count' + timeline[i]['timeline_id']).text()) + 1);
            if ($('#likes' + timeline[i]['timeline_id']).is(':checked')) {
                $('#likes_count' + timeline[i]['timeline_id']).text(parseInt($('#likes_count' + timeline[i]['timeline_id']).text()) - 1);
                $('#likes' + timeline[i]['timeline_id']).prop('checked', false);
            }
        } else {
            var dislikes = 0;
            $('#dislikes_count' + timeline[i]['timeline_id']).text(parseInt($('#dislikes_count' + timeline[i]['timeline_id']).text()) - 1);
        }
        var formData = {
            "user_id": localStorage.user_id,
            "hash": localStorage.hash,
            "timeline_id": timeline[i]['timeline_id'],
            "dislikes": dislikes,
        };
        $.ajax({
            url: ENDPOINT+"Timeline/UpdateDislikes.php",
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

