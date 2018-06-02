'use strict';

class user{
    static onload(){
        if(isset(QUERY['action']) && QUERY['action']=='alt_email' && isset(QUERY['hash'])){
            var formData =
            {
                'hash' : QUERY['hash'],
            };
            $.ajax({
                url  : ENDPOINT+"Auth/AltEmail.php",
                type : "POST",
                data : formData,
                dataType    : "json",
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
                if(!isset(data['error_message']) && isset(data['user_id']) && isset(data['email'])){
                    alert('E-mail address has been successfully changed.');
                    localStorage.setItem('user_id',data['user_id']);
                    localStorage.setItem('email',data['new_email']);
                    localStorage.setItem('hash',data['hash']);

                    if(isset(data['type']) && data['type']=='personal'){
                        // $('#user_corporate').hide();
                        // $('#user_personal').show();
                        localStorage.setItem('type','personal');
                        localStorage.setItem('firstname',data['firstname']);
                        localStorage.setItem('lastname',data['lastname']);
                        localStorage.setItem('year',data['year']);
                        localStorage.setItem('month',data['month']);
                        localStorage.setItem('day',data['day']);
                        localStorage.setItem('gender',data['gender']);
                    }
                    else if(isset(data['type']) && data['type']=='corporate'){
                        // $('#user_personal').hide();
                        // $('#user_corporate').show();
                        localStorage.setItem('type','corporate');
                        localStorage.setItem('firstname',data['firstname']);
                        localStorage.setItem('lastname',data['lastname']);
                    }
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
                    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
                        location.href = URL_SCHEME;
                    }
                    else{
                        location.href = APP_ROOT;
                    }
                    return false;
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown){
                console.log(errorThrown);
                return false;
            });
        }
        else{
            user.setValue();
            return false;
        }
    }

    static setValue(){
        $('#user_container [name="email"] ').val(localStorage.email);
        $('#user_container [name="introduction"] ').val(localStorage.introduction);

        if(isset(localStorage.type) && localStorage.type=='personal'){
            $('#user_corporate').hide();
            $('#user_personal').show();
            // user.selectDOB();
            $('#user_container [name="firstname"] ').val(localStorage.firstname);
            $('#user_container [name="lastname"] ').val(localStorage.lastname);
            $('#user_container [name="year"] ').val(localStorage.year);
            $('#user_container [name="month"] ').val(localStorage.month);
            $('#user_container [name="day"] ').val(localStorage.day);
            $('#user_container [name="gender"] ').val([localStorage.gender]);
        }
        else if(isset(localStorage.type) && localStorage.type=='corporate'){
            $('#user_personal').hide();
            $('#user_corporate').show();
            $('#user_container [name="corporate_name"] ').val(localStorage.firstname);
            $('#user_container [name="corporate_form"] ').val(localStorage.lastname);
        }
        else{
            $('#user_personal').hide();
            $('#user_corporate').hide();
            // $('#modal .container').hide();
            // $("#auth_container").show();
            // modal.open();
            return false;
        }
        user.validation();
    }

    // static selectDOB(){
    //     var time = new Date();
    //     var year = time.getFullYear();
    //     for (var i = year; i >= 1900; i--) {
    //         $('#user_container [name="year"]').append('<option value="' + i + '">' + i + '</option>');
    //     }
    //     for (var i = 1; i <= 12; i++) {
    //         $('#user_container [name="month"]').append('<option value="' + i + '">' + i + '</option>');
    //     }
    //     for (var i = 1; i <= 31; i++) {
    //         $('#user_container [name="day"]').append('<option value="' + i + '">' + i + '</option>');
    //     }
    // }

