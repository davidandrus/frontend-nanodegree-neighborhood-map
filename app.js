(function(map) {

  console.log(map);

  /**
   * Gets a list of countries from https://restcountries.eu/rest/v1/all
   * @return {Promise} the promise returned with when successful the array of countries
   */
  function getCountries() {
    return fetch('https://restcountries.eu/rest/v1/all')
      // if the api is down return the local copy
      .catch(function(response) {
        return fetch('/allCountries.bu.json');
      })
      .then(function(response) {
        return response.json();
      });
  }

  function initMap() {

  }

  /**
   * The ViewModel for the UI
   * @return {undefined}
   */
  function uiViewModel() {
    var self = this;

    self.countries = ko.observableArray();
    self.countriesLoading = ko.observable(false);
    self.countriesError = ko.observable(false);
    self.countryFilter = ko.observable('');

    /**
     * gets countries and loads into UI then sets loading and error states accordingly
     * @return {undefined}
     */
    self.loadCountries = function() {
      self.countriesLoading(true);
      self.countriesError(false);

      getCountries()
        .then(function(response) {
          self.countriesLoading(false);
          self.countries(response);

          map.ready.then(function() {
            console.log(self.countries());
            self.countries().forEach(function(item) {
              map.addCountryPin(item)
            });
            map.fitPins();
          })
        })
        .catch(function() {
          self.countriesLoading(false);
          self.countriesError(true);
        });
    }

    // handle filtering based on countries search input value
    self.filteredCountries = ko.computed(function() {
      if (!self.countryFilter()) {
        return self.countries();
      }
      return self.countries().filter(function(item) {
        return item.name.toUpperCase().indexOf(self.countryFilter().toUpperCase()) > -1;
      })
    });

    // do initial load of Countries
    self.loadCountries();
  }

  ko.applyBindings(new uiViewModel());

})(gMap)
