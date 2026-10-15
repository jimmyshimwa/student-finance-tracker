import { load, save} from './storage.js';

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