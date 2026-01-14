document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var statusDiv = document.getElementById('form-status');
  var scriptURL = form.getAttribute('data-script-url');
  var formLoadTime = Date.now();

  // Set timestamp when form loads
  var timestampField = document.getElementById('form-timestamp');
  if (timestampField) {
    timestampField.value = formLoadTime.toString();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!scriptURL) {
      statusDiv.textContent = 'Contactformulier is niet geconfigureerd.';
      statusDiv.className = 'error';
      return;
    }

    // Honeypot check - if filled, silently "succeed" (don't alert bots)
    var honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      statusDiv.textContent = 'Bedankt! Je bericht is succesvol ontvangen.';
      statusDiv.className = 'success';
      form.reset();
      return;
    }

    // Timing check - reject if submitted too quickly (< 3 seconds)
    var submitTime = Date.now();
    var elapsed = submitTime - formLoadTime;
    if (elapsed < 3000) {
      statusDiv.textContent = 'Bedankt! Je bericht is succesvol ontvangen.';
      statusDiv.className = 'success';
      form.reset();
      return;
    }

    var formData = new FormData(form);
    // Remove honeypot from submission
    formData.delete('website');
    statusDiv.textContent = 'Bezig met versturen...';
    statusDiv.className = 'sending';

    fetch(scriptURL, { method: 'POST', body: formData })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data && data.result === 'success') {
          statusDiv.textContent = 'Bedankt! Je bericht is succesvol ontvangen.';
          statusDiv.className = 'success';
          form.reset();
        } else {
          statusDiv.textContent = 'Oeps! Er is iets misgegaan. Probeer het later opnieuw.';
          statusDiv.className = 'error';
          console.error('Form error', data);
        }
      })
      .catch(function (err) {
        statusDiv.textContent = 'Oeps! Er is iets misgegaan. Probeer het later opnieuw.';
        statusDiv.className = 'error';
        console.error('Fetch error', err);
      });
  });
});
