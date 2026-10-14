/* =========================================================
   app.js – shared JavaScript used by every page
   (login state, mobile menu, toast messages, dish cards)
   ========================================================= */

var USERS_KEY = 'gk_users';   // registered users
var USER_KEY  = 'gk_user';    // logged-in user
var CART_KEY  = 'gk_cart';    // cart (shared with the Angular order app)
var ORDER_APP = 'order/index.html';

// ---------- localStorage helpers ----------
function readStore(key, fallback) {
  try {
    var value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { /* storage blocked – ignore */ }
}

// ---------- users ----------
function getUsers() {
  var users = readStore(USERS_KEY, []);
  var hasGuest = users.some(function (u) { return u.username === 'guest'; });
  if (!hasGuest) {
    users.push({ username: 'guest', email: 'guest@gmail.com', phone: '9876543210', password: 'guest123' });
  }
  return users;
}

function currentUser() {
  return readStore(USER_KEY, null);
}

function logout() {
  try { localStorage.removeItem(USER_KEY); } catch (e) { }
  window.location.href = 'login.html';
}

// ---------- header ----------
function setupHeader() {
  var user = currentUser();
  var slot = document.getElementById('userSlot');
  if (slot && user) {
    slot.innerHTML = '<span class="user-chip">Hi, <b>' + escapeHtml(user.username) + '</b></span>' +
                     '<a href="#" onclick="logout(); return false;">Logout</a>';
    slot.style.display = 'flex';
    slot.style.alignItems = 'center';
    slot.style.gap = '6px';
  }

  var cart = readStore(CART_KEY, []);
  var count = 0;
  cart.forEach(function (line) { count += line.qty; });
  var badge = document.getElementById('cartCount');
  if (badge && count > 0) badge.textContent = ' (' + count + ')';

  var toggle = document.querySelector('.menu-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () { links.classList.toggle('open'); });
  }
}

// ---------- small helpers ----------
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function showToast(message) {
  var toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
}

var SPICE_LEVELS = { 'None': 0, 'Mild': 1, 'Medium': 2, 'Hot': 3, 'Extra Hot': 4 };
var CHILLI_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17c4 3 12 2 15-7 .6-1.8-1.2-3-2.4-1.6C14 11.6 10 14.4 4 14.6c-1.4 0-1.6 1.6 0 2.4z" fill="#c1121f"/><path d="M17 8.6c.4-2 1.6-3.4 3.4-4" stroke="#3f7d20" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';

function spiceIcons(spice) {
  var level = SPICE_LEVELS[spice] || 0;
  if (level === 0) return '<span class="spice">No spice</span>';
  var html = '<span class="spice" title="' + spice + '">';
  for (var i = 1; i <= 4; i++) {
    html += '<span class="' + (i <= level ? 'on' : 'off') + '">' + CHILLI_SVG + '</span>';
  }
  return html + '</span>';
}

// ---------- dish card (used on Home and Menu pages) ----------
function dishCard(d) {
  return '<div class="item">' +
    '<img src="' + d.image + '" alt="' + escapeHtml(d.name) + '" loading="lazy">' +
    '<div class="item-body">' +
      '<div class="item-top">' +
        '<span class="diet ' + (d.veg ? 'veg' : 'nonveg') + '" title="' + (d.veg ? 'Veg' : 'Non-veg') + '"></span>' +
        spiceIcons(d.spice) +
      '</div>' +
      '<h3>' + escapeHtml(d.name) + '</h3>' +
      '<p>' + escapeHtml(d.desc) + '</p>' +
      '<div class="item-foot">' +
        '<span class="price">₹' + d.price + '</span>' +
        '<button class="btn-small" onclick="order(' + d.id + ', \'' + d.name.replace(/'/g, "\\'") + '\')">Order Now</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

// Week 5 "Order Now": now hands the dish to the Angular order app
function order(id, dish) {
  showToast(dish + ' added. Opening your order…');
  setTimeout(function () {
    window.location.href = ORDER_APP + '#/?add=' + id;
  }, 700);
}

document.addEventListener('DOMContentLoaded', setupHeader);
