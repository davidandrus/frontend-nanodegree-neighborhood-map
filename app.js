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

function uiViewModel() {
  var self = this;

  self.countries = ko.observableArray();
  self.countriesLoading = ko.observable(false);
  self.countriesError = ko.observable(false);
  self.countryFilter = ko.observable('');

  self.loadCountries = function() {
    self.countriesLoading(true);
    self.countriesError(false);

    getCountries()
      .then(function(response) {
        self.countriesLoading(false);
        self.countries(response);
      })
      .catch(function() {
        self.countriesLoading(false);
        self.countriesError(true);
      });
  }

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
