document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var statusDiv = document.getElementById('form-status');
  var scriptURL = form.getAttribute('data-script-url');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!scriptURL) {
      statusDiv.textContent = 'Contactformulier is niet geconfigureerd.';
      return;
    }

    var formData = new FormData(form);
    statusDiv.textContent = 'Bezig met versturen...';

    fetch(scriptURL, { method: 'POST', body: formData })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data && data.result === 'success') {
          statusDiv.textContent = 'Bedankt! Je bericht is succesvol ontvangen.';
          form.reset();
        } else {
          statusDiv.textContent = 'Oeps! Er is iets misgegaan. Probeer het later opnieuw.';
          console.error('Form error', data);
        }
      })
      .catch(function (err) {
        statusDiv.textContent = 'Oeps! Er is iets misgegaan. Probeer het later opnieuw.';
        console.error('Fetch error', err);
      });
  });
});
