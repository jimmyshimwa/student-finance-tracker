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