(function() {
  'use strict';

  var resolveFn;
  var GM;

  /**
   * create a promise to resolve when the callback
   * function (initMap) called by google maps API
   */
  var readyPromise = new Promise(function(resolve, reject) {
    resolveFn = resolve;
  });

  // the google maps callback
  function initMap() {
    GM = google.maps;
    resolveFn();
  }

  function mapErrorCallBack() {
    alert('there was an issue loading google maps');
  }

  /**
   * the global map object
   * @contructor
   */
  function Map() {
    this._map = null;
    this._bounds = null;
    this._baseIcon = 'img/blue-dot.png';
    this._clickedIcon = 'img/orange-dot.png';
    this._markers = {};
    this._countries = {};
    this._elem = document.getElementById('map');

    // run init when google callback occurs
    readyPromise.then(this.init.bind(this));
  }

  Map.prototype = {
    /**
     * initialize anything that requires the google maps api to be ready
     * @return {undefined}
     */
    init: function() {
      var self = this;
      self._bounds = new GM.LatLngBounds();
      self._map = new GM.Map(self._elem, {
        center: { lat: 0, lng: 0 },
        streetViewControl: false,
        mapTypeControl: false,
        styles: window.mapStyle,
        zoom: 1,
      });
    },
    /**
     * set the currentMarker, the one to highlight and center to
     * also unsets any previously highlighted markers
     * @param {string} id the alpha2code from the restcountries
     *                    api to set the current marker for
     */
    setCurrentMarker: function(id) {
      var self = this;

      // loop through all markers
      _.each(this._markers, function(item, key) {
        var currentObj = self._countries[key];
        var currentMarker = self._markers[key];

        // if is marker for highlighting
        if (currentObj.alpha2Code === id) {

          self.fitToCountry(id);

          // set highlight stye and zIndex
          currentMarker.setZIndex(GM.Marker.MAX_ZINDEX + 1);
          currentMarker.setIcon(self._clickedIcon);
          currentMarker.setAnimation(google.maps.Animation.BOUNCE);
        } else {
          // is not highlighted, so make sure is in a non-highlighted state
          currentMarker.setIcon(self._baseIcon);
          currentMarker.setAnimation(null);
        }
      });
    },
    /**
     * Add a country pin, usually only done one when
     * restcountries api returns results
     * @param {Object} obj  the country object returned from the restcountries API
     * @param {function} listener the callback to call when the pin is clicked
     */
    addCountryPin: function(obj, listener) {
      var self = this;
      // prevent error where one country without latng values throws
      if (obj.latlng.length !== 2) { return; }

      var position = {
        lat: obj.latlng[0],
        lng: obj.latlng[1]
      };

      var marker = new GM.Marker({
        map: self._map,
        position: position,
        title: obj.name,
        icon: self._baseIcon
      });

      // add to instance so can be accessed from other methods
      self._markers[obj.alpha2Code] = marker;
      self._countries[obj.alpha2Code] = obj;

      // extend the bounds so can be used by fitPins()
      self._bounds.extend(position);

      // add click listener
      marker.addListener('click', function() {
        self.setCurrentMarker(obj.alpha2Code);
        listener(obj);
      });
    },
    /**
     * hides any filtered out pins while keeping the matching pins
     * @param  {Object[]} items the collection of FILTERED country
     *                          items from restcountries API
     * @return {undefined}
     */
    updatePins: function(items) {
      var self = this;
      this.ready.then(function(){

        // flatten to shape of ['US', 'CO', ...];
        var visibleIds = _.map(items, function(item) {
          return item.alpha2Code;
        });

        // create new bounds since we will be updating visiblity
        var bounds = new GM.LatLngBounds();

        /**
         * loop through instance markers, if is in the visible
         * set make visible, otherwise hide
         */
        _.each(self._markers, function(marker, key) {
          var isVisible = _.includes(visibleIds, key);
          marker.setVisible(isVisible);

          // extend bounds when visible
          if (isVisible) {
            bounds.extend(marker.position);
          }
        });

        if (visibleIds.length > 1) {
          // set to fit filtered set
          self.fitPins(bounds);
        } else if (visibleIds.length === 1) {
          // fit to country otherwise will zoom in too much
          self.fitToCountry(visibleIds[0]);
        }
      });
    },
    /**
     * Fit the country into the viewport window
     * @param  {string} id the alpha2code for the country from the restcountries API
     * @return {undefined}
     */
    fitToCountry: function(id) {
      var self = this;
      // center map and zoom map to fit the whole country in window
      var geocoder = new GM.Geocoder();
      geocoder.geocode({
        componentRestrictions: {
          country: id
        },
      }, function(results, status) {
        var bounds;
        if (status == GM.GeocoderStatus.OK) {
          bounds = results[0].geometry.viewport;
          bounds.extend(self._markers[id].getPosition());
          self._map.setCenter(results[0].geometry.location);
          self._map.fitBounds(bounds);
        } else {
          alert('Unable to obain gecoder data for ' +  self._countries[id].name);
        }
      });
    },
    /**
     * update the map to fit all of the visible pins
     * @return {undefined}
     */
    fitPins: function(bounds) {
      var self = this;
      this.ready.then(function() {
        self._map.fitBounds(bounds || self._bounds);
      });
    },
    ready: readyPromise,
  };

  // expose gMap and initMap as globals
  window.gMap = new Map();
  window.initMap = initMap;
  window.mapErrorCallBack = mapErrorCallBack;

})(window);
