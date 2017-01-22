(function(map) {

  function modifyResponse(response) {

    return _.map(response, function(item) {
      return _.extend({}, item, {
        flagUrl: '/flags/' +
          item.alpha2Code.toLowerCase() + '.svg',
        languages: item.languages.map(function(code) {
          return languages[code];
        }),
        currencies: item.currencies.map(function(code) {
          return currencies[code];
        })
      });

    });
  }

  function commaizeNumber(number) {
    return number.toLocaleString(number);
  }

  function commaizeArray(arr) {
    return arr.join(', ');
  }

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
      })
       .then(modifyResponse);
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
    self.selectedCountry = ko.observable(null);

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
            _.each(self.countries(), function(item) {
              map.addCountryPin(item, function() {
                self.setToCountry(item);
              });
            });
            map.fitPins();
          });
        })
        .catch(function() {
          self.countriesLoading(false);
          self.countriesError(true);
        });
    };

    ko.extenders.commaizeArray = function(target) {
      return target.join(',');
    };

    // handle filtering based on countries search input value
    self.filteredCountries = ko.computed(function() {
      var countries = self.countries();
      var countryFilter = _.trim(self.countryFilter());
      if (!countryFilter) { return countries; }

      var filteredCountries =  _.filter(countries, function(item) {
        return _.toUpper(item.name).indexOf(_.toUpper(countryFilter)) > -1;
      });

      map.updatePins(filteredCountries);

      return filteredCountries;
    });

    self.setToCountry = function(obj, e) {

      if (e) { e.preventDefault(); }

      self.selectedCountry(_.extend({}, obj, {
        languages: commaizeArray(obj.languages),
        currencies: commaizeArray(obj.currencies),
        timezones: commaizeArray(obj.timezones),
        population: commaizeNumber(obj.population),
        area: commaizeNumber(Math.round(obj.area * 0.621371)) + ' square miles',
      }));

      map.setCurrentMarker(obj.alpha2Code);
    };

    // do initial load of Countries
    self.loadCountries();
  }

  window.addEventListener('resize', function() {
    map.fitPins();
  });

  ko.applyBindings(new uiViewModel());

})(gMap);
