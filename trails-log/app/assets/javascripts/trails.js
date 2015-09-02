$(document).on("ready", function() {
  L.mapbox.accessToken = 'pk.eyJ1IjoidGlzZGVyZWsiLCJhIjoiNDQ5Y2JiODdiZDZmODM0OWI0NmRiNDI5OGQzZWE4ZWIifQ.rVJW4H9TC1cknmRYoZE78w';

  var map = L.mapbox.map('user-map', 'mapbox.run-bike-hike')
    .addControl(L.mapbox.geocoderControl('mapbox.places'))
    .setView([37.7833, -122.4167]);

  var userTrailsLayer = getUserTrails(map).addTo(map);
  var allHikersLayer = allHikersTrails(map);
  var drawLayer = L.featureGroup().addTo(map);
  var drawControl = new L.Control.Draw({edit: {featureGroup: drawLayer}})


  userTrailsLayer.on("ready", function(event) {
    map.fitBounds(userTrailsLayer.getBounds());

    // Hovering on the trail in the navbar opens pop up
    var hoveredTrailId;
    $("[id^='trail']").on('mouseenter', function(event){
      hoveredTrailId = $(this).attr('id').slice(-1)
      userTrailsLayer.eachLayer(function(marker) {
        if (marker.feature.properties.id == hoveredTrailId){
          marker.openPopup();
        }
      })
    });

    $("[id^='trail']").on('mouseleave', function(event){
      userTrailsLayer.eachLayer(function(marker) {
        if (marker.feature.properties.id == hoveredTrailId){
          marker.closePopup();
        }
      });

    });
  });

  // Show hike page from both my trails list and hikers' trails list
 $('.navbar').on('click', "[id^='trail']", function(event){
      event.preventDefault();
      var clickedHikeId = $(this).attr('id').slice(-1)
      var urlVal = $(this).attr('href')
      $.ajax(urlVal).done(function(hikeInfo){
        $('.navbar').children().hide()
        $('.navbar').prepend(hikeInfo)
        userTrailsLayer.eachLayer(function(marker){
          if (marker.feature.properties.id == clickedHikeId){
             map.setView(marker._latlng, 15);
          }
        })
      })
    });

  // Return to main menu
  $('.back-button').on('click', function(event){
    event.preventDefault();
    console.log("back button working")
    // window.location = currentUser["id"]
    $('.navbar').children().addClass('hideMenu');
    $('.main-menu').removeClass('hideMenu');
    //REFACTORED ALERT: Andrew removed add and save trailhead buttons here
    $('.leaflet-draw').hide()
    map.addLayer(userTrailsLayer)
    map.removeLayer(allHikersLayer);
  });

  // Show the my trails menu
  $('#my-trails').on('click', function(event){
    event.preventDefault();
    var urlVal = $('#my-trails a').attr('href')
    var typeVal = 'GET'
    $.ajax({
      url: urlVal,
      type: typeVal,
      dataType: 'json'
    }).done(function(response) {
      console.log(response)
      console.log('Yay! request went through')
      $('.main-menu').addClass('hideMenu');
      $('.my-hikes-menu').removeClass('hideMenu');
      //$('.navbar').children().hide()
      $('.navbar').prepend(response)
    }).fail(function(response){
      console.log(response)
      console.log('request did not go through');
    })
    map.addLayer(userTrailsLayer);
  });

  // ALL HIKERS

  // Show all-hikers menu
  $('#all-hikers').on('click', function(event) {
    event.preventDefault();
    $('.main-menu').addClass('hideMenu');
    $('.all-hikers-menu').removeClass('hideMenu');
    allHikersLayer.addTo(map)
    allHikersLayerBehavior();
  });

  var allHikersLayerBehavior = function() {
    map.fitBounds(allHikersLayer.getBounds());
    // Hover user's nav item to highlight their markers
    var hoveredUserId;
    $("[id^='hiker']").on('mouseenter', function(e){
      var hoveredUserId = $(this).attr('id').slice(-1)
      allHikersLayer.eachLayer(function(marker) {
        if (marker.feature.properties.user == hoveredUserId){
          marker.openPopup();
        }
      })
    });

    $("[id^='hiker']").on('mouseleave', function(e){
      userTrailsLayer.eachLayer(function(marker) {
        if (marker.feature.properties.user === hoveredUserId){
          marker.closePopup();
        }
      })
    });
  };

  var otherHikerListener = (function() {
    $(".other-hiker").on('click', function(event) {
      event.preventDefault();
      var urlVal = $(this).attr('href')
      $.ajax(urlVal)
      .done(function(response){
        $('.navbar').children().hide()
        $('.navbar').prepend(response)
      })
      .fail(function(response){
        console.log("The request failed.")
      })
    })
  })()

    var directionsLayer;
// LOG HIKE
  //START LOG HIKE ON CLICK
  $('#log-hike').on('click', function(event) {
    event.preventDefault();
    $('.main-menu').addClass('hideMenu');
    $('.log-hike-menu').removeClass('hideMenu');
    map.removeLayer(userTrailsLayer)
    var addPathCreator = function(){
      directions = L.mapbox.directions({profile: 'mapbox.walking'});
      directionsLayer = L.mapbox.directions.layer(directions)
          .addTo(map);
      var directionsInputControl = L.mapbox.directions.inputControl('inputs', directions)
          .addTo(map);
      var directionsRoutesControl = L.mapbox.directions.routesControl('routes', directions)
          .addTo(map);
    }
    addPathCreator();
      $('#mapbox-directions-origin-input').hide();
      $('#mapbox-directions-destination-input').hide();
      $('#routes').hide();
      $('.mapbox-form-label').hide();


  }); // END LOG HIKE ON CLICK

  //START SUBMIT NEW HIKE
  $('.navbar').on("submit", '#new-trail-form', function(event){
    event.preventDefault();
      //var urlVal = $(this).attr('action')
      var userId = $('#user_trails_user_id').attr('value')
      var urlVal = '/users/' + userId + '/trails'
      var typeVal = $(this).attr('method')
      var fullPath = directions.query()
      var waypointString = "";
      for (var i = 0;i < fullPath["_waypoints"].length;i++){
        var wayPoint = fullPath["_waypoints"][i]["geometry"]["coordinates"]
        var waypointLons = wayPoint[0]
        var waypointLats = wayPoint[1]
        waypointString += waypointLons+","+waypointLats+";"
      }
      waypointString = waypointString.substring(0, waypointString.length - 1);
      var trailEndLat = fullPath["destination"]["geometry"]["coordinates"][1]
      $('#user_trails_trailend_lat').val(trailEndLat)
      var trailEndLon = fullPath["destination"]["geometry"]["coordinates"][0]
      $('#user_trails_trailend_lon').val(trailEndLon)
      var trailHeadLat = fullPath["origin"]["geometry"]["coordinates"][1]
      $('#user_trails_trailhead_lat').val(trailHeadLat)
      var trailHeadLon = fullPath["origin"]["geometry"]["coordinates"][0]
      $('#user_trails_trailhead_lon').val(trailHeadLon)
      var waypointPlusLonLat = trailHeadLon+","+trailHeadLat +";" + waypointString +  ";"+trailEndLon+","+trailEndLat
      $('#user_trails_waypoints').val(waypointPlusLonLat)
      console.log(waypointPlusLonLat)

    $.ajax({
        url: urlVal,
        type: typeVal,
        data: $('#new-trail-form').serialize()
      }).done(function(response) {
        console.log(response)
        console.log('Yay! request went through')
        $('.navbar').children().hide()
        $('.navbar').prepend(response)
        //remove the draw layer
        map.removeLayer(directionsLayer);
        //place the new Trail layer
        var trailId = $('.trail-id').text()
        var currentTrail;
        $.ajax({
            url: '/the_current_trail_path/' + trailId,
            method: "GET",
            dataType: "JSON"
        }).done(function(serverResponse){
          currentTrail = serverResponse;
          renderTrail(currentTrail, map);
          }).fail(function(){
            console.log('fail')
          })
        }).fail(function(response){
          console.log(response)
          console.log('request did not go through');
        });
  });
  //END SUBMIT NEW HIKE
}); // END DOCUMENT READY


  //Make an AJAX call for the current_user
  var currentUser;
   $.ajax({
     url: '/the_current_user',
     method: "GET",
     dataType: "JSON"
   }).done(function(user){
      currentUser = user;
   });


  var getUserTrails = function(map) {
    var currentUserId = currentUser.id
    var userTrailsLayer = L.mapbox.featureLayer()
    .loadURL("http://localhost:3000/users/" + currentUserId + "/trails.json")
    return userTrailsLayer
  };

//Not currently in use
  var getLastTrail = function(currentTrailId) {
    //var currentUserId = currentUser.id
    var currentTrail;
      $.ajax({
        url: '/the_current_trail_path/' + currentTrailId,
        method: "GET",
        dataType: "JSON"
      }).done(function(serverResponse){
        console.log(serverResponse)
        currentTrail = serverResponse;
        return currentTrail
        }).fail(function(){
          console.log('fail')
        })
  }

  var renderTrail = function(trail, map) {
    var pathCoordinates = trail["routes"][0]["geometry"]["coordinates"]
    console.log(pathCoordinates)
    for (var i = 0; i < pathCoordinates.length; i++){
      pathCoordinates[i] = pathCoordinates[i].reverse()
    }
    console.log(pathCoordinates)
    var polyline = L.polyline(pathCoordinates).addTo(map)
    map.fitBounds(polyline.getBounds());
  }

  var allHikersTrails = function(map) {
    var allHikersLayer = L.mapbox.featureLayer().loadURL("http://localhost:3000/trails.json")
      return allHikersLayer
  }

  var removeAllLayers = function(map) {
    map.removeLayer(userTrailsLayer);
    map.removeLayer(allHikersLayer);
    map.removeLayer(drawControl);
  };

