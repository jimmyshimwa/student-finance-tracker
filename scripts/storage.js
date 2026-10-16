import { records } from './state.js';
import { validators } from './validators.js';

const KEY = 'sft-records';

export function load() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
        return [];
    }
}

export function save(records) {
    localStorage.setItem(KEY, JSON.stringify(records));
}

export function loadSetting(name, fallback){
    try {
    return JSON.parse(localStorage.getItem('sft-' + name)) ?? fallback;    
} catch {
        return fallback;
    }
}

export function saveSetting(name, value) {
    localStorage.setItem('sft-' + name, JSON.stringify(value));
}

export function ecportJson(records) {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createdObjectURL(blob);
    link.download = 'finance-records.json';
    link.click();
    URL.revoleObjectURL(link.href);
}

export function parseImport(text) {
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        return {error: 'The file not valid JSON.'};
    }

    if (!Array.isArray(data)) return {error: 'The file must contain an list of records.'};

    const ids = new Set();
    for (const r of data) {
    const ok = r && typeof r.id === 'string' && !ids.has(r.id) && typeof r.amount === 'number' 
        && validators.amount(String(r.amount)).valid 
        && ['description', 'category', 'date'].every((k) => typeof r[k] === 'string' && validators[k](r[k]).valid); 
    if (!ok) return { error: `Record ${i + 1} is missing data, invalid, or has a duplicate id.` }; 
    ids.add(r.id);
    }
    return { records: data};
}