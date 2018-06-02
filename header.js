'use strict';

var APP_NAME = 'GatherLink';
var URL_SCHEME = 'gatherlink://';
var HTML_ROOT = 'https://gatherlink.site/';
var APP_ROOT = 'https://gatherlink.site/app.html';
var DOC_ROOT = 'https://gatherlink.site/doc/';
var ENDPOINT = 'https://gatherlink.site/endpoint/';
var DATA_ROOT = 'https://gatherlink.site/data/';
var QUERY={};

var ok_sound = new Audio('sound/ok.wav');
var reentry_sound = new Audio('sound/reentry.wav');
var MOBILE = screen.width / screen.height <= 11 / 16 ? true : false;
var TABLET = screen.width / screen.height > 11 / 16 && screen.width / screen.height < 13 / 16 ? true : false;

function include(dom, targetDir) {
  $.ajax({
    url: targetDir + '/index.html',
    cache: false,
    async: false,
    success: function (html) {
      $(dom).append(html);
    }
  });
  $('head').append('<link rel="stylesheet" type="text/css" href="' + targetDir + '/index.css">');
  $('body').append('<script type="text/javascript" src="' + targetDir + '/index.js"></script>');
}

function includeHTML(dom, targetHTML) {
  $.ajax({
    url: targetHTML,
    cache: false,
    async: false,
    success: function (html) {
      $(dom).append(html);
    }
  });
}

function includeScript(targetScript) {
  $('body').append('<script type="text/javascript" src="' + targetScript + '" async defer></script>');
}

function includeCSS(targetCSS) {
  $('head').append('<link rel="stylesheet" type="text/css" href="' + targetCSS + '">');
}

function isset(data) {
  return (typeof (data) != 'undefined' && data != "" && data != null && data != false && data != NaN && data != 0);
}

function handleOpenURL(url) {
  setTimeout(function() {
    getQueryForAndroid(url) ;
  }, 0);
}

