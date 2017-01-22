(function() {
  var resolveFn;
  var GM;

  var readyPromise = new Promise(function(resolve, reject) {
    resolveFn = resolve;
  });

  function initMap() {
    GM = google.maps;
    resolveFn();
  }

  function Map() {
    this._map = null;
    this._bounds = null;
    this._baseIcon = '//maps.google.com/mapfiles/ms/icons/red-dot.png';
    this._clickedIcon = '//maps.google.com/mapfiles/ms/icons/green-dot.png';
    this._markers = {};
    this._countries = {};
    this._elem = document.getElementById('map');
    readyPromise.then(this.init.bind(this));
  }

  Map.prototype = {
    init: function() {
      var self = this;
      self._bounds = new GM.LatLngBounds();
      self._map = new GM.Map(self._elem, {
        // should be center of coverage area here,
        center: { lat: 0, lng: 0 },
        zoom: 1,
        streetViewControl: false,
        mapTypeControl: false,
        styles: window.mapStyle,
      });

    },
    setCurrentMarker: function(id) {
      var self = this;
      _.each(this._markers, function(item, key) {
        var currentObj = self._countries[key];
        var currentMarker = self._markers[key];


        if (currentObj.alpha2Code === id) {
          var geocoder = new GM.Geocoder();
          geocoder.geocode({
            componentRestrictions: {
              country: id
            },
          }, function(results, status) {
            var bounds;
            if (status == GM.GeocoderStatus.OK) {
              bounds = results[0].geometry.viewport;
              bounds.extend(currentMarker.getPosition());
              self._map.setCenter(results[0].geometry.location);
              self._map.fitBounds(bounds);
            }
          });
          currentMarker.setZIndex(GM.Marker.MAX_ZINDEX + 1);
          currentMarker.setIcon(self._clickedIcon);
          currentMarker.setAnimation(google.maps.Animation.BOUNCE);
        } else {
          currentMarker.setIcon(self._baseIcon);
          currentMarker.setAnimation(null);
        }
      });
    },
    addCountryPin: function(obj, listener) {
      var self = this;
      // prevent error where one country without latng values throws
      if (obj.latlng.length !== 2) { return; }
      var position = {
        lat: obj.latlng[0],
        lng: obj.latlng[1]
      };
      var marker = new GM.Marker({
        // icon: {
        //   url: '/flags/' + obj.alpha2Code.toLowerCase() + '.svg',
        //   size: new GM.Size(20, 15),
        //   origin: new GM.Point(0, 0)
        // },
        map: this._map,
        position: position,
        //label: name,
        title: obj.name,
        icon: this._baseIcon
      });

      this._markers[obj.alpha2Code] = marker;
      this._countries[obj.alpha2Code] = obj;

      this._bounds.extend(position);
      marker.addListener('click', function() {
        self.setCurrentMarker(obj.alpha2Code);
        listener(obj);
      });
    },
    /**
     * hides any filtered out pins while keeping the matching pins
     * @param  {Array} items the collection of items
     * @return {Undefined}
     */
    updatePins: function(items) {
      var visibleIds = _.map(items, function(item) {
        return item.alpha2Code;
      });

      _.each(this._markers, function(marker, key) {
        marker.setVisible(_.includes(visibleIds, key));
      });
      // _.each(this._markers, function(item, key) {
      //
      // });
    },
    fitPins: function() {
      var self = this;
      this.ready.then(function() {
        self._map.fitBounds(self._bounds);
      });
    },
    ready: readyPromise,
  };


  // window.initMap = function() {
  //   // GM = google.maps;
  //   // resolveFn();
  //   alert('initting');
  // }
  //
  // class Map {
  //
  //   init(elem) {
  //     this._map = new GM.Map(elem, {
  //       // should be center of coverage area here,
  //      center: { lat: -34.397, lng: 150.644 },
  //      zoom: 16,
  //      styles: [{
  //        featureType: "transit",
  //        stylers: [{
  //          visibility: "off"
  //        }],
  //      }],
  //     });
  //   }
  //results[0].geometry.viewport
  //   setBusStops(stops, clickListener) {
  //     const map = this._map;
  //     stops.forEach(({ lat, lon, name, id }) => {
  //       const position = {
  //         lat,
  //         lng: lon
  //       };
  //       const marker = new GM.Marker({
  //         map,
  //         position,
  //         animation: GM.Animation.DROP,
  //         //label: name,
  //         title: name,
  //       });
  //
  //       marker.addListener('click', () => {
  //         map.setCenter(marker.getPosition());
  //         // set active stop icon
  //
  //         clickListener(id);
  //       });
  //     });
  //   }
  //
  //   setMyPosition(loc) {
  //     const map = this._map;
  //     const marker = new GM.Marker({
  //       map,
  //       position: loc,
  //       title: 'Me'
  //     });
  //
  //     map.setCenter(loc);
  //   }
  // }
  //
  // // export default new Map();
  // //

  window.gMap = new Map();
  window.initMap = initMap;

})(window);
