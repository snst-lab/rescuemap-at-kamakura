'use strict';

class organizer {
    static showCreateEvent(placename,address) {
        if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
            $('#modal .container').hide();
            $("#auth_container").show();
            modal.open();
            return false;
        }
        if(isset(placename)){
            $('#organizer_container [name="place_name"]').val(placename);
        }
        if(isset(address)){
            $('#organizer_container [name="address"]').val(address);
        }
        $('#organizer_container [name="title"]').val('');
        $('#organizer_container [name="description"]').text('');
        $("#organizer_cost").val('');
        $("#organizer_cost").attr('readonly',false);
        $('#organizer_container [name="max_participant"]').val('');
        $('#organizer_container [name="start"]').val('');
        $('#organizer_container [name="end"]').val('');
        $('#organizer_container [name="deadline"]').val('');
        $('#organizer_container [name="timezone"]').val('');
        $('#organizer_container [name="timezone"]').attr('disabled',false);
        $('#organizer_container [name="target_age"]').val(20, 100);

        for (var j = 1; j <= 3; j++) {
            $("#organizer_container #organizer_img_preview" + j).empty();
            $("#organizer_container #organizer_img_preview" + j).append(
                $("<div>").css({ "background-image": "url('" + HTML_ROOT+"img/noimage.png')" })
                    .attr({ "id": "selectimage" + j, "class": "selectimage" })
            );
            this.selectImage(j);
            this.resetImage(j);
        }
        this.calenderControl();
        this.sliderControl();
        $("#editEvent").attr({ "id": "createEvent" }).text("Create Event");
        $("#removeEvent").hide();
        $('#drawer .container').hide();
        $('#organizer_container').show();
        drawer.open();
        componentHandler.upgradeDom();
        this.validationCreateEvent();

