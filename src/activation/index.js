'use strict';

class activation{
    static onload(){
        if(isset(QUERY) && isset(QUERY['action']) && QUERY['action']=='activation' && isset(QUERY['hash'])){
            var formData =
            {
                'action' : 'onload',
                'hash' : QUERY['hash'],
            };
            $.ajax({
                url  : ENDPOINT+"Auth/Activation.php",
                type : "POST",
                data : formData,
                dataType    : "json",
                beforeSend: function (xhr, setting) {
                    $('#drawer_loading').show();
                },
                complete: function (xhr, textStatus) {
                    $('#drawer_loading').hide();
                },
            })
            .done(function(data, textStatus, jqXHR){
                if(!isset(data['error_message']) && isset(data['user_id']) && isset(data['email'])){
                    $('#drawer .container').hide();
                    $('#activation_container').show();
                    $('#activation_container [name="email"] ').val(data['email']);
                    
                    activation.selectDOB();
                    activation.validation();
                    componentHandler.upgradeDom();
                    
                    drawer.open();
                }
                else{
                    alert(data['error_message']);
                    return false;
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown){
                console.log(errorThrown);
                return false;
            });
        }
        else if(isset(localStorage.login) && isset(localStorage.email)){
            $('#auth_container [name="email_for_login"]').val(localStorage.email);
            $('#modal .container').hide();
            $("#auth_container").show();
            modal.open();
        }
        else{
            return false;
        }
    }

    static selectDOB(){
        var time = new Date();
        var year = time.getFullYear();
        for (var i = year; i >= 1900; i--) {
            $('#activation_container [name="year"]').append('<option value="' + i + '">' + i + '</option>');
        }
        for (var i = 1; i <= 12; i++) {
            $('#activation_container [name="month"]').append('<option value="' + i + '">' + i + '</option>');
        }
        for (var i = 1; i <= 31; i++) {
            $('#activation_container [name="day"]').append('<option value="' + i + '">' + i + '</option>');
        }
    }

    static submit(){
        if($('#activation_personal:eq(0)').is(':checked')){
            var formData =
            {
                'action' : 'submit',
                'hash' : QUERY['hash'],
                'type' : 'personal',
                'firstname' : $('#activation_container [name="firstname"]').val(),
                'lastname' : $('#activation_container [name="lastname"]').val(),
                'email' : $('#activation_container [name="email"]').val(),
                'password' : $('#activation_container [name="password"]').val(),
                'password_retype' : $('#activation_container [name="password_retype"]').val(),
                'day' : $('#activation_container [name="day"]').val(),
                'month' : $('#activation_container [name="month"]').val(),
                'year' : $('#activation_container [name="year"]').val(),
                'gender' : $('#activation_container [name="gender"]:checked').val(),
            };
        }
        else if($('#activation_corporate:eq(0)').is(':checked')){
            var formData =
            {
                'action' : 'submit',
                'hash' : QUERY['hash'],
                'type' : 'corporate',
                'corporate_name' : $('#activation_container [name="corporate_name"]').val(),
                'corporate_form' : $('#activation_container [name="corporate_form"]').val(),
                'email' : $('#activation_container [name="email"]').val(),
                'password' : $('#activation_container [name="password"]').val(),
                'password_retype' : $('#activation_container [name="password_retype"]').val(),
            };
        }
        else{
            return false;
        }

        $.ajax({
            url  : ENDPOINT+"Auth/Activation.php",
            type : "POST",
            data : formData,
            dataType   : "json",
            beforeSend: function (xhr, setting) {
                $('button').attr('disabled', true);
                $('#drawer_loading').show();
            },
            complete: function (xhr, textStatus) {
                $('button').attr('disabled', false);
                $('#drawer_loading').hide();
            },
        })
        .done(function(data, textStatus, jqXHR){
            if(!isset(data['error_message']) && isset(data['email'])){
                alert('Account activation succeeded.');
                localStorage.login = true;
                localStorage.email = data['email'];
                drawer.close();
                $('#modal .container').hide();
                $("#auth_container").show();
                modal.open();
                
                if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
                    location.href = URL_SCHEME;
                }
                else{
                    location.href = APP_ROOT;
                }
                return false;
            }
            else{
                alert(data['error_message']);
                return false;
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown);
            return false;
        });
    }
    
