import { validators, findDuplicateWord} from './validators.js';

const $ = (id) => document.getElementById(id);
const fields = ['description', 'amount', 'category', 'date'];

function check(name) {
    const value = $(name).value;
    const result = validators[name](value);
    const word = result.valid && name === 'description' ? findDuplicateWord(value) : null; 



    $(`${name}-error`).textContent = word ? `Tip: "${word}" is repeated. Is that a typo?` :result.message;
    $(`${name}-error`).classList.toggle('is-warning', Boolean(word));
    return result.valid;
}

fields.forEach((name) => $(name).addEventListener('input', () => check(name)));



$('record-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const bad = fields.filter((name) => !check(name));
    $('form-status').textContent = bad.length ? 'Please fix the errors above.' : 'All fields are valid.';
    $('form-status').classList = `form-status ${bad.length ? 'is-error' : 'is-ok'}`;
    if (bad.length) $(bad[0]).focus();
  });

$('cancel-btn').addEventListener('click', () => {
    $('record-form').reset();
    fields.forEach((name) => { 
      $(`${name}-error`).textContent = ''; 
     $(name).removeAttribute('aria-invalid'); 
    });
    $('form-status').textContent = '';
  
});