        $(document).off('click', '#createEvent'); 
        $(document).on('click', '#createEvent', function (event) {
            event.preventDefault();
            event.stopPropagation();
            organizer.showNotice();
        });
    }

    static showNotice() {
        $('#modal .container').hide();
        $("#terms_container").show();
        $("#terms_container .index").text('Notice');
        $("#terms_container #terms_content").hide();
        $("#terms_container #terms_message").show();
        show("#terms_container #terms_message");
        $("#terms_container #terms_message").html('If you need to get permission or make a reservation when using a store, facility or place, the organizer yourself needs to proceed them. <br><br>The organizer should collect the participation fee of the event from participants if the participation fee is not free. Gatherlink never substitutes.');
        $("#terms_container button").text('OK');
        $("#terms_container button").attr({'id':'showTerms'});
        modal.open();

        $(document).off('click', '#showTerms'); 
        $(document).on('click', '#showTerms', function (event) {
            event.preventDefault();
            event.stopPropagation();
            organizer.showTerms();
        });
    }

    static showTerms() {
        $("#terms_container .index").text('Terms and Privacy Policy');
        hide("#terms_container #terms_message");
        show("#terms_container #terms_content");
        $("#terms_content").scrollTop(0);
        $("#terms_container #terms_message").text('');
        $("#terms_container button").text('Agree to the Terms and Organize Event');
        $("#terms_container button").attr({'id':'sendCreateEvent'});
        
        $(document).off('click', '#sendCreateEvent'); 
        $(document).on('click', '#sendCreateEvent', function (event) {
            event.preventDefault();
            event.stopPropagation();
            organizer.sendCreateEvent();
        });
    }

    static sendCreateEvent() {
        if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
            $('#modal .container').hide();
            $("#auth_container").show();
            modal.open();
            return false;
        }
        if (!isset(localStorage.customer_id) || localStorage.customer_id==null) {
            $('#modal .container').hide();
            $("#payment_container").show();
            modal.open();
            return false;
        }

        var formData = new FormData();
        formData.append("organizer_id", localStorage.user_id);
        formData.append("hash", localStorage.hash);
        formData.append("customer_id", localStorage.customer_id);
        formData.append("place_name", $('#organizer_container [name="place_name"]').val());
        formData.append("address", $('#organizer_container [name="address"]').val());
        formData.append("lat", LAT);
        formData.append("lng", LNG);
        formData.append("title", $('#organizer_container [name="title"]').val());
        formData.append("description", $('#organizer_container [name="description"]').text());
        formData.append("cost",  $("#organizer_cost").val());
        if ($('#organizer_container [name="max_participant"]').val() != "") {
            formData.append("max_participant", $('#organizer_container [name="max_participant"]').val());
        }
        formData.append("timezone", $('#organizer_container [name="timezone"]').val());
        formData.append("start", dateConvertISO($('#organizer_container [name="start"]').val()));
        formData.append("end", dateConvertISO($('#organizer_container [name="end"]').val()));
        formData.append("deadline", dateConvertISO($('#organizer_container [name="deadline"]').val()));
        formData.append("target_gender", $('#organizer_container .target_gender:checked').val());
        formData.append("age_lower", $('#organizer_container [name="target_age"]').val().split(",")[0]);
        formData.append("age_higher", $('#organizer_container [name="target_age"]').val().split(",")[1]);
        for (var i = 1; i <= 3; i++) {
            formData.append('img' + i, $('#organizer_container [type=file]')[i - 1].files[0]);
        }
        // for(var i = 0; i < $('input[type=file]')[0].files.length; i++ ) {
        //     formData.append('organizer_img'+i, $('input[type=file]')[0].files[i]);
        // }
        $.ajax({
            url: ENDPOINT+"Organizer/CreateEvent.php",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            dataType: "json",
            beforeSend: function (xhr, setting) {
                $('button').attr('disabled', true);
                $('#main_loading').show();
            },
            complete: function (xhr, textStatus) {
                $('button').attr('disabled', false);
                $('#main_loading').hide();
            },
        })
            .done(function (data, textStatus, jqXHR) {
                if (!isset(data['error_message'])) {
                    alert('Your event has been registered.');
                    modal.close();
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

    static showEditEvent(data, group_id, i) {
        if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
            $("#modal .container").hide();
            $("#auth_container").show();
            modal.open();
            return false;
        }
        $('#organizer_container [name="place_name"]').val(data[group_id][i]['place_name']);
        $('#organizer_container [name="address"]').val(data[group_id][i]['address']);
        $('#organizer_container [name="title"]').val(data[group_id][i]['title']);
        $('#organizer_container [name="description"]').text(data[group_id][i]['description']);
        $("#organizer_cost").val(data[group_id][i]['cost']);
        $("#organizer_cost").attr('readonly',true);
        if(data[group_id][i]['max_participant'] == 0){
            $('#organizer_container [name="max_participant"]').val('');
        }
        else{
            $('#organizer_container [name="max_participant"]').val(data[group_id][i]['max_participant']);
        }
        $('#organizer_container [name="start"]').val(dateConvertUS(data[group_id][i]['start']));
        $('#organizer_container [name="end"]').val(dateConvertUS(data[group_id][i]['end']));
        $('#organizer_container [name="deadline"]').val(dateConvertUS(data[group_id][i]['deadline']));
        $('#organizer_container [name="target_gender"]').val(data[group_id][i]['target_gender']);
        $('#organizer_container [name="target_age"]').val(data[group_id][i]['age_lower'], data[group_id][i]['age_higher']);
        $('#organizer_container [name="timezone"]').val(data[group_id][i]['timezone']);
        $('#organizer_container [name="timezone"]').attr('disabled',true);
        
        for (var j = 1; j <= 3; j++) {
            $("#organizer_container #organizer_img_preview" + j).empty();

            if (fileExist(DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/" + j)) {
                $("#organizer_container #organizer_img_preview" + j).append(
                    $("<div>").css({ "background-image": "url('" + DATA_ROOT + "gathering/" + data[group_id][i]['event_id'] + "/ref_img/" + j + "')" })
                        .attr({ "id": "selectimage" + j, "class": "selectimage" })
                );
            }
            else {
                $("#organizer_container #organizer_img_preview" + j).append(
                    $("<div>").css({ "background-image": "url('" + HTML_ROOT+"img/noimage.png')" })
                        .attr({ "id": "selectimage" + j, "class": "selectimage" })
                );
            }
            this.selectImage(j);
            this.resetImage(j);
        }
        componentHandler.upgradeDom();
        this.calenderControl();
        this.sliderControl();
        $("#createEvent").attr({ "id": "editEvent" }).text("Update Event");
        $("#editEvent").hide();
        $("#drawer .container").hide();
        $("#organizer_container").show();
        this.validationEditEvent();
        this.editEvent(data, group_id, i);
        this.removeEvent(data, group_id, i);
    }

    static editEvent(data, group_id, i) {
        $(document).off('click', '#editEvent'); 
        $(document).on('click', '#editEvent', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (!confirm('Do you change content of the event?')) {
                return false;
            } else {
                organizer.sendEditEvent(data, group_id, i);
            }
        });
    }
    
    static sendEditEvent(data, group_id, i) {
        if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
            $('#modal .container').hide();
            $("#auth_container").show();
            modal.open();
            return false;
        }
        if (!isset(localStorage.customer_id)) {
            $('#modal .container').hide();
            $("#payment_container").show();
            modal.open();
            return false;
        }
        var formData = new FormData();
        formData.append("event_id", data[group_id][i]['event_id']);
        formData.append("organizer_id", localStorage.user_id);
        formData.append("hash", localStorage.hash);
        formData.append("place_name", $('#organizer_container [name="place_name"]').val());
        formData.append("address", $('#organizer_container [name="address"]').val());
        formData.append("title", $('#organizer_container [name="title"]').val());
        formData.append("description", $('#organizer_container [name="description"]').text());
        // formData.append("cost", $("#organizer_cost").val());
        if ($('#organizer_container [name="max_participant"]').val() != "") {
            formData.append("max_participant", $('#organizer_container [name="max_participant"]').val());
        }
        formData.append("start", dateConvertISO($('#organizer_container [name="start"]').val()));
        formData.append("end", dateConvertISO($('#organizer_container [name="end"]').val()));
        formData.append("deadline", dateConvertISO($('#organizer_container [name="deadline"]').val()));
        // formData.append("timezone", $('#organizer_container [name="timezone"]').val());
        formData.append("target_gender", $('#organizer_container .target_gender:checked').val());
        formData.append("age_lower", $('#organizer_container [name="target_age"]').val().split(",")[0]);
        formData.append("age_higher", $('#organizer_container [name="target_age"]').val().split(",")[1]);
        for (var i = 1; i <= 3; i++) {
            formData.append('img' + i, $('#organizer_container [type=file]')[i - 1].files[0]);
        }
        $.ajax({
            url: ENDPOINT+"Organizer/EditEvent.php",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            dataType: "json",
            beforeSend: function (xhr, setting) {
                $('button').attr('disabled', true);
                $('#main_loading').show();
            },
            complete: function (xhr, textStatus) {
                $('button').attr('disabled', false);
                $('#main_loading').hide();
            },
        })
            .done(function (data, textStatus, jqXHR) {
                if (!isset(data['error_message'])) {
                    alert('Your event has been updated.');
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

    static removeEvent(data, group_id, i) {
        $(document).off('click', '#removeEvent'); $(document).on('click', '#removeEvent', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (!confirm('Do you remove the event?')) {
                return false;
            } else {
                organizer.sendRemoveEvent(data, group_id, i);
            }
        });
    }

    static sendRemoveEvent(data, group_id, i) {
        if (!isset(localStorage.user_id) || !isset(localStorage.hash)) {
            $('#modal .container').hide();
            $("#auth_container").show();
            modal.open();
            return false;
        }
        var formData = {
            'event_id': data[group_id][i]['event_id'],
            'organizer_id': localStorage.user_id,
            'hash': localStorage.hash,
            'place_name': $('#organizer_container [name="place_name"]').val(),
            'address': $('#organizer_container [name="address"]').val(),
            'title': $('#organizer_container [name="title"]').val(),
            'cost': $("#organizer_cost").val(),
            'start': $('#organizer_container [name="start"]').val(),
        }
        $.ajax({
            url: ENDPOINT+"Organizer/RemoveEvent.php",
            type: "POST",
            data: formData,
            dataType: "json",
            beforeSend: function (xhr, setting) {
                $('button').attr('disabled', true);
                $('#main_loading').show();
            },
            complete: function (xhr, textStatus) {
                $('button').attr('disabled', false);
                $('#main_loading').hide();
            },
        })
            .done(function (data, textStatus, jqXHR) {
                if (!isset(data['error_message'])) {
                    alert('Your event has been removed.');
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

    static selectImage(j) {
        $('#organizer_container #organizer_img' + j).off('change');
        $('#organizer_container #organizer_img' + j).on('change', function () {
            var reader = new FileReader();

            $(reader).on("load", function () {
                $("#organizer_container #selectimage" + j).css({ "background-image": "url('" + this.result + "')", "background-size": "cover", "background-repeat": "no-repeat" });
            });
            if (this.files[0]) {
                reader.readAsDataURL(this.files[0]);
            }
        });
        $(document).off('click', '#organizer_container #selectimage' + j);
        $(document).on('click', '#organizer_container #selectimage' + j, function () {
            $('#organizer_container #organizer_img' + j).click();
            return false;
        });
    }

    static resetImage(j) {
        $('#organizer_container #organizer_img_preview' + j).append($('<div>').attr({ "id": "removeimage" + j, "class": "removeimage" }));

        $(document).off('click', '#organizer_container #removeimage' + j);
        $(document).on('click', '#organizer_container #removeimage' + j, function () {
            $('#organizer_container #organizer_img' + j).val(null);
            $("#organizer_container #selectimage" + j).css({ "background-image": "url('" + HTML_ROOT+"img/noimage.png')", "background-size": "cover", "background-repeat": "no-repeat" });
        });
    }

    static validationCreateEvent(){
        $('#organizer_container input:not([type=file]):not(.datetime),#organizer_container select,#organizer_container [contenteditable="true"]').off('click blur change');
        $('#organizer_container input:not([type=file]):not(.datetime),#organizer_container select,#organizer_container [contenteditable="true"]').on('blur change',function (event) {
            event.preventDefault();
            event.stopPropagation();

            organizer.validation();
            var valid=true;
            $("#organizer_container .message_alert").each( function() {
                if(isset($("#organizer_container .message_alert").text())){
                    valid = false;
                }
            });
            if(valid){
                show("#createEvent");
            }
            else{
                hide("#createEvent");
            }
        });
    }

    static validationEditEvent(){
        $('#organizer_container input:not([type=file]):not(.datetime),#organizer_container [contenteditable="true"]').off('blur change');
        $('#organizer_container input,#organizer_container [contenteditable="true"]').on('blur change',function (event) {
            event.preventDefault();
            event.stopPropagation();
            $("#organizer_container .message_alert").empty();

            organizer.validation();
            var valid=true;
            $("#organizer_container .message_alert").each( function() {
                if(isset($("#organizer_container .message_alert").text())){
                    valid = false;
                }
            });
            if(valid){
                show("#editEvent");
                show("#removeEvent");
            }
            else{
                hide("#editEvent");
                hide("#removeEvent");
            }
        });
    }

    static validation(){
        $("#organizer_title").each(function(){
            if($(this).val() == ''){
                $("#organizer_title_error").text('Event title is required.');
            }
            else if(String($(this).val()).length > 64){
                $("#organizer_title_error").text('Event title must be no longer than 64 characters.');
            }
            else{
                $("#organizer_title_error").empty();
            }
        });
        $("#organizer_place_name").each(function(){
            if($(this).val() == ''){
                $("#organizer_place_name_error").text('Place name is required.');
            }
            else if(String($(this).val()).length > 64){
                $("#organizer_place_name_error").text('Place name must be no longer than 64 characters.');
            }
            else{
                $("#organizer_place_name_error").empty();
            }
        });
        $("#organizer_address").each(function(){
            if(String($(this).val()).length > 64){
                $("#organizer_address_error").text('Address must be no longer than 64 characters.');
            }
            else{
                $("#organizer_address_error").empty();
            }
        });
        $("#organizer_description").each(function(){
            if($(this).text() == ''){
                $("#organizer_description_error").text('Description is required.');
            }
            else if(String($(this).text()).length > 255){
                $("#organizer_description_error").text('Description must be no longer than 255 characters.');
            }
            else{
                $("#organizer_description_error").empty();
            }
        });
        $("#organizer_cost,#organizer_max_participant").each(function(){
            var COST_FEE_RATE = 0.05;
            var cost = $("#organizer_cost").val();
            var max_participant = $("#organizer_max_participant").val();
        
            if(cost=='' || cost.match( /[^0-9]/)){
                $("#organizer_cost_error").text('Participation cost must be an integer value.');
            }
            else if(max_participant.match( /[^0-9]/)){
                $("#organizer_cost_error").text('Participant limit must be an integer value.');
            }
            else if(max_participant=='0'){
                $("#organizer_cost_error").text('Participant limit must be at least one or more persons.');
            }
            else{
                $("#organizer_cost_error").empty();
            }
            if(isset(cost) && cost.match( /[0-9]/) && !isset(max_participant)){
                var fee = (parseInt(cost) * COST_FEE_RATE).toFixed(2)
                $("#organizer_estimated_fee").text('Estimated Fee : '+ fee + ' USD / Participant');
            }
            else if(isset(cost) && cost.match( /[0-9]/) && isset(max_participant) && max_participant.match( /[0-9]/)){
                var fee = (parseInt(cost) * parseInt(max_participant) * COST_FEE_RATE).toFixed(2)
                if(fee>=0.5){
                    $("#organizer_estimated_fee").text('Estimated Max Fee : '+ fee + ' USD');
                }
                else{
                    $("#organizer_estimated_fee").text('Estimated Fee : 0 USD');
                }
            }
            else{
                $("#organizer_estimated_fee").text('Estimated Fee : 0 USD');
            }
        });
        $("#organizer_start").each(function(){
            if($(this).val() == ''){
                $("#organizer_datetime_error").text('Start datetime is required.');
            }
            else{
                $("#organizer_datetime_error").empty();
                $("#organizer_end").each(function(){
                    if($(this).val() == ''){
                        $("#organizer_datetime_error").text('End datetime is required.');
                    }
                    else{
                        $("#organizer_datetime_error").empty();
                    }
                });
            }
        });
        $("#organizer_deadline").each(function(){
            if($(this).val() == ''){
                $("#organizer_deadline_error").text('Deadline is required.');
            }
            else{
                $("#organizer_deadline_error").empty();
                $("#organizer_timezone").each(function(){
                    if($(this).val() == ''){
                        $("#organizer_deadline_error").text('Timezone is required.');
                    }
                    else{
                        $("#organizer_deadline_error").empty();
                    }
                });
            }
        });
        $("#organizer_container [name='target_gender']").each(function(){
            if(!($('#organizer_both:eq(0)').is(':checked') || $('#organizer_male:eq(0)').is(':checked') || $('#organizer_female:eq(0)').is(':checked'))){
                $("#organizer_gender_error").text('Target gender is required.');
            }
            else{
                $("#organizer_gender_error").empty();
            }
        });
    }

    static calenderControl(){
        $('#organizer_container #organizer_start').bootstrapMaterialDatePicker({ weekStart: 0, format: 'DD/MM/YYYY HH:mm' }).on('change', function (e, date) {
            // organizer.validation();
            $('#organizer_container #organizer_end').bootstrapMaterialDatePicker('setMinDate', date);
        });
        $('#organizer_container #organizer_end').bootstrapMaterialDatePicker({ weekStart: 0, format: 'DD/MM/YYYY HH:mm' }).on('change', function (e, date) {
            // organizer.validation();
            $('#organizer_container #organizer_start').bootstrapMaterialDatePicker('setMaxDate', date);
        });
        $('#organizer_container #organizer_start').bootstrapMaterialDatePicker({ weekStart: 0, format: 'DD/MM/YYYY HH:mm' }).on('change', function (e, date) {
            // organizer.validation();
            $('#organizer_container #organizer_deadline').bootstrapMaterialDatePicker('setMaxDate', date);
        });
        $('#organizer_container #organizer_deadline').bootstrapMaterialDatePicker({ weekStart: 0, format: 'DD/MM/YYYY HH:mm' }).on('change', function (e, date) {
            organizer.validation();
            $('#organizer_container #organizer_start').bootstrapMaterialDatePicker('setMinDate', date);
        });
    }

    static sliderControl(){
        $('#organizer_container .range-slider').jRange({
            from: 18,
            to: 100,
            step: 1,
            scale: [18, 40, 60, 80, 100],
            format: '%s',
            width: "100%",
            showLabels: true,
            isRange: true,
        });
        $('#organizer_container .pointer-label.low').css('left', '0%');
        $('#organizer_container .pointer-label.high').css('left', '95%');
        $('#organizer_container .range-slider').jRange('updateRange', '18,100');
        $('#organizer_container .range-slider').jRange('setValue', '18,100');
        $('#organizer_container .selected-bar').animate({'width':'100%','left':'0%'},300);
        $('#organizer_container .pointer.low').animate({'left':'-2%'},300);
        $('#organizer_container .pointer.high').animate({'left':'98%'},300);
    }
}

$(document).off('click', '#showCreateEvent');
$(document).on("click", "#showCreateEvent", function (event) {
    event.preventDefault();
    event.stopPropagation();
    organizer.showCreateEvent($(this).data('placename'),$(this).data('address'));
});