    static validation(){
        $('#activation_container input,#activation_container select').off('blur change');
        $('#activation_container input,#activation_container select').on('blur change',function (event) {
            event.preventDefault();
            event.stopPropagation();
            $("#activation_email").each(function(){
                if($(this).val() == ''){
                    $("#activation_email_error").text('Email address is required.');
                }
                else if(!String($(this).val()).match(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.([a-z][a-z]|[a-z][a-z][a-z]|[a-z][a-z][a-z][a-z]|[a-z][a-z][a-z][a-z][a-z]|[a-z][a-z][a-z][a-z][a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i)){
                    $("#activation_email_error").text('Please enter a valid email address.');
                }
                else if(String($(this).val()).length > 128){
                    $("#activation_email_error").text('Email adress must be no longer than 64 characters.');
                }
                else{
                    $("#activation_email_error").empty();
                }
            });
            $("#activation_password").each(function(){
                if($(this).val() == ''){
                    $("#activation_password_error").text('Password is required.');
                }
                else if($(this).val() != '' && !String($(this).val()).match(/^(?=.*?[a-z])(?=.*?\d)[a-z\d]{0,100}$/i)){
                    $("#activation_password_error").text('Please input password using numbers and letters.');
                }
                else if($(this).val() != '' && (String($(this).val()).length < 8 || String($(this).val()).length > 32)){
                    $("#activation_password_error").text('Please input password using more than 8 characters but less than 32.');
                }
                else{
                    $("#activation_password_error").empty();
                }
            });
            $("#activation_password_retype").each(function(){
                if($(this).val() != $("#activation_password").val()){
                    $("#activation_password_retype_error").text('Passwords do not match.');
                }
                else{
                    $("#activation_password_retype_error").empty();
                }
            });
            $("#activation_container [name='type']").each(function(){
                if(!($('#activation_personal:eq(0)').is(':checked') || $('#activation_corporate:eq(0)').is(':checked'))){
                    $("#activation_type_error").text('User type is required.');
                }
                else{
                    $("#activation_type_error").empty();
                }
            });
            if($('#activation_personal:eq(0)').is(':checked')){
                $("#activation_personal_container").show('slow');
                $("#activation_corporate_container").hide('slow');
                $("#activation_corporate_form_error").empty();
                $("#activation_corporate_name_error").empty();
                
                $("#activation_firstname").each(function(){
                    if($(this).val() == ''){
                        $("#activation_name_error").text('First name is required.');
                    }
                    else if(String($(this).val()).length > 32){
                        $("#activation_name_error").text('First name must be no longer than 32 characters.');
                    }
                    else{
                        $("#activation_lastname").each(function(){
                            if($(this).val() == ''){
                                $("#activation_name_error").text('Last name is required.');
                            }
                            else if(String($(this).val()).length > 32){
                                $("#activation_name_error").text('Last name must be no longer than 32 characters.');
                            }
                            else{
                                $("#activation_name_error").empty();
                            }
                        });
                    }
                });
                if($('#activation_container [name="day"]').val()=='0'   ||
                   $('#activation_container [name="month"]').val()=='0' ||
                   $('#activation_container [name="year"]').val()=='0'
                ){
                    $("#activation_dob_error").text('Day of birth is required.');
                }
                else{
                    $("#activation_dob_error").empty();
                }
                $("#activation_container [name='gender']").each(function(){
                    if(!($('#activation_male:eq(0)').is(':checked') || $('#activation_female:eq(0)').is(':checked'))){
                        $("#activation_gender_error").text('Gender is required.');
                    }
                    else{
                        $("#activation_gender_error").empty();
                    }
                });
            }
            else if($('#activation_corporate:eq(0)').is(':checked')){
                $("#activation_personal_container").hide('slow');
                $("#activation_corporate_container").show('slow');
                $("#activation_name_error").empty();
                $("#activation_dob_error").empty();
                $("#activation_gender_error").empty();
                
                $("#activation_corporate_name").each(function(){
                    if($(this).val() == ''){
                        $("#activation_corporate_name_error").text('Corporate name is required.');
                    }
                    else if(String($(this).val()).length > 32){
                        $("#activation_corporate_name_error").text('Corporate name must be no longer than 32 characters.');
                    }
                    else{
                        $("#activation_corporate_name_error").empty();
                    }
                });
                $("#activation_container [name='corporate_form']").each(function(){
                    if($(this).val() == ''){
                        $("#activation_corporate_form_error").text('Corporate form is required.');
                    }
                    else{
                        $("#activation_corporate_form_error").empty();
                    }
                });
            }
            var valid=true;
            $("#activation_container .message_alert").each( function() {
                if(isset($("#activation_container .message_alert").text())){
                    valid = false;
                }
            });
            if(valid){
                show("#activation");
            }
            else{
                hide("#activation");
            }
        });
    }
}


$(document).ready(function(){
    activation.onload();
});

document.addEventListener("resume", function () {
    activation.onload();
}, false);

$(document).off('click','#activation');$(document).on('click','#activation',function(event){
    event.preventDefault();
    event.stopPropagation();
    activation.submit();
});

