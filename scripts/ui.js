import { validators, findDuplicateWord} from './validators.js';
import { records, addRecord, editRecord, deleteRecord, sortRecords} from './state.js';
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

render();