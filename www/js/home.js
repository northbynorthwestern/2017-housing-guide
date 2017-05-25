
var geojson;

var defaultStyle = {'weight': '0', fillColor: '#38235D', fillOpacity: '1'};
var perfectStyle = {'weight': '0', fillColor: '#199e8d', fillOpacity: '1'};
var mehStyle = {'weight': '.5', fillColor: '#e68c1a', fillOpacity: '.8', 'color' : '#e68c1a'};
var notStyle = {'weight': '0', fillColor: '#cd2a2b', fillOpacity: '.5'};
var highlightStyle = {'weight': 4, 'opacity': 0.8, 'color': 'white', 'dashArray': '', fillOpacity: 1 };

jsonLayers = []; // will store each json layer as it is added to map to change later


window.parseBoolean = function(string) {
  var bool;
  bool = (function() {
    switch (false) {
      case string.toLowerCase() !== 'true':
        return true;
      case string.toLowerCase() !== 'false':
        return false;
    }
  })();
  if (typeof bool === "boolean") {
    return bool;
  }
  return void 0;
};

L.mapbox.accessToken = 'pk.eyJ1IjoiZHVuZXIiLCJhIjoiaWkwMnJIZyJ9.2zMvIebbUOk9C5R2itT7Dg';

var map = L.mapbox.map('map', 'duner.m3npglde', {
minZoom: 14,
maxZoom: 18,
maxBounds: [
    [42.07095890994855, -87.65922546386719],
    [42.039094188385945, -87.69158363342285]
],
scrollWheelZoom: false
}).setView([42.05504447993239,-87.6753830909729], 15);
// L.tileLayer.provider('MapQuestOpen.OSM').addTo(map);
$.ajax({
url: 'js/shapes.json',
async: true,
dataType: 'jsonp',
jsonp: false,
jsonpCallback:'myCallback',
success:function(data) {
    parse_map_data(data);
}
});

function parse_map_data(data){
  $.each(data, function(key, val){
    if (val.properties.name !== 'Willard Residential College') {

        geojson = new L.GeoJSON(val, {
          onEachFeature: onEachFeature,
          style: function(feature) {
            return defaultStyle;
          }
        }).addTo(map);
        jsonLayers.push({name: val.properties.name, value: geojson}); // jsonLayers[].value.setStyle() to change style
      }
  });
}

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.name) {
        _.each(COPY.dorms, function(dorm) {
            if (dorm[0] === feature.properties.name) {
                var address = dorm[7];
                var headline = "<h4><a href='hall/" + dorm[2] + "'>" + dorm[1] + "</a></h4>";
                layer.bindPopup(headline + ' ' + address); //address
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight
                });
            }
        })
    }
}

function highlightFeature(e) { // Mouse on shape
    var layer = e.target;
    var name = layer.feature.properties.name;

    $('.dorm-name').each(function(i, elem) {
        if ($(elem).attr("value") === name) {
            $(elem).parent().parent().css("background-color", "#c3bccf");
        }

    });

    layer.setStyle(highlightStyle);
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}

function resetHighlight(e) { // Mouse out shape
    var layer = e.target;
    var name = e.target.feature.properties.name;

    $('.dorm-name').each(function(i, elem) {
        if ($(elem).attr("value") === name) {
            $(elem).parent().parent().css("background-color", "");

            var attrs = $(elem).attr("class").split(" ");
            if (attrs.length > 1) {
                var fit = attrs[1];
                if (fit === "bad-fit") {
                    layer.setStyle(notStyle);
                }
                else if (fit === "perfect-fit") {
                    layer.setStyle(perfectStyle);
                }
                else {
                    layer.setStyle(mehStyle);
                }
            } else {
                layer.setStyle(defaultStyle);
            }
        }
    });
}

function highlightTable(row) { // Mouse on table row
    var cell = $(row).children()[0];
    var graph = $(cell).children()[0];
    var htmlName = $(graph).attr("value");

    $(row).css("background-color", "#c3bccf");
    for (var i = 0; i < jsonLayers.length; i++) {
        if (jsonLayers[i].name == htmlName) {
            jsonLayers[i].value.setStyle(highlightStyle);
        }
    }
}

function resetHighlightTable(row) { // Mouse out table row
    var cell = $(row).children()[0];
    var graph = $(cell).children()[0];
    var htmlName = $(graph).attr("value");
    var attrs = $(graph).attr("class").split(" ");

    $(row).css("background-color", "");

    for (var i = 0; i < jsonLayers.length; i++) {
        if (jsonLayers[i].name == htmlName) {
            var layer = jsonLayers[i].value;
            jsonLayers[i].value.setStyle(defaultStyle);
            if (attrs.length > 1) {
                var fit = attrs[1];
                if (fit === "bad-fit") {
                    layer.setStyle(notStyle);
                }
                else if (fit === "perfect-fit") {
                    layer.setStyle(perfectStyle);
                }
                else {
                    layer.setStyle(mehStyle);
                }
            } else {
                layer.setStyle(defaultStyle);
            }
        }
    }
}

function changeMap(name, style) {
    $.each(jsonLayers, function(i, elem) {
        if (elem.name == name) elem.value.setStyle(style);
    })
}


