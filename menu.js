/* =========================================================
   menu.js – catalogue page (Week 5) with data loaded from JSON (Week 9)
   ========================================================= */

var allDishes = [];
var activeCategory = 'All';

function loadMenu() {
  fetch('data/menu.json')
    .then(function (res) { return res.json(); })
    .then(function (data) { allDishes = data; showMenu(); })
    .catch(function () {
      // opened without a server: use the backup copy from menu-data.js
      allDishes = MENU_BACKUP;
      showMenu();
    });
}

function showMenu() {
  var search = document.getElementById('search').value.toLowerCase();
  var vegOnly = document.getElementById('vegOnly').checked;

  var list = allDishes.filter(function (d) {
    var matchCategory = activeCategory === 'All' || d.category === activeCategory;
    var matchSearch = d.name.toLowerCase().indexOf(search) !== -1 || d.desc.toLowerCase().indexOf(search) !== -1;
    var matchVeg = !vegOnly || d.veg;
    return matchCategory && matchSearch && matchVeg;
  });

  var grid = document.getElementById('menuGrid');
  if (list.length === 0) {
    grid.innerHTML = '<p class="empty">No dishes match your search. Try another word or category.</p>';
  } else {
    grid.innerHTML = list.map(dishCard).join('');
  }
  document.getElementById('resultCount').textContent =
    list.length + (list.length === 1 ? ' dish' : ' dishes');
}

function filterCategory(button, category) {
  activeCategory = category;
  var chips = document.querySelectorAll('.chip');
  chips.forEach(function (c) { c.classList.remove('active'); });
  button.classList.add('active');
  showMenu();
}

document.addEventListener('DOMContentLoaded', loadMenu);