function getQueryForAndroid(url) {
  var query = (url.match(/\?.*?(?=(#|$))/g) || [''])[0].slice(1);
  if ( 1 < query.length) {
    var parameters = query.split('&');

    for (var i = 0; i < parameters.length; i++) {
      var element = parameters[i].split('=');
      var paramName = decodeURIComponent(element[0]);
      var paramValue = decodeURIComponent(element[1]);
      QUERY[paramName] = paramValue;
    }
  }
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
if (!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
   QUERY = getQuery();
}

function fileExist(url) {
  var xhr = new XMLHttpRequest();
  xhr.open("HEAD", url, false); //true : async
  xhr.send(null);
  if (xhr.status == '200') {
    return true;
  } else {
    return false;
  }
}

// function fileExist(url) {
//   var jqXHR = $.ajax({
//     url: ENDPOINT + "GetURL.php",
//     type: "POST",
//     data: { 'url': url },
//     dataType: "json",
//     // async: false,
//   });
//   if (jqXHR.status == '200') {
//     return true;
//   } else {
//     return false;
//   }
// }

// function fileExist(url) {
//   const promise = new Promise((resolve, reject) =>{
//     $.ajax({
//       url: SERVER_ROOT + "get.php",
//       type: "POST",
//       data: { 'url': url },
//       dataType: "json",
//       complete: function (jqXHR, textStatus) {
//         if (jqXHR.status == '200') {
//           resolve(true);
//         } else {
//           resolve(false);
//         }
//       }
//     });
//   });
//   promise.then(function(result) {
//     return result;
//   });
// }

function getCurrentTime(timezone_symbol) {
  if (isset(timezone_symbol)) {
    var date = new Date();
    var localTime = date.getTime();
    var localOffsetFromUTC = date.getTimezoneOffset() * 60000;
    var UTC = localTime + localOffsetFromUTC;
    var timezoneOffset = getTimezoneOffsetFromSymbol(timezone_symbol);
    var result = UTC - (3600000 * timezoneOffset);

    return new Date(result);
  }
  else {
    return new Date();
  }
}

function getTimezone(timezone_symbol) {
  switch (timezone_symbol) {
    case 'EST':
      return "America/New_York";
      break;
    case 'CST':
      return "America/Chicago";
      break;
    case 'MST':
      return "America/Phoenix";
      break;
    case 'PST':
      return "America/Los_Angeles";
      break;
    case 'AKST':
      return "America/Anchorage";
      break;
    case 'HST':
      return "Pacific/Honolulu";
      break;
    default:
      return false;
  }
}

function getTimezoneOffsetFromSymbol(timezone_symbol) {
  switch (timezone_symbol) {
    case 'EST':
      return -5;//"America/New_York";
      break;
    case 'CST':
      return -6;//"America/Chicago";
      break;
    case 'MST':
      return -7;//"America/Phoenix";
      break;
    case 'PST':
      return -8;//"America/Los_Angeles";
      break;
    case 'AKST':
      return -9;//"America/Anchorage";
      break;
    case 'HST':
      return -10;//"Pacific/Honolulu";
      break;
    default:
      return 0;
  }
}

function dateConvertISO(dateString) {
  if (isset(dateString)) {
    var day = dateString.slice(0, 2);
    var month = dateString.slice(3, 5);
    var year = dateString.slice(6, 10);
    return dateString.replace(day + '/' + month + '/' + year, year + '-' + month + '-' + day);
  }
  else {
    return '';
  }
}

function getDay(dateString) {
  if (isset(dateString)) {
    var day = parseInt(dateString.slice(8, 10));
    return day;
  }
  else {
    return '';
  }
}

function getMonthString(dateString) {
  if (isset(dateString)) {
    var month = parseInt(dateString.slice(5, 7));
    switch (month) {
      case 1:
        return "JAN";
        break;
      case 2:
        return "FEB";
        break;
      case 3:
        return "MAR";
        break;
      case 4:
        return "APR";
        break;
      case 5:
        return "MAY";
        break;
      case 6:
        return "JUN";
        break;
      case 7:
        return "JUL";
        break;
      case 8:
        return "AUG";
        break;
      case 9:
        return "SEP";
        break;
      case 10:
        return "OCT";
        break;
      case 11:
        return "NOV";
        break;
      case 12:
        return "DEC";
        break;
      default:
        return "";
    }
  }
  else {
    return '';
  }
}

function dateConvertUS(dateString) {
  if (isset(dateString)) {
    var year = dateString.slice(0, 4);
    var month = dateString.slice(5, 7);
    var day = dateString.slice(8, 10);
    return dateString.replace(year + '-' + month + '-' + day, day + '/' + month + '/' + year).slice(0, 16);
  }
  else {
    return '';
  }
}

function getDateDiff(dateStringCurrent, dateStringPast) {
  var dateCurrent = new Date(dateStringCurrent.slice(0, 10));
  var datePast = new Date(dateStringPast.slice(0, 10));
  return Math.ceil((dateCurrent - datePast) / 86400000);
}

function getWeek(dateString) {
  if (isset(dateString)) {
    var weekArray = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    var date = new Date(dateString);
    return '(' + weekArray[date.getDay()] + ')';
  }
  else {
    return '';
  }
}

function getAge(day, month, year) {
  if (isset(day) && isset(month) && isset(year)) {
    const paddingZero = (num, digit) => ('0000' + num).slice(-1 * digit);

    const birth = new Date(year, month, day);
    const y2 = paddingZero(birth.getFullYear(), 4);
    const m2 = paddingZero(birth.getMonth(), 2);
    const d2 = paddingZero(birth.getDate(), 2);

    const today = new Date();
    const y1 = paddingZero(today.getFullYear(), 4);
    const m1 = paddingZero(today.getMonth() + 1, 2);
    const d1 = paddingZero(today.getDate(), 2);

    return Math.floor((Number(y1 + m1 + d1) - Number(y2 + m2 + d2)) / 10000)
  }
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
  var mile = km / 1.609344;

  return mile.toFixed(2);
}

function getStatusString(status,timezone,deadline,starttime,endtime) {
  if(status == 'abort'){
    return "<div style='color:#000080;font-weight:bold'>Aborted</div>"
  }
  else{
    var currenttime =  getCurrentTime(timezone);
    if(currenttime < deadline){
      return "<div style='color:#ff0080;font-weight:bold'>Now Accepting</div>";
    }
    else if(deadline <= currenttime && currenttime < starttime){
      return "<div style='color:#800000;font-weight:bold'>Booking Closed</div>";
    }
    else if(starttime <= currenttime && currenttime < endtime){
      return "<div style='color:#00ff00;font-weight:bold'>Being Held</div>";
    }
    else{
      return "<div style='color:#000080;font-weight:bold'>Closed</div>";
    }
  }
}

class Area {
  constructor(initLat, initLng, distance) {
    var deltaLat = this.calcLat(distance, 0);
    var deltaLng = this.calcLng(initLat, distance, 90);

    this.north = initLat + deltaLat;
    this.south = initLat - deltaLat;
    this.east = initLng + deltaLng;
    this.west = initLng - deltaLng;
  }

  calcLat(distance, deg) {
    const radius = 6378137;
    return distance * 360 / (2 * Math.PI * radius);
    // return distance * Math.cos(Math.PI/180 * deg) * 360/(2*Math.PI*radius);
  }

  calcLng(initLat, distance, deg) {
    const radius = 6378150;
    return distance * 360 / (2 * Math.PI * radius * Math.cos(Math.PI / 180 * initLat));
    // return distance * Math.sin(Math.PI/180 * deg) * 360/(2*Math.PI*radius * Math.cos(Math.PI/180 * initLat));
  }
}

//Drawer Control
class drawer {
  static open() {
    if (MOBILE) {
      $('#drawer').css({
        'width': '100vw',
      });
    }
    else if (TABLET) {
      $('#drawer').css({
        'width': '50vh',
      });
    }
    else {
      $('#drawer').css({
        'width': '60vh',
      });
    }
    $('#drawer').show();
    $("#drawer").animate({
      'left': $('body').width() - $("#drawer").width()
    }, 300);
    $("#overlay_drawer").css({
      'z-index': 1,
    });
    $("#overlay_drawer").animate({
      'filter': 'alpha(opacity=0.5)',
      '-moz-opacity': 0.5,
      'opacity': 0.5,
    }, 300);
    $('#drawer').trigger('open');
  }
  static close() {
    $("#drawer").animate({
      'left': $('body').width()
    }, 300);
    $("#overlay_drawer").css({
      'z-index': 0,
    });
    $("#overlay_drawer").animate({
      'filter': 'alpha(opacity=0)',
      '-moz-opacity': 0,
      'opacity': 0,
    }, 300);
    $('#drawer').trigger('close');
    // $('#drawer').hide();
  }
}

// $(document).off('click', "#overlay_drawer");
$(document).on('click', "#overlay_drawer", function (event) {
  drawer.close();
  $('#pac-input').val('');
});

$(document).on('click', "#drawer_close i", function (event) {
  drawer.close();
});

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

//Modal Control
class modal {
  static open() {
    if (MOBILE) {
      this.min_height = '90vw';
      this.width = '90vw';
    }
    else if (TABLET) {
      this.min_height = '30vh';
      this.width = '45vh';
    }
    else {
      this.min_height = '45vh';
      this.width = '68vh';
    }
    $("#modal").css({
      'height': '1vh',
    });
    $("#modal").animate({
      'width': this.width
    }, 100);
    $("#modal").animate({
      'min-height': this.min_height,
    }, 300);
    $("#overlay_modal").css({
      'z-index': 2,
    });
    $("#overlay_modal").animate({
      'filter': 'alpha(opacity=0.5)',
      '-moz-opacity': 0.5,
      'opacity': 0.5,
    }, 300);
    $('#modal').trigger('open');
  }
  static close() {
    $("#modal").animate({
      'width': '1vh',
    }, 100);
    $("#modal").animate({
      'width': 0,
      'min-height': 0,
    }, 300);
    $("#overlay_modal").css({
      'z-index': 0,
    });
    $("#overlay_modal").animate({
      'filter': 'alpha(opacity=0)',
      '-moz-opacity': 0,
      'opacity': 0,
    }, 300);
    $('#modal').trigger('close');
  }
}
// $(document).off('click', "#overlay_modal");
$(document).on('click', "#overlay_modal", function (event) {
  modal.close();
});

$(document).off('close', '#drawer');
$(document).on('close', '#drawer', function (event) {
  clearInterval(headline.changeimage);
  clearInterval(headline.countdown);

  SEARCH_POSITION = null;
  SEARCH_ZOOM = null;
  $('#search_container .form_area').show('slow');
  $('#search_container button').attr({ 'id': 'searchEvent' });
  $('#search_container button').text('Search');
});

function show(element) {
  $(element).css({
    '-moz-opacity': 0,
    'opacity': 0,
  });
  $(element).show();
  $(element).animate({
    '-moz-opacity': 100,
    'opacity': 100,
  }, 500);
}

function hide(element) {
  $(element).animate({
    '-moz-opacity': 0,
    'opacity': 0,
  }, 500);
  const promise = new Promise((resolve, reject) =>{
      $(element).hide();
      resolve(true);
  });
  promise.then(function(result) {
    $(element).css({
      '-moz-opacity': 100,
      'opacity': 100,
    });
  });
}