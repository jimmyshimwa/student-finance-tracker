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
