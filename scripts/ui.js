import { validators, findDuplicateWord} from './validators.js';
import { records, addRecord, editRecord, deleteRecord, sortRecords, getStats, settings, setCap, replaceRecords, convert, saveCategories, saveCurrency } from './state.js';
import { compileRegex, highlight } from './search.js';
import { exportJson, parseImport} from './storage.js';

const $ = (id) => document.getElementById(id);
const fields = ['description', 'amount', 'category', 'date'];

const money = (n) => {
    const c = convert(n);
    return `${c.value.toFixed(2)} ${c.code}`;
};

function check(name) {
    const value = $(name).value;
    const result = validators[name](value);
    const word = result.valid && name === 'description' ? findDuplicateWord(value) : null; 

    $(`${name}-error`).textContent = word ? `Tip: "${word}" is repeated. Is that a typo?` :result.message;
    $(`${name}-error`).classList.toggle('is-warning', Boolean(word));
    $(name).setAttribute('aria-invalid', !result.valid);
    return result.valid;
}

function resetForm() {
    $('record-form').reset();
    $('record-id').value = '';
    fields.forEach((name) => {
        $(`${name}-error`).textContent = '';
        $(name).removeAttribute('aria-invalid');
    });
    $('form-status').textContent = '';
}



const buttons = (id) => 
    `<button type="button" class="btn btn-small btn-secondary" data-action="edit" data-id="${id}">Edit</button>
    <button type="button" class="btn btn-small btn-danger" data-action="delete" data-id="${id}">Delete</button>`;  


function render() {
    const { regex, error } = compileRegex($('search-input').value, $('search-case').checked);
    $('search-status').textContent = error;

   const matches = (r) =>
      [r.description, r.category, r.date, money(r.amount)].some((text) => text.search(regex) !== -1);
    const list = sortRecords(regex ? records.filter(matches) : records, $('sort-select').value);
    const h = (text) => highlight(text, regex);



    $('records-body').innerHTML = list
       .map((r) => `<tr><td>${h(r.date)}</td><td>${h(r.description)}</td><td>${h(r.category)}</td>
        <td class="num">${h(money(r.amount))}</td><td>${buttons(r.id)}</td></tr>`)
       .join('');

    $('records-cards').innerHTML = list
        .map((r) => `<li class="card"><p class="card-title">${h(r.description)}</p>
        <p class="card-meta">${h(r.category)} &middot; ${h(r.date)}</p>
        <p class="card-amount">${h(money(r.amount))}</p>
        <div class="card-actions">${buttons(r.id)}</div></li>`)
        .join('');
    
    $('empty-message').hidden = list.length > 0;
    
    renderStats();
}

function renderStats() {
    const s = getStats();
    $('stat-count').textContent = s.count;
    $('stat-sum').textContent = money(s.sum);
    $('stat-top').textContent = s.top;

    $('trend-bars').innerHTML = s.days
        .map((d) => `<li><span class="bar-track"><span class="bar" style="--h: ${d.percent}%"></span></span>
            <span class="bar-label">${d.label}<span class="visually-hidden">: ${d.total.toFixed(2)}</span></span></li>`)
        .join('');

    const box = $('cap-message');
    const over = settings.cap !== null && s.sum > settings.cap;
    box.setAttribute('aria-live', over ? 'assertive' : 'polite');
    box.classList.toggle('is-over', over);
    if (settings.cap === null) box.textContent = 'No cap set. You can set one in Settings.';
    else if (over) box.textContent = `Cap exceeded by ${(s.sum - settings.cap).toFixed(2)}.`;
    else box.textContent = `Cap remaining: ${(settings.cap - s.sum).toFixed(2)} remaining of your ${settings.cap.toFixed(2)} cap.`;    
}


fields.forEach((name) => $(name).addEventListener('input', () => check(name)));

$('record-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const bad = fields.filter((name) => !check(name));
    if (bad.length) {
    $('form-status').textContent = 'Please fix the errors above.';
    $('form-status').classList = 'form-status is-error';
    $(bad[0]).focus();
    return;
}

const data = {
    description: $('description').value,
    amount: Number($('amount').value),
    category: $('category').value,
    date: $('date').value,
};
const id = $('record-id').value;
if(id) editRecord(id, data);
else addRecord(data);


resetForm();
$('form-status').textContent = id ? 'Record updated.' : 'Record added.';
$('form-status').classList = 'form-status is-ok';
 render();
});


