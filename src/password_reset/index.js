'use strict';

class passwordReset{
    static onload(){
        if(isset(QUERY) && isset(QUERY['action']) && QUERY['action']=='password_reset' && isset(QUERY['hash'])){
            var formData =
            {
                'action' : 'onload',
                'hash' : QUERY['hash'],
            };
            $.ajax({
                url  : ENDPOINT+"Auth/PasswordReset.php",
                type : "POST",
                data : formData,
                dataType    : "json",
            })
            .done(function(data, textStatus, jqXHR){
                if(!isset(data['error_message']) && isset(data['user_id']) && isset(data['email'])){
                    localStorage.setItem('user_id',data['user_id']);
                    localStorage.setItem('email',data['email']);
                    $('#password_reset_container [name="email"] ').val(data['email']);
                    $('#password_reset_container').show();
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
        else{
            return false;
        }
    }

    static submit(){
        var formData =
        {
            'action' : 'submit',
            'hash' : QUERY['hash'],
            'email' : $('#password_reset_container [name="email"]').val(),
            'password' : $('#password_reset_container [name="password"]').val(),
            'password_retype' : $('#password_reset_container [name="password_retype"]').val(),
        };
        $.ajax({
            url  : ENDPOINT+"Auth/PasswordReset.php",
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
                alert('Password has been successfully changed.');
                localStorage.setItem('login',true);
                localStorage.setItem('email',data['email']);
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
}

$(document).ready(function(){
    passwordReset.onload();
});

document.addEventListener("resume", function () {
    passwordReset.onload();
}, false);

$(document).off('click','#password_reset');$(document).on('click','#password_reset',function(event){
    event.preventDefault();
    event.stopPropagation();
    passwordReset.submit();
});