// dorm data
var dorms = {};
var create_dorms = function() {
  _.each(COPY.dorms, function(dorm) {
      var name = dorm['name'];

      dorms[name] = {};

      if (dorm['dorm_type'] === 'Hall') {
          dorms[name]['reshall'] = true;
      }
      else {
          dorms[name]['reshall'] = false;
      }

      if (dorm['dorm_type'] === 'College') {
          dorms[name]['rescol'] = true;
      }
      else {
          dorms[name]['rescol'] = false;
      }

      if (dorm['dorm_type'] === 'Community') {
          dorms[name]['rescomm'] = true;
      }
      else {
          dorms[name]['rescomm'] = false;
      }

      if (dorm['campus_side'] === 'North') {
          dorms[name]['north'] = true;
          dorms[name]['south'] = false;
      }
      else {
          dorms[name]['north'] = false;
          dorms[name]['south'] = true;
      }

      if (dorm['size'] <= 100) {
          dorms[name]['small'] = true;
          dorms[name]['med'] = false;
          dorms[name]['large'] = false;
      }
      if (dorm['size'] > 100 && dorm['size'] <= 200) {
          dorms[name]['small'] = false;
          dorms[name]['med'] = true;
          dorms[name]['large'] = false;
      }
      if (dorm['size'] > 200) {
          dorms[name]['small'] = false;
          dorms[name]['med'] = false;
          dorms[name]['large'] = true;
      }

      dorms[name]['ac'] = parseBoolean(dorm['has_ac']);
      dorms[name]['dining'] = parseBoolean(dorm['dining']);
      dorms[name]['freshmen'] = parseBoolean(dorm['freshmen_only']);
      dorms[name]['female'] = parseBoolean(dorm['female_only']);
      dorms[name]['opengender'] = parseBoolean(dorm['open_gender']);
  });
  console.log(dorms);
};

// count true properties of an object
var count = function(obj, props) {
    var num = 0;
    for (var i in props) {
        if (obj[props[i]]) {
            num += 1;
        }
    }
    return num;
};

// sort table of dorms
var compareDorms = function(a, b) {
    return $(a).find('.dorm-name').text() < $(b).find('.dorm-name').text()? -1 : 1;
}
var sortTable = function() {
    // alphabetize
    var rows = $.makeArray($('tr:has(.dorm-name)').remove());
    rows.sort(compareDorms);
    $('tbody').append($(rows));
    $('.dorm-name.bad-fit').parent().parent().prependTo($('tbody'));
    $('.dorm-name.good-fit').parent().parent().prependTo($('tbody'));
    $('.dorm-name.perfect-fit').parent().parent().prependTo($('tbody'));
}

// interactive filtering
var selections = {};
var numCriteria = $('.filter').length;
var sideCriteria = ['north', 'south'];
var typeCriteria = ['rescol', 'rescomm', 'reshall'];
var sizeCriteria = ['small', 'med', 'large'];
var otherCriteria = ['ac', 'dining', 'female', 'freshmen', 'opengender'];

$('.filter').change(function() {

    console.log('CHANGIN');
    // update selections
    $('.filter').map(function(i, elem) {
        selections[$(elem).attr('id').split('-')[0]] = elem.checked;
    });

    var numSelected = Math.min(count(selections, sideCriteria), 1)
                        + Math.min(count(selections, typeCriteria), 1)
                        + Math.min(count(selections, sizeCriteria), 1)
                        + count(selections, otherCriteria);
    if (numSelected) {
        // at least one is selected; display filter criteria
        if (!$('.dorm-name').children('.dot').length) {
            // add dots
            $('.dorm-name').prepend('<div class="dot"></div>');
        }

        // update fits
        $('.dorm-name').removeClass('perfect-fit good-fit bad-fit');
        $('.dorm-name').each(function(i, elem) {
            var name = $(elem).data('fullname');
            // console.log(name);
            // console.log(dorms[name]);
            // name to match json
            var jsonName = $(elem).attr("value");

            // count number of criteria that match
            var matchCount = 0;
            for (var i in sideCriteria) {
                if (selections[sideCriteria[i]] && dorms[name][sideCriteria[i]]) {
                    matchCount += 1;
                    break;
                }
            }
            for (var i in typeCriteria) {
                if (selections[typeCriteria[i]] && dorms[name][typeCriteria[i]]) {
                    matchCount += 1;
                    break;
                }
            }
            for (var i in sizeCriteria) {
                if (selections[sizeCriteria[i]] && dorms[name][sizeCriteria[i]]) {
                    matchCount += 1;
                    break;
                }
            }

            for (var i in otherCriteria) {
                if (selections[otherCriteria[i]] && dorms[name][otherCriteria[i]]) {
                    matchCount += 1;
                }
            }

            // update dot colors
            if (matchCount == numSelected) {
                $(elem).addClass('perfect-fit');
                changeMap(jsonName, perfectStyle);
            } else if (matchCount > (.4 * numSelected)) {
                $(elem).addClass('good-fit');
                changeMap(jsonName, mehStyle);
            } else {
                $(elem).addClass('bad-fit');
                changeMap(jsonName, notStyle);
            }
        });

        // sort
        sortTable();
    } else {
        // nothing is selected; remove dots and exit
        clearFilter();
        return;
    }
});

// clear filter button
var clearFilter = function() {
    $('.filter').removeAttr('checked');
    $('.dorm-name').children('.dot').remove();
    $('.dorm-name').removeClass('perfect-fit good-fit bad-fit');
    sortTable();

    // clear the map
    $('.dorm-name').each(function(i, elem) {
        changeMap($(elem).attr("value"), defaultStyle);
    });
};
$('.clear-filter').click(clearFilter);

// clear filter on page load
clearFilter();
$(document).ready(function(){
  var dorms_array = [];
  _.each(COPY.dorms, function(dorm) {
      dorms_array.push("{{dorm}}");
  });
  create_dorms();

});