    static submit(){
        if(isset(localStorage.type) && localStorage.type=='personal'){
            var formData =
            {
                'hash' : localStorage.hash,
                'user_id' : localStorage.user_id,
                'type' : 'personal',
                'firstname' : $('#user_container [name="firstname"]').val(),
                'lastname' : $('#user_container [name="lastname"]').val(),
                'email' : $('#user_container [name="email"]').val(),
                'password' : $('#user_container [name="password"]').val(),
                'new_password' : $('#user_container [name="new_password"]').val(),
                'new_password_retype' : $('#user_container [name="new_password_retype"]').val(),
                // 'day' : $('#user_container [name="day"]').val(),
                // 'month' : $('#user_container [name="month"]').val(),
                // 'year' : $('#user_container [name="year"]').val(),
                // 'gender' : $('#user_container [name="gender"]').val(),
            };
        }
        else if(isset(localStorage.type) && localStorage.type=='corporate'){
            var formData =
            {
                'hash' : localStorage.hash,
                'user_id' : localStorage.user_id,
                'type' : 'corporate',
                'corporate_name' : $('#user_container [name="corporate_name"]').val(),
                'corporate_form' : $('#user_container [name="corporate_form"]').val(),
                'email' : $('#user_container [name="email"]').val(),
                'password' : $('#user_container [name="password"]').val(),
                'new_password' : $('#user_container [name="new_password"]').val(),
                'new_password_retype' : $('#user_container [name="new_password_retype"]').val(),
            };
        }      
        else{
            // $('#modal .container').hide();
            // $("#auth_container").show();
            // modal.open();
            return false;
        } 

        $.ajax({
            url  : ENDPOINT+"Auth/UpdateUser.php",
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
                alert('Account update succeeded.');
                if(isset(localStorage.type) && localStorage.type=='personal'){
                    $('#user_container [name="firstname"]').val(data['firstname']);
                    $('#user_container [name="lastname"]').val(data['lastname']);
                    $('#user_container [name="email"]').val(data['email']);
                    $('#user_container [name="day"]').val(data['day']);
                    $('#user_container [name="month"]').val(data['month']);
                    $('#user_container [name="year"]').val(data['year']);
                    $('#user_container [name="gender"]').val(data['gender']);
                    localStorage.setItem('firstname',data['firstname']);
                    localStorage.setItem('lastname',data['lastname']);
                    localStorage.setItem('email',data['email']);
                    localStorage.setItem('day',data['day']);
                    localStorage.setItem('month',data['month']);
                    localStorage.setItem('year',data['year']);
                    localStorage.setItem('gender',data['gender']);
                    drawer.close();
                }
                else if(isset(localStorage.type) && localStorage.type=='corporate'){
                    $('#user_container [name="corporate_name"]').val(data['corporate_name']);
                    $('#user_container [name="corporate_form"]').val(data['corporate_form']);
                    $('#user_container [name="email"]').val(data['email']);
                    localStorage.setItem('firstname',data['corporate_name']);
                    localStorage.setItem('lastname',data['corporate_form']);
                    localStorage.setItem('email',data['email']);
                    drawer.close();
                }      
                else{
                    return false;
                } 
            }
            else if(isset(data['error_message']) && isset(data['auth'])){
                alert(data['error_message']);
                $('#modal .container').hide();
                $("#auth_container").show();
                modal.open();
                return false;
            }
            else if(isset(data['error_message']) && isset(data['message'])){
                alert(data['error_message']);
                console.log(data['message']);
                return false;
            }
            else{
                alert(data['error_message']);
                return false;
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            alert('Check e-mail and complete the e-mail address alteration.');
            drawer.close();
            return false;
        });
    }
    
