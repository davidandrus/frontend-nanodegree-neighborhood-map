/**
 * Gets a list of countries from https://restcountries.eu/rest/v1/all
 * @return {Promise} the promise returned with when successful the array of countries
 */
function getCountries() {
  return fetch('https://restcountries.eu/rest/v1/all')
    .then(function(response) {
      return response.json();
    });
}

function uiViewModel() {
  var self = this;

  self.countries = ko.observableArray();
  self.loading = ko.observable(true);
  self.error = ko.observable(false);

  getCountries()
    .then(function(response) {
      self.loading(false);
      self.countries(response);
      console.log(self.countries())
    })
    .catch(function(e) {
      console.log('error yo', e);
      self.loading(false);
      self.error(true);
    });

}

ko.applyBindings(new uiViewModel());
