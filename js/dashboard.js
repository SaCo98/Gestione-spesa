// === CONFRONTO GIORNALIERO ===
const daysOfWeek = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];

function getTodayDay() {
  const todayIndex = new Date().getDay();
  // convertiamo "Domenica" in fondo, per compatibilità con le nostre diete
  return daysOfWeek[todayIndex];
}

function selectCompareDay(day) {
  // evidenzia pulsante selezionato
  document.querySelectorAll('#compare .day-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent === day);
  });

  renderCompareDay(day);
}

function renderCompareDay(day) {
  const person1Diet = diets.person1?.[day] || {};
  const person2Diet = diets.person2?.[day] || {};

  const renderMeals = meals => {
    if (Object.keys(meals).length === 0) return '<p>Nessun pasto registrato.</p>';
    let html = '';
    const orderedMeals = ["Colazione", "Spuntino", "Pranzo", "Merenda", "Cena"];
    const sortedMeals = orderedMeals.filter(m => meals[m]);
    sortedMeals.forEach(meal => {
      html += `<div class="compare-meal">
        <h4>🍽️ ${meal}</h4>
        <ul>
          ${meals[meal].map(item => `<li>${item.food} - ${item.quantity}${item.unit ? ' ' + item.unit : ''}</li>`).join('')}
        </ul>
      </div>`;
    });
    return html;
  };

  document.getElementById('comparePerson1').innerHTML = renderMeals(person1Diet);
  document.getElementById('comparePerson2').innerHTML = renderMeals(person2Diet);
}

// Mostra di default il giorno di oggi
document.addEventListener('DOMContentLoaded', () => {
  const today = getTodayDay();
  selectCompareDay(today);
});
