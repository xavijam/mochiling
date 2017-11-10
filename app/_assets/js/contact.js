var $ = require('jquery');
var SimpleBar = require('SimpleBar');
var DefaultMapView = require('./components/default-map-view');
var ResponsiveHeaderHelper = require('./components/responsive-header');
var CookiesView = require('./components/cookies-view');
var ContactFormView = require('./contact/contact-form-view');

$(function () {
  ResponsiveHeaderHelper($('.js-canvas'));
  new CookiesView({
    el: $('.js-cookies')
  }).render();

  var defaultMap = new DefaultMapView({
    el: $('#js-map')
  }).render();

  var contactFormView = new ContactFormView({
    el: $('.js-form'),
    buttonStates: window.buttonStates
  }).render();

  if ($('.js-itemsList').length > 0) {
    new SimpleBar($('.js-itemsList')[0]); 
  }
});