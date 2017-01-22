(function() {
  let resolveFn;
  let GM;

  var readyPromise = new Promise((resolve, reject) => {
    resolveFn = resolve;
  });

  function initMap() {
    GM = google.maps;
    resolveFn();
    console.log(readyPromise);
  }

  function Map() {
    this._map = null;
    this._elem = document.getElementById('map');
    readyPromise.then(this.init.bind(this));
  }

  Map.prototype = {
    init: function() {
      this._map = new GM.Map(this._elem, {
        // should be center of coverage area here,
       center: { lat: -34.397, lng: 150.644 },
       zoom: 1,
      //  styles: [{
      //    featureType: "transit",
      //    stylers: [{
      //      visibility: "off"
      //    }],
      //  }],
      });
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
