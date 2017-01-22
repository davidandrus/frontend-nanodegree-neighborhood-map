function uiViewModel() {

  this.countries = ko.observableArray([
    { name: 'United States' },
    { name: 'Canada' }
  ]);
}

ko.applyBindings(new uiViewModel());
