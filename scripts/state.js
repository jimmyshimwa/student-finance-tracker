import { load, save, loadSetting, saveSetting } from './storage.js';

export const records = load();
const now = () => new Date().toISOString();

export function addRecord(data) {
    records.push({ id: 'txn_' + Date.now(), ...data, createdAt: now(), updatedAt: now() });
    save(records);
}

export function editRecord(id, data) {
    Object.assign(records.find((r) => r.id === id), data, {  updatedAt: now() });
    save(records);
}

export function deleteRecord(id) {
    records.splice(records.findIndex((r) => r.id === id), 1);
    save(records);
}

const keys = { date: 'date', desc: 'description', amount: 'amount'};

export function sortRecords(list, how) {
    const [name, dir] = how.split('-');
    const key = keys[name];
    const sign = dir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
        const diff = typeof a[key] === 'number' ? a[key] - b[key] : a[key].localeCompare(b[key]);
        return diff * sign;
    });
}

export const settings = { cap: loadSetting('cap', null) };

export function setCap(value) {
    settings.cap = value;
    saveSetting('cap', value);
}

const dayKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function getStats() {
    const sum = records.reduce((total, r) => total + r.amount, 0);

    const byCategory = {};
    records.forEach((r) => (byCategory[r.category] = (byCategory[r.category] || 0) + r.amount));
    const top = Object.keys(byCategory).sort((a,b) => byCategory[b] - byCategory[a])[0] || 'None yet';
    
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const total = records.filter((r) => r.date === dayKey(d)).reduce((total, r) => total + r.amount, 0);
        days.push({ label: d.toLocaleDateString('en', { weekday: 'short' }), total });    }
    const max = Math.max(...days.map((d) => d.total), 1);
    days.forEach((d) => (d.percent = Math.round((d.total / max) * 100)));

    return { count: records.length, sum, top, days };
}