Xandria — Local development notes

Contact form
- To embed a Google Form on `/contact`, set the following parameter in `hugo.toml`:

```toml
[params]
  googleFormEmbed = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true"
```

- The site will render that URL inside an iframe. If `params.googleFormEmbed` is not set, a simple fallback form
  (non-functional) will be displayed; you can wire that to Formspree, Netlify Forms, or your own endpoint.

- Note: Google Forms doesn't provide a built-in reCAPTCHA for embedded forms. For reCAPTCHA protection use a
  custom form and verify reCAPTCHA server-side (or use a form provider that supports reCAPTCHA).

Google Sheets + Google Apps Script setup
- Create a Google Sheet to collect submissions.
- Open the Script Editor (Extensions → Apps Script) and add a web app script that accepts POST requests and appends rows to the sheet. Deploy the script as a Web App (Execute as: Me, Who has access: Anyone).
- In your deployed web app, copy the `web app URL` and replace the `scriptURL` constant in `content/nl/contact.md` with that URL.

Minimal Apps Script example (server-side):
```javascript
function doPost(e) {
  try {
    // Get the secret from Script Properties (File -> Project properties -> Script properties)
    var SCRIPT_SECRET = PropertiesService.getScriptProperties().getProperty('SECRET');
    var data = e.parameter;

    // Check if the submitted secret matches the one in script properties
    if (data.secret !== SCRIPT_SECRET) {
      return ContentService.createTextOutput(JSON.stringify({result: 'error', error: 'Invalid secret'})).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.openById('YOUR_SHEET_ID');
    var sheet = ss.getSheetByName('Sheet1');
    sheet.appendRow([new Date(), data.voornaam, data.achternaam, data.email, data.telefoon, data.bericht]);
    return ContentService.createTextOutput(JSON.stringify({result: 'success'})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({result: 'error', error: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}
```

Security notes:
- **Set the secret in Apps Script:** Go to **File > Project properties > Script properties** and add a property named `SECRET` with the value `YOUR_SUPER_SECRET_KEY_HERE`. This keeps your secret out of version control.
- If you want to restrict access, deploy the Apps Script with appropriate permissions and consider adding a simple token check in `doPost` (e.g., require a secret parameter).
- For spam protection consider adding client-side reCAPTCHA and validating the token server-side in Apps Script.
