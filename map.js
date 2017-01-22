(function() {
  let resolveFn;
  let GM;

  var readyPromise = new Promise((resolve, reject) => {
    resolveFn = resolve;
  });

  function initMap() {
    GM = google.maps;
    resolveFn();
  }

  function Map() {
    this._map = null;
    this._bounds = null;
    this._elem = document.getElementById('map');
    readyPromise.then(this.init.bind(this));
  }

  Map.prototype = {
    init: function() {
      this._bounds = new GM.LatLngBounds();
      this._map = new GM.Map(this._elem, {
        // should be center of coverage area here,
       center: { lat: -34.397, lng: 150.644 },
       zoom: 16,
       streetViewControl: false,
       mapTypeControl: false,
       styles: window.mapStyle,
      //  styles: [{
      //    featureType: "transit",
      //    stylers: [{
      //      visibility: "off"
      //    }],
      //  }],
      });
    },
    addCountryPin(obj) {
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
        animation: GM.Animation.DROP,
        //label: name,
        title: obj.name
      });

      this._bounds.extend(position);
      // marker.addListener('click', () => {
      //   map.setCenter(marker.getPosition());
      //   // set active stop icon
      //
      //   clickListener(id);
      // });
    },
    fitPins: function() {
      this._map.fitBounds(this._bounds);
    },
    ready: readyPromise,
  }


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
  //
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

})(window)
