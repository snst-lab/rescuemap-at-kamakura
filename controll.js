
    $(document).off("click", "button.here");
$(document).on("click", "button.here", function (event) {
    event.preventDefault();
    event.stopPropagation();

    var reqBody = {};
    if(isset(QUERY['hash'])){
      reqBody['hash']=QUERY['hash'];
    }else{
      alert('LINE IDを特定できません。もう一度LINE BOTにメッセージを送り地図を開いてください。')
      return false;
    }

    var result = prompt('あなたの位置情報を送信します：追加メッセージがあれば入力してください。','人が倒れています！誰かAEDを持ってきてください！');

   if(result!==null){
      reqBody['message'] = result; 
    }else{
      alert('位置情報の送信をキャンセルしました。');
      return false;
    }

    const self = this;
    ['lat','lng','placename','address'].forEach(function(attr){
        if(isset($(self).attr(attr))){reqBody[attr] = $(self).attr(attr);}
    });

    $.ajax({
        url: "https://kamakura-maps.glitch.me/here",
        type: "POST",
        data: reqBody,
        dataType: "json",
        beforeSend: function (xhr, setting) {
            $('#main_loading').show();
        }
    });
    alert('位置情報を送信しました。');
    $('#main_loading').hide();
});

$('.facility').on('click',function(){
    QUERY['facility']=$(this).attr('facility');
    var bounds = MAP_OBJ.getBounds();
    var bounds_json = $.parseJSON(JSON.stringify(bounds));
    NORTH = bounds_json["north"] + CELLSIZE * (bounds_json["north"] - bounds_json["south"]);
    SOUTH = bounds_json["south"] - CELLSIZE * (bounds_json["north"] - bounds_json["south"]);
    EAST = bounds_json["east"] + CELLSIZE * (bounds_json["east"] - bounds_json["west"]);
    WEST = bounds_json["west"] - CELLSIZE * (bounds_json["east"] - bounds_json["west"]);
    main.pullMarker(NORTH, SOUTH, EAST, WEST);
});