    static validation(){
        $('#user_container input,#user_container select').on('blur change',function (event) {
            event.preventDefault();
            event.stopPropagation();
            $("#user_email").each(function(){
                if($(this).val() == ''){
                    $("#user_email_error").text('Email address is required.');
                }
                else if(!String($(this).val()).match(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.([a-z][a-z]|[a-z][a-z][a-z]|[a-z][a-z][a-z][a-z]|[a-z][a-z][a-z][a-z][a-z]|[a-z][a-z][a-z][a-z][a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i)){
                    $("#user_email_error").text('Please enter a valid email address.');
                }
                else if(String($(this).val()).length > 128){
                    $("#user_email_error").text('Email adress must be no longer than 64 characters.');
                }
                else{
                    $("#user_email_error").empty();
                }
            });
            $("#user_new_password").each(function(){
                if($(this).val() != '' && !String($(this).val()).match(/^(?=.*?[a-z])(?=.*?\d)[a-z\d]{0,100}$/i)){
                    $("#user_new_password_error").text('Please input password using numbers and letters.');
                }
                else if($(this).val() != '' && (String($(this).val()).length < 8 || String($(this).val()).length > 32)){
                    $("#user_new_password_error").text('Please input password using more than 8 characters but less than 32.');
                }
                else{
                    $("#user_new_password_error").empty();
                }
            });
            $("#user_new_password_retype").each(function(){
                if($(this).val() != String($("#user_new_password").val())){
                    $("#user_new_password_retype_error").text('Passwords do not match.');
                }
                else{
                    $("#user_new_password_retype_error").empty();
                }
            });

            if( localStorage.type=='personal'){
                $("#user_personal").show('slow');
                $("#user_corporate").hide('slow');
                $("#user_corporate_form_error").empty();
                $("#user_corporate_name_error").empty();

                $("#user_firstname").each(function(){
                    if($(this).val() == ''){
                        $("#user_name_error").text('First name is required.');
                    }
                    else if(String($(this).val()).length > 32){
                        $("#user_name_error").text('First name must be no longer than 32 characters.');
                    }
                    else{
                        $("#user_lastname").each(function(){
                            if($(this).val() == ''){
                                $("#user_name_error").text('Last name is required.');
                            }
                            else if(String($(this).val()).length > 32){
                                $("#user_name_error").text('Last name must be no longer than 32 characters.');
                            }
                            else{
                                $("#user_name_error").empty();
                            }
                        });
                    }
                });
                // if($('#user_container [name="day"]').val()=='0'   ||
                //    $('#user_container [name="month"]').val()=='0' ||
                //    $('#user_container [name="year"]').val()=='0'
                // ){
                //     $("#user_dob_error").text('Day of birth is required.');
                // }
                // else{
                //     $("#user_dob_error").empty();
                // }
                // $("#user_container [name='gender']").each(function(){
                //     if(!isset($(this).val())){
                //         $("#user_gender_error").text('Gender is required.');
                //     }
                //     else{
                //         $("#user_gender_error").empty();
                //     }
                // });
            }
            else if( localStorage.type=='corporate'){
                $("#user_personal").hide('slow');
                $("#user_corporate").show('slow');
                $("#user_name_error").empty();
                $("#user_dob_error").empty();
                $("#user_gender_error").empty();

                $("#user_corporate_name").each(function(){
                    if($(this).val() == ''){
                        $("#user_corporate_name_error").text('Corporate name is required.');
                    }
                    else if(String($(this).val()).length > 32){
                        $("#user_corporate_name_error").text('Corporate name must be no longer than 32 characters.');
                    }
                    else{
                        $("#user_corporate_name_error").empty();
                    }
                });
                $("#user_corporate_form").each(function(){
                    if($(this).val() == ''){
                        $("#user_corporate_form_error").text('Corporate form is required.');
                    }
                    else{
                        $("#user_corporate_form_error").empty();
                    }
                });
            }
            else{
                $("#user_type_error").text('User type cannot be determined.');
            }
            var valid=true;
            $("#user_container .message_alert").each( function() {
                if(isset($("#user_container .message_alert").text()) || $('#user_container [name="type"]').val()=='error'){
                    valid = false;
                }
            });
            if(valid){
                show("#updateUser");
            }
            else{
                hide("#updateUser");
            }
        });
    }
}

$(document).ready(function(){
    user.onload();
});

document.addEventListener("resume", function () {
    user.onload();
}, false);

$(document).on('succeed', '#login', function (event) {
    event.preventDefault();
    event.stopPropagation();
    user.onload();
});

$(document).off('click','#open_user_change_email');$(document).on('click','#open_user_change_email',function(event){
    event.preventDefault();
    event.stopPropagation();
    $('#open_user_change_email').attr({'id':'cancel_user_change_email'})
    $('#user_email').attr('readonly',false);
    $('#user_current_password').show('slow');
    $('#user_change_password').hide('slow');
    $('#user_change_email .spin').show('slow');
});
$(document).off('click','#cancel_user_change_email');$(document).on('click','#cancel_user_change_email',function(event){
    event.preventDefault();
    event.stopPropagation();
    $('#cancel_user_change_email').attr({'id':'open_user_change_email'})
    $('#user_email').attr('readonly',true);
    $('#user_current_password').hide('slow');
    $('#user_change_password').hide('slow');
    $('#user_change_email .spin').hide('slow');
});
$(document).off('click','#open_user_change_password');$(document).on('click','#open_user_change_password',function(event){
    event.preventDefault();
    event.stopPropagation();
    $('#open_user_change_password').attr({'id':'cancel_user_change_password'})
    $('#user_current_password').show('slow');
    $('#user_change_password').show('slow');
    $('#user_email').attr('readonly',true);
    $('#user_change_email .spin').hide('slow');
});
$(document).off('click','#cancel_user_change_password');$(document).on('click','#cancel_user_change_password',function(event){
    event.preventDefault();
    event.stopPropagation();
    $('#cancel_user_change_password').attr({'id':'open_user_change_password'})
    $('#user_current_password').hide('slow');
    $('#user_change_password').hide('slow');
    $('#user_email').attr('readonly',true);
    $('#user_change_email .spin').hide('slow');
});

$(document).off('click','#updateUser');$(document).on('click','#updateUser',function(event){
    event.preventDefault();
    event.stopPropagation();
    user.submit();
});

