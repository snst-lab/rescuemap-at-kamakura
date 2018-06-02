'use strict';

class auth {
    static login() {
        var formData =
            {
                'email': $('#auth_container [name="email_for_login"]').val(),
                'password': $('#auth_container [name="password"]').val(),
            };
        $.ajax({
            url: ENDPOINT+"Auth/Login.php",
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
            if (!isset(data['error_message']) && isset(data['user_id']) && isset(data['hash'])) {
                localStorage.clear();
                localStorage.setItem('user_id',data['user_id']);
                localStorage.setItem('hash',data['hash']);
                localStorage.setItem('email',data['email']);
                if(isset(data['customer_id'])){
                    localStorage.setItem('customer_id',data['customer_id']);
                }
                localStorage.setItem('type',data['type']);
                localStorage.setItem('firstname',data['firstname']);
                localStorage.setItem('lastname',data['lastname']);

                if(data['type']=='personal'){
                    localStorage.setItem('gender',data['gender']);
                    localStorage.setItem('year',data['year']);
                    localStorage.setItem('month',data['month']);
                    localStorage.setItem('day',data['day']);
                }
                localStorage.setItem('introduction',data['introduction']);
                $('#login').trigger('succeed');
                main.boundsChanged();
                alert('Login succeeded.');
                modal.close();
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

    static signup() {
        var formData =
            {
                'email': $('#auth_container [name="email_for_signup"]').val(),
            };
        $.ajax({
            url: ENDPOINT+"Auth/SignUp.php",
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
                alert('Check e-mail and complete the registration.');
                console.log(data['message']);
                modal.close();
            }
            else {
                alert(data['error_message']);
                return false;
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            alert('Check e-mail and complete the registration.');
            modal.close();
            return false;
        });
    }

    static passwordForgot() {
        var formData =
            {
                'email': $('#auth_container [name="email_for_password_reset"]').val(),
            };
        $.ajax({
            url: ENDPOINT+"Auth/PasswordForgot.php",
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
                console.log(data['message']);
                modal.close();
            }
            else {
                alert(data['error_message']);
                return false;
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            alert('Check e-mail and reset the password.');
            modal.close();
            return false;
        });
    }
}

$(document).off('click', '#login'); 
$(document).on('click', '#login', function (event) {
    event.preventDefault();
    event.stopPropagation();
    auth.login();
});

$(document).off('click', '#signup'); 
$(document).on('click', '#signup', function (event) {
    event.preventDefault();
    event.stopPropagation();
    auth.signup();
});

$(document).off('click', '#password_forgot');
$(document).on('click', '#password_forgot', function (event) {
    event.preventDefault();
    event.stopPropagation();
    auth.passwordForgot();
});

$(document).off('click', '#open_password_forgot_container');
$(document).on('click', '#open_password_forgot_container',function(event){
    event.preventDefault();
    event.stopPropagation();
    $("#password_forgot_container").show();
    if($("#password_forgot_container").css("height") == '0px'){
        if(MOBILE){
            $('#modal').animate({
                'min-height': '140vw',
            }, 300);
            $('#password_forgot_container').animate({
                'height': '50vw',
                '-moz-opacity': 1,
                'opacity': 1,
            }, 300);
        }
        else if(TABLET){
            $('#modal').animate({
                'min-height': '60vh',
            }, 300);
            $('#password_forgot_container').animate({
                'height': '30vh',
                '-moz-opacity': 1,
                'opacity': 1,
            }, 300);
        }
        else{
            $('#modal').animate({
                'min-height': '75vh',
            }, 300);
            $('#password_forgot_container').animate({
                'height': '30vh',
                '-moz-opacity': 1,
                'opacity': 1,
            }, 300);
        }
        $('#signup_container').animate({
            'height': '0px',
            '-moz-opacity': 0,
            'opacity': 0,
        }, 300);
    }
});

$(document).off('click', '#open_signup_container');
$(document).on('click', '#open_signup_container',function(event){
    event.preventDefault();
    event.stopPropagation();
    $("#signup_container").show();
    if($("#signup_container").css("height") == '0px'){
        if(MOBILE){
            $('#modal').animate({
                'min-height': '140vw',
            }, 300);
            $('#signup_container').animate({
                'height': '50vw',
                '-moz-opacity': 1,
                'opacity': 1,
            }, 300);
        }
        else if(TABLET){
            $('#modal').animate({
                'min-height': '60vh',
            }, 300);
            $('#signup_container').animate({
                'height': '30vh',
                '-moz-opacity': 1,
                'opacity': 1,
            }, 300);
        }
        else{
            $('#modal').animate({
                'min-height': '75vh',
            }, 300);
            $('#signup_container').animate({
                'height': '30vh',
                '-moz-opacity': 1,
                'opacity': 1,
            }, 300);
        }
        $('#password_forgot_container').animate({
            'height': '0px',
            '-moz-opacity': 0,
            'opacity': 0,
        }, 300);
    }
});

$(document).off('close', '#modal');
$(document).on('close', '#modal',function(event){
    event.preventDefault();
    event.stopPropagation();
    $('#password_forgot_container').animate({
        'height': '0px',
        '-moz-opacity': 0,
        'opacity': 0,
    }, 300);
    $("#password_forgot_container").hide();
    $('#signup_container').animate({
        'height': '0',
        '-moz-opacity': 0,
        'opacity': 0,
    }, 300);
    $("#signup_container").hide();
});

$('#signup_container input').on('blur change',function (event) {
    event.preventDefault();
    event.stopPropagation();

    $("#email_for_signup").each(function(){
        if($(this).val() == ''){
            $("#auth_email_for_signup_error").text('Email address is required.');
        }
        else if(!String($(this).val()).match(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.([a-z][a-z]|[a-z][a-z][a-z]|[a-z][a-z][a-z][a-z]|[a-z][a-z][a-z][a-z][a-z]|[a-z][a-z][a-z][a-z][a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i)){
            $("#auth_email_for_signup_error").text('Please enter a valid email address.');
        }
        else if(String($(this).val()).length > 128){
            $("#auth_email_for_signup_error").text('Email adress must be no longer than 128 characters.');
        }
        else{
            $("#auth_email_for_signup_error").empty();
        }
    });

    var valid=true;
    $("#signup_container .message_alert").each( function() {
        if(isset($("#signup_container .message_alert").text())){
            valid = false;
        }
    });
    if(valid){
        show('#signup');
    }
    else{
        hide('#signup');
    }
});