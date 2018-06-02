'use strict';

class setting{
    static onload(){
        if(isset(localStorage.disable_notice)){
            $('#setting_allow_notice').prop('checked',false);
        }else{
            $('#setting_allow_notice').prop('checked',true);
        }
        var formData =
        {
            'user_id' : localStorage.user_id,
            'hash' : localStorage.hash,
        };
        $.ajax({
            url  : ENDPOINT+"UserTimeline/ShowSetting.php",
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
            if(!isset(data['error_message'])){
                if(data['notice_setting']==7){
                    //Binary 111
                    $('#setting_favorite').prop('checked',true);
                    $('#setting_followee_organized').prop('checked',true);
                    $('#setting_followee_commented').prop('checked',true);
                }
                else if(data['notice_setting']==6){
                    //Binary 110
                    $('#setting_favorite').prop('checked',true);
                    $('#setting_followee_organized').prop('checked',true);
                    $('#setting_followee_commented').prop('checked',false);
                }
                else if(data['notice_setting']==5){
                    //Binary 101
                    $('#setting_favorite').prop('checked',true);
                    $('#setting_followee_organized').prop('checked',false);
                    $('#setting_followee_commented').prop('checked',true);
                }
                else if(data['notice_setting']==4){
                    //Binary 100
                    $('#setting_favorite').prop('checked',true);
                    $('#setting_followee_organized').prop('checked',false);
                    $('#setting_followee_commented').prop('checked',false);
                }
                else if(data['notice_setting']==3){
                    //Binary 011
                    $('#setting_favorite').prop('checked',false);
                    $('#setting_followee_organized').prop('checked',true);
                    $('#setting_followee_commented').prop('checked',true);
                }
                else if(data['notice_setting']==2){
                    //Binary 010
                    $('#setting_favorite').prop('checked',false);
                    $('#setting_followee_organized').prop('checked',true);
                    $('#setting_followee_commented').prop('checked',false);
                }
                else if(data['notice_setting']==1){
                    //Binary 001
                    $('#setting_favorite').prop('checked',false);
                    $('#setting_followee_organized').prop('checked',false);
                    $('#setting_followee_commented').prop('checked',true);
                }
                else if(data['notice_setting']==0){
                    //Binary 000
                    $('#setting_favorite').prop('checked',false);
                    $('#setting_followee_organized').prop('checked',false);
                    $('#setting_followee_commented').prop('checked',false);
                }
                componentHandler.upgradeDom();
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

    static changeOffline(){
        if ($('#setting_allow_notice').is(':checked')) {
            localStorage.setItem('disable_notice', 0);
        }else{
            localStorage.setItem('disable_notice', 1);
        }
    }
    
    static change(){
        if ($('#setting_favorite').is(':checked')) {
            var favorite = 1;
        }else{
            var favorite = 0;
        }
        if ($('#setting_followee_organized').is(':checked')) {
            var followee_organized = 1;
        }else{
            var followee_organized = 0;
        }
        if ($('#setting_followee_commented').is(':checked')) {
            var followee_commented = 1;
        }else{
            var followee_commented = 0;
        }
        var notice_setting_str = ""+ favorite + followee_organized + followee_commented;
        var notice_setting = parseInt(notice_setting_str, 2);

        var formData =
        {
            'user_id' : localStorage.user_id,
            'hash' : localStorage.hash,
            'notice_setting' : notice_setting,
        };
        $.ajax({
            url  : ENDPOINT+"UserTimeline/ChangeSetting.php",
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
            if(!isset(data['error_message'])){
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

$(document).ready(function () {
    if(isset(localStorage.user_id ) && isset(localStorage.hash)){
       setting.onload();
    }
});

$(document).on('succeed', '#login', function (event) {
    // event.preventDefault();
    event.stopPropagation();
    setting.onload();
});

$(document).off('change','#setting_allow_notice');
$(document).on('change','#setting_allow_notice',function(event){
    event.preventDefault();
    event.stopPropagation();
    setting.changeOffline();
});

$(document).off('change','#setting_favorite,#setting_followee_organized,#setting_followee_commented');
$(document).on('change','#setting_favorite,#setting_followee_organized,#setting_followee_commented',function(event){
    event.preventDefault();
    event.stopPropagation();
    setting.change();
});

