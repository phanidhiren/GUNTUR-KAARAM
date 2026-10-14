/* =========================================================
   ajax.js – Fetch API programs (Weeks 8, 9 and 10)
   ========================================================= */

// Week 8: load plain text asynchronously
function loadText() {
  var output = document.getElementById('specials');
  output.innerHTML = '<p class="loading">Loading today\'s specials…</p>';
  fetch('data/menuinfo.txt')
    .then(function (response) { return response.text(); })
    .then(function (data) {
      var lines = data.trim().split('\n');
      var html = '<p class="specials-title">' + escapeHtml(lines[0]) + '</p><ol>';
      for (var i = 2; i < lines.length - 1; i++) {
        var text = lines[i].replace(/^\d+\.\s*/, '');
        var parts = text.split(' - ');
        html += '<li><span>' + escapeHtml(parts[0]) + '</span><b>' + escapeHtml(parts[1] || '') + '</b></li>';
      }
      html += '</ol><p class="specials-note">' + escapeHtml(lines[lines.length - 1]) + '</p>';
      output.innerHTML = html;
    })
    .catch(function () { output.innerHTML = serverHint(); });
}

// Week 9 (a): load and parse JSON
function loadJSON() {
  setOutput('<p class="loading">Loading menu.json…</p>');
  fetch('data/menu.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var rows = data.map(function (d) {
        return [d.id, d.name, d.category, d.spice, '₹' + d.price];
      });
      setOutput(table('menu.json · ' + data.length + ' dishes', ['#', 'Dish', 'Category', 'Spice', 'Price'], rows));
    })
    .catch(function () { setOutput(serverHint()); });
}

// Week 9 (b): load XML and read it with DOMParser
function loadXML() {
  setOutput('<p class="loading">Loading menu.xml…</p>');
  fetch('data/menu.xml')
    .then(function (res) { return res.text(); })
    .then(function (str) { return new DOMParser().parseFromString(str, 'text/xml'); })
    .then(function (xml) {
      var items = xml.getElementsByTagName('item');
      var rows = [];
      for (var i = 0; i < items.length; i++) {
        rows.push([
          items[i].getAttribute('id'),
          items[i].getElementsByTagName('name')[0].textContent,
          items[i].getElementsByTagName('category')[0].textContent,
          items[i].getAttribute('type') === 'veg' ? 'Veg' : 'Non-veg',
          '₹' + items[i].getElementsByTagName('price')[0].textContent
        ]);
      }
      setOutput(table('menu.xml · ' + items.length + ' <item> elements', ['id', 'name', 'category', 'type', 'price'], rows));
    })
    .catch(function () { setOutput(serverHint()); });
}

// Week 10: send feedback to a server using the POST method
function submitData(event) {
  event.preventDefault();
  var form = document.getElementById('feedbackForm');
  var result = document.getElementById('feedbackResult');

  var payload = {
    name: document.getElementById('fbName').value.trim(),
    email: document.getElementById('fbEmail').value.trim(),
    rating: document.getElementById('fbRating').value,
    message: document.getElementById('fbMessage').value.trim()
  };

  if (payload.name === '' || payload.email === '' || payload.message === '') {
    result.innerHTML = '<p class="error">Please fill in your name, email and message.</p>';
    return false;
  }

  result.innerHTML = '<p class="loading">Sending…</p>';
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      result.innerHTML = '<p class="success">Thank you, ' + escapeHtml(data.name) +
        '! Your feedback was received (reference #' + data.id + ').</p>' +
        '<pre>' + escapeHtml(JSON.stringify(data, null, 2)) + '</pre>';
      form.reset();
    })
    .catch(function () {
      result.innerHTML = '<p class="error">Could not reach the server. Check your internet connection and try again.</p>';
    });
  return false;
}

// ---------- helpers ----------
function setOutput(html) {
  document.getElementById('output').innerHTML = html;
}

function table(caption, head, rows) {
  var html = '<table class="data-table"><caption>' + escapeHtml(caption) + '</caption><thead><tr>';
  head.forEach(function (h) { html += '<th>' + escapeHtml(h) + '</th>'; });
  html += '</tr></thead><tbody>';
  rows.forEach(function (r) {
    html += '<tr>' + r.map(function (c) { return '<td>' + escapeHtml(c) + '</td>'; }).join('') + '</tr>';
  });
  return html + '</tbody></table>';
}

function serverHint() {
  return '<p class="error">The browser blocked this request because the page was opened as a file. ' +
         'Open the project with VS Code Live Server (right-click index.html → Open with Live Server).</p>';
}
