/* =========================================================
   auth.js – Register (Week 4 validation) and Login
   ========================================================= */

function setError(id, message) {
  var input = document.getElementById(id);
  var error = document.getElementById(id + 'Error');
  if (message) {
    input.classList.add('invalid');
    error.textContent = message;
  } else {
    input.classList.remove('invalid');
    error.textContent = '';
  }
  return !message;
}

// Week 4: validate the fields of the registration page
function validateForm() {
  var name = document.getElementById('username').value.trim();
  var email = document.getElementById('email').value.trim();
  var phone = document.getElementById('phone').value.trim();
  var password = document.getElementById('password').value;
  var confirm = document.getElementById('confirm').value;
  var ok = true;

  if (name == '') {
    ok = setError('username', 'Please enter your username') && ok;
  } else if (name.length < 3) {
    ok = setError('username', 'Username must have at least 3 characters') && ok;
  } else {
    setError('username', '');
  }

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email == '') {
    ok = setError('email', 'Please enter your email') && ok;
  } else if (!emailPattern.test(email)) {
    ok = setError('email', 'Please enter a valid email address') && ok;
  } else {
    setError('email', '');
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    ok = setError('phone', 'Phone number must contain 10 digits') && ok;
  } else {
    setError('phone', '');
  }

  if (password == '') {
    ok = setError('password', 'Please enter your password') && ok;
  } else if (password.length < 6) {
    ok = setError('password', 'Password must contain at least 6 characters') && ok;
  } else {
    setError('password', '');
  }

  if (confirm == '') {
    ok = setError('confirm', 'Please confirm your password') && ok;
  } else if (password != confirm) {
    ok = setError('confirm', 'Passwords do not match') && ok;
  } else {
    setError('confirm', '');
  }

  if (!ok) return false;

  var users = getUsers();
  var taken = users.some(function (u) { return u.username.toLowerCase() === name.toLowerCase(); });
  if (taken) {
    setError('username', 'This username is already taken');
    return false;
  }

  users.push({ username: name, email: email, phone: phone, password: password });
  writeStore(USERS_KEY, users);

  document.getElementById('formMessage').innerHTML =
    '<p class="success">Registration successful! Taking you to login…</p>';
  setTimeout(function () { window.location.href = 'login.html?user=' + encodeURIComponent(name); }, 1200);
  return false;
}

// Login: check the username and password against registered users
function validateLogin() {
  var name = document.getElementById('username').value.trim();
  var password = document.getElementById('password').value;
  var ok = setError('username', name == '' ? 'Please enter your username' : '');
  ok = setError('password', password == '' ? 'Please enter your password' : '') && ok;
  if (!ok) return false;

  var user = getUsers().find(function (u) {
    return u.username.toLowerCase() === name.toLowerCase();
  });

  if (!user) {
    setError('username', 'No account found with this username. Please register first.');
    return false;
  }
  if (user.password !== password) {
    setError('password', 'Incorrect password');
    return false;
  }

  writeStore(USER_KEY, { username: user.username, email: user.email, phone: user.phone });
  window.location.href = 'index.html';
  return false;
}

// Pre-fill the username after registering
document.addEventListener('DOMContentLoaded', function () {
  var params = new URLSearchParams(window.location.search);
  var field = document.getElementById('username');
  if (params.get('user') && field && document.getElementById('loginForm')) {
    field.value = params.get('user');
    document.getElementById('formMessage').innerHTML =
      '<p class="success">Account created. Please login to continue.</p>';
    document.getElementById('password').focus();
  }
});