$('cancel-btn').addEventListener('click', resetForm);


function onAction(event) {
    const btn = event.target.closest('button[data-action]');
    if (!btn) return;
    const record = records.find((r) => r.id === btn.dataset.id);

    if (btn.dataset.action === 'delete') {
        if (confirm(`Delete "${record.description}"?`)) {
            deleteRecord(record.id);
            render();
        }
    }else {
        fields.forEach((name) => ($(name).value = record[name]));
        $('record-id').value = record.id;
        $('form-section').scrollIntoView();
        $('description').focus();
    }
}
$('records-body').addEventListener('click', onAction);
$('records-cards').addEventListener('click', onAction);

['search-input', 'search-case', 'sort-select'].forEach((id) => $(id).addEventListener('input', render));

$('save-cap-btn').addEventListener('click', () => {
    const value = $('cap-input').value; 
    const result = value === '' ? { valid: true } : validators.amount(value);
    $('cap-error').textContent = result.valid ? '' : result.message; 
    if (!result.valid) return;
    setCap(value === '' ? null : Number(value)); 
    renderStats();
});

$('cap-input').value = settings.cap ?? '';

function renderCategories() {
  $('category-list').innerHTML = settings.categories
    .map((c) => `<li>${c}<button type="button" class="btn btn-danger" data-cat="${c}" aria-label="Remove ${c}">&times;</button></li>`)
    .join('');
  $('category-options').innerHTML = settings.categories.map((c) => `<option value="${c}"></option>`).join('');
}

$('add-category-btn').addEventListener('click', () => {
    const name = $('new-category').value;
    const result = validators.category(name);
    $('new-category-error').textContent = result.message;
    if(!result.valid) return;
    if (settings.categories.includes(name)) {
        $('new-category-error').textContent = 'That category already exists.';
        return;
    }

    settings.categories.push(name);
    saveCategories();
    $('new-category').value = '';
    renderCategories();
});

$('category-list').addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-cat]');
    if (!btn) return;
    settings.categories = settings.categories.filter((c) => c !== btn.dataset.cat);
    saveCategories();
    renderCategories();
});

function loadCurrencyForm() {
    const c = settings.currency;
    $('base-currency').value = c.base;
    $('currency-2').value = c.c2;
    $('rate-2').value = c.r2;
    $('currency-3').value = c.c3;
    $('rate-3').value = c.r3;
    $('display-currency').value = c.show;
}

$('save-currency-btn').addEventListener('click', () => {
    const codes = ['base-currency', 'currency-2', 'currency-3'].map((id) => $(id).value.trim().toUpperCase());
    const rates = ['rate-2', 'rate-3'].map((id) => $(id).value.trim());
    const show = $('display-currency').value;
    const status = $('currency-status');

    if (!codes.every((c) => /^[A-Z]{3}$/.test(c))) {
        status.textContent = 'Currency codes must be 3 letters, like USD.';
    } else if (!rates.every((r) => r === '' || (validators.amount(r).valid && Number(r) > 0))) {
        status.textContent = 'Rates must be numbers greater than 0.';
    } else if (show !== 'base' && rates[show === 'c2' ? 0 : 1] === '') {
        status.textContent = 'Enter a rate for the currency you want to show.';
    } else {
        settings.currency = { base: codes[0], c2: codes[1], r2: rates[0], c3: codes[2], r3: rates[1], show };
    saveCurrency();
        status.textContent = 'Currency settings saved.';
    render();
  }
});


$('export-btn').addEventListener('click', () => {
  exportJson(records);
  $('data-status').textContent = `Exported ${records.length} records.`;
});

$('import-file').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const status = $('data-status');
  const result = parseImport(await file.text());

  if (result.error) {
    status.textContent = `Import failed: ${result.error} Your records were not changed.`;
  } else if (confirm(`Replace your current records with ${result.records.length} imported records?`)) {
    replaceRecords(result.records);
    result.records.forEach((r) => {
      if (!settings.categories.includes(r.category)) settings.categories.push(r.category);
    });
    saveCategories();
    renderCategories();
    status.textContent = `Imported ${result.records.length} records.`;
    render();
  }
  event.target.value = '';
});

renderCategories();
loadCurrencyForm();
render();