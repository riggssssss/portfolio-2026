// `*words*` → lime marker, the same voice the bio uses.
export const marked = (text) => text.split('*').map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part))
