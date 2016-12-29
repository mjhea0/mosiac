document.addEventListener('DOMContentLoaded', (event) => {
  'use strict';
  // ** event listener ** //
  document.getElementById('photo-upload').addEventListener(
    'change', handleImageUpload, false);      // jshint ignore:line
});
