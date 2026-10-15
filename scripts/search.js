export function compileRegex(text, ignoreCase) {
    if (!text) return { regex: null, error: ''};
    try {
        return { regex: new RegExp(text, ignoreCase ? 'gi' : 'g'), error: ''};
    }catch {
        return { regex: null, error: 'Invalid pattern. Showing all records. ' };
    }   
}

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function highlight(text, regex) {
    text = String(text);
    if (!regex) return escapeHtml(text);
    let out = '';
    let last = 0;
    for (const m of text.matchAll(regex)) {
        if (!m[0]) continue;
        out += escapeHtml(text.slice(last, m.index)) + '<mark>' + escapeHtml(m[0]) + '</mark>';
        last = m.index + m[0].length;
    }
    return out + escapeHtml(text.slice(last));
}