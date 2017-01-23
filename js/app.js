(function(map) {
  'use strict';

  /**
   * Modifies the restcountries API response to add things like languages, currencies and flag
   * flags derived from the alpha2Code, languages and currencies are changed from
   * their ISO shorthand keys to their full names which are made available through other js files.
   * @param  {Object[]} response  The collection of country objects
   * @return {Object[]} the collection of country objects with extra props
   */
  function modifyResponse(response) {
    return _.map(response, function(item) {
      return _.extend({}, item, {
        flagUrl: 'img/flags/' +
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

  /**
   * returns an raw number and adds commas
   * @param  {number} number the number to commaize
   * @return {string} the nubmer with commas added
   */
  function commaizeNumber(number) {
    return number.toLocaleString(number);
  }

  /**
   * takes an array and joins with commas to return the string for template consumption
   * @param  {Object[]} arr the array to join
   * @return {string} the string with commas between the array members
   */
  function commaizeArray(arr) {
    return arr.join(', ');
  }

  /**
   * Gets a list of countries from https://restcountries.eu/rest/v1/all
   * @return {Promise} the promise returned with when successful the array of countries
   */
  function getCountries() {
    return fetch('//restcountries.eu/rest/v1/all')
      .then(function(response) {
        return response.json();
      })
      .then(modifyResponse);
  }

  /**
   * The ViewModel for the UI
   * @constructor
   */
  function UiViewModel() {
    var self = this;

    // the collection of country objects
    self.countries = ko.observableArray();

    // whether the countries have loaded or are being fetched
    self.countriesLoading = ko.observable(false);

    /**
     * occurs when there is an error in the fetch call -
     * shouldn't happen since there is backup json in the case of failure
     */
    self.countriesError = ko.observable(false);

    // holds the value from the filter input
    self.countryFilter = ko.observable('');

    // the selected country either from clicking sidebar link or map pin
    self.selectedCountry = ko.observable(null);

    // the current view can be one of 'map', 'infoPanel', or 'nav'
    self.view = ko.observable('map');

    /**
     * gets countries and loads into UI then and sets loading and
     * error states accordingly when in flight
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

            // add all the country pins;
            _.each(self.countries(), function(item) {
              map.addCountryPin(item, function() {
                self.setToCountry(item);
              });
            });

            map.fitPins();
          });
        })
        // if there is a reason for some reason show it
        .catch(function() {
          self.countriesLoading(false);
          self.countriesError(true);
        });
    };

    /**
     * sets the filteredCountries based on the value of the countryFilter
     * is either the whole list or a partial list filtered by partial stirng
     * match of the country name
     * @return {undefined}
     */
    self.filteredCountries = ko.computed(function() {
      var countries = self.countries();
      var countryFilter = _.trim(self.countryFilter());
      var filteredCountries;

      if (countryFilter === '') {
        // if countryFilter is empty return them all
        filteredCountries = countries;
      } else {
        /**
         * get list of countries filtered by comparing
         * countryFilter to country.name
         */
        filteredCountries =  _.filter(countries, function(item) {
          return _.toUpper(item.name).indexOf(_.toUpper(countryFilter)) > -1;
        });
      }

      /**
       * make sure map pins are also filtered and
       * map is adjusted to fit their bounds
       */
      map.updatePins(filteredCountries);
      map.fitPins();

      return filteredCountries;
    });

    /**
     * Set the selectedCountry, by either a
     * click of the sidebar or a click of a map pin
     * @param {Object} obj the country object from the restcountries api
     * @param {Event} e [description]
     * @return {undefined}
     */
    self.setToCountry = function(obj, e) {

      if (e) { e.preventDefault(); }

      // @NOTE - this is probably not the way to achieve temeplate formatters
      self.selectedCountry(_.extend({}, obj, {
        languages: commaizeArray(obj.languages),
        currencies: commaizeArray(obj.currencies),
        timezones: commaizeArray(obj.timezones),
        population: commaizeNumber(obj.population),
        area: commaizeNumber(Math.round(obj.area * 0.621371)) + ' square miles',
      }));

      // set map
      map.setCurrentMarker(obj.alpha2Code);
      self.view('');
    };

    /**
     * set the view of the UI
     * @param {string} view can be one of nav, map, or infoPanel
     */
    self.setView = function(view) {
      self.view(view);
    };

    /**
     * toggle the UI view, if is currently the same view as trying to set,
     * will unset the view to empty
     * @param {string} view can be one of nav, map, or infoPanel
     */
    self.toggleView = function(view) {
      self.view(self.view() === view ? '' : view);
    };

    // do initial load of Countries right away
    self.loadCountries();
  }

  window.addEventListener('resize', function() {
    map.fitPins();
  });

  ko.applyBindings(new UiViewModel());

})(gMap);
