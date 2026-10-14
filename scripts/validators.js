export const patterns = {
    description: /^\S(?:.*\S)?$/,
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWords: /\b(\w+)\s+\1\b/i
};

const messages = {
    description: 'Remove the spaces at the start or end.',
    amount: 'Use a number like 12 or 12.50 (max 2 decimals, no minus).',
    date: 'Use letters only, with single spaces or hyphens.',
    category: 'Use  letters only, with single spaces or hyphens.'
};


function realDate(text) {
    const [y, m, d] = text.split('-').map(Number);
    const date = new Date(y, m -1, d);
    return date.getFullYear() === y && date.getMonth() === m -1 && date.getDate() === d;
}

function validate(name, value) {
    if (value === '') return { valid:false, message: `${name} is required.`};
    if (!patterns[name].test(value)) return {valid: false, message: messages[name]};
    if (name === 'date' && !realDate(value)) return { valid: false, message: 'That date does not exist.'};
    return { valid: true, message: ''};   
}

export const validators = {};
Object.keys(messages).forEach((name) => (validators[name] = (value) => validate(name, value)));

export function findDuplicateWord(text) {
    const match = text.match(patterns.duplicateWords);
    return match ? match[1] : null;
}