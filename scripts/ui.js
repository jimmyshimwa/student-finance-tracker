import { validators, findDuplicateWord} from './validators.js';
import { records, addRecord, editRecord, deleteRecord, sortRecords, getStats, settings, setCap } from './state.js';
import { compileRegex, highlight } from './search.js';

const $ = (id) => document.getElementById(id);
const fields = ['description', 'amount', 'category', 'date'];

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
      [r.description, r.category, r.date, r.amount.toFixed(2)].some((text) => text.search(regex) !== -1);
    const list = sortRecords(regex ? records.filter(matches) : records, $('sort-select').value);
    const h = (text) => highlight(text, regex);



    $('records-body').innerHTML = list
       .map((r) => `<tr><td>${h(r.date)}</td><td>${h(r.description)}</td><td>${h(r.category)}</td>
        <td class="num">${h(r.amount.toFixed(2))}</td><td>${buttons(r.id)}</td></tr>`)
       .join('');

    $('records-cards').innerHTML = list
        .map((r) => `<li class="card"><p class="card-title">${h(r.description)}</p>
        <p class="card-meta">${h(r.category)} &middot; ${h(r.date)}</p>
        <p class="card-amount">${h(r.amount.toFixed(2))}</p>
        <div class="card-actions">${buttons(r.id)}</div></li>`)
        .join('');
    
    $('empty-message').hidden = list.length > 0;
    
    renderStats();
}

function renderStats() {
    const s = getStats();
    $('stat-count').textContent = s.count;
    $('stat-sum').textContent = s.sum.toFixed(2);
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

render();