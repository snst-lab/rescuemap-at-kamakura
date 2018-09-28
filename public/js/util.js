"use strict";

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

function isset(data) {
    return (typeof (data) != 'undefined' && data != "" && data != null && data != false && data != NaN && data != 0);
}

function getQuery() {
  var result = {};
  if ( 1 < location.search.length) {
    var query = location.search.substring(1);
    var parameters = query.split('&');

    for (var i = 0; i < parameters.length; i++) {
      var element = parameters[i].split('=');
      var paramName = decodeURIComponent(element[0]);
      var paramValue = decodeURIComponent(element[1]);
      result[paramName] = paramValue;
    }
  }
  return result;
}

//Hubeny Formula
function getDistance(lat1, lng1, lat2, lng2) {
  // Degree to Radian
  var radLat1 = (Math.PI / 180 * lat1);
  var radLng1 = (Math.PI / 180 * lng1);
  var radLat2 = (Math.PI / 180 * lat2);
  var radLng2 = (Math.PI / 180 * lng2);

  var radLatDiff = radLat1 - radLat2;
  var radLngDiff = radLng1 - radLng2;
  var radLatAve = (radLat1 + radLat2) / 2.0;

  var EquatorialRadius = 6378137;
  var PolarRadius = 6356752.314140356;
  var FirstEccentricity2 = 0.00669438002301188;
  var MeridianCurvature = 6335439.32708317;

  var sinLat = Math.sin(radLatAve);
  var W2 = 1.0 - FirstEccentricity2 * (sinLat * sinLat);
  var MeridianRadius = MeridianCurvature / (Math.sqrt(W2) * W2);
  var PrimeVerticalRadius = EquatorialRadius / Math.sqrt(W2);

  var t1 = MeridianRadius * radLatDiff;
  var t2 = PrimeVerticalRadius * Math.cos(radLatAve) * radLngDiff;
  var km = Math.sqrt((t1 * t1) + (t2 * t2)) / 1000;

  return km.toFixed(2);
//   var mile = km / 1.609344;
//   return mile.toFixed(2);
}

class drawer {
  static open() {
    $('#drawer').show();
    $("#drawer").animate({
      'left': $('body').width() - $("#drawer").width()
    }, 300);
    $("#overlay").css({
      'z-index': 1,
    });
    $("#overlay").animate({
      'filter': 'alpha(opacity=0.5)',
      '-moz-opacity': 0.5,
      'opacity': 0.5,
    }, 300);
  }
  static close() {
    $("#drawer").animate({
      'left': $('body').width()
    }, 300);
    $("#overlay").css({
      'z-index': 0,
    });
    $("#overlay").animate({
      'filter': 'alpha(opacity=0)',
      '-moz-opacity': 0,
      'opacity': 0,
    }, 300);
  }
}

$(document).off('touchstart', '#drawer');
$(document).on('touchstart', '#drawer', function (event) {
  var position = event.originalEvent.changedTouches[0].pageX;
  $(document).off('touchend', '#drawer');
  $(document).on('touchend', '#drawer', function (event) {
    if (event.originalEvent.changedTouches[0].pageX > position + $('#drawer').width() * 0.4) {
      drawer.close();
    }
  });
});


class modal {
  static open() {
    $('#modal').show();
    if($('#modal').css('width')==='0px'){
      $('#modal').css({'animation': 'modal_open 0.7s linear forwards'});
    }
    $('#modal').children().show();

    $("#overlay").css({
      'z-index': 1,
    });
    $("#overlay").animate({
      'filter': 'alpha(opacity=0.5)',
      '-moz-opacity': 0.5,
      'opacity': 0.5,
    }, 300);
  }
  static close() {
    if($('#modal').css('width')!=='0px'){
      $('#modal').css({'animation': 'modal_close 0.3s linear forwards'});
    }
    $('#modal').children().hide();
    $("#overlay").css({
      'z-index': 0,
    });
    $("#overlay").animate({
      'filter': 'alpha(opacity=0)',
      '-moz-opacity': 0,
      'opacity': 0,
    }, 300);
  }
}


$("#overlay").click(function () {
  drawer.close();
  modal.close();
});

$("#message").click(function(){
  $(window).scrollTop(300);
})


function jsonLoad(dataUrl){
  return new Promise((resolve, reject) =>  {
      const req = new XMLHttpRequest(); 
      req.open("get", dataUrl , true); 
      req.send(null); 
      req.onload = function(){
        resolve(JSON.parse(req.responseText));
      }
  });
}

function csv2json(dataUrl){
      const convert  = function(csvText){
          const csvArray = csvText.split('\n');
          var jsonArray = [];
          const items = csvArray[0].split(',');
          for (var i = 1; i < csvArray.length - 1; i++) {
            var a_line = new Object();
            const csvArrayD = csvArray[i].split(',');
            for (var j = 0; j < items.length; j++) {
              a_line[items[j]] = csvArrayD[j];
            }
            jsonArray.push(a_line);
          }
          return jsonArray;
      }      
      
      return new Promise((resolve, reject) =>  {
          const req = new XMLHttpRequest(); 
          req.open("get", dataUrl , true); 
          req.send(null); 
          req.onload = function(){
            const res = req.responseText;
            const json = convert(res);
            resolve(json);
          }
      });
  }


