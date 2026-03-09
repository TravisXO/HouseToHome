import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'

// ── Brand ─────────────────────────────────────────────────────────────────
const BLUE = '#0b699c'
const RED = '#e92026'
const DARK = '#0a2540'

// ── Cloudinary config — add these two lines to your .env file: ────────────
//   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
//   VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset-name
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''

// ── Constants ─────────────────────────────────────────────────────────────
const LISTING_TYPES = ['Rent', 'Sale']
const PROPERTY_STATUSES = ['Residential', 'Commercial', 'Land', 'Investment']
const PROPERTY_TYPES = ['House', 'Apartment', 'Townhouse', 'Vacant Land', 'Farm', 'Commercial', 'Industrial']
const CURRENCIES = ['$', 'K']
const PER_PAGE = 12

// ── Status colours ────────────────────────────────────────────────────────
const STATUS_COLORS = {
    Residential: { bg: '#e0f2fe', text: '#0369a1' },
    Commercial: { bg: '#fef9c3', text: '#854d0e' },
    Land: { bg: '#dcfce7', text: '#166534' },
    Investment: { bg: '#f3e8ff', text: '#7e22ce' },
}

// ── Wix JSON <-> form normalisation ──────────────────────────────────────
function toForm(raw) {
    return {
        _key: raw.ID || crypto.randomUUID(),
        // _source: 'legacy'  = from all-properties.json (original Wix export, not yet migrated)
        //          'custom'  = from housetohome-properties-rent/buy.json (already saved through admin)
        _source: raw._source || 'legacy',
        id: raw.ID || '',
        title: raw.Title || '',
        location: raw.Location || '',
        listingType: arrFirst(raw['Listing Type'], 'Rent'),
        propertyStatus: arrFirst(raw['Propety Status'], 'Residential'),
        propertyType: arrFirst(raw['Property Type'], 'House'),
        bedrooms: raw.Bedrooms != null ? String(raw.Bedrooms) : '',
        bathrooms: raw.Bathroom != null ? String(raw.Bathroom) : '',
        lotSize: raw['Lot Size'] || '',
        currency: arrFirst(raw.Currency, '$'),
        pricing: raw.Pricing || '',
        amenities: raw.Ammenities || '',
        images: raw['Property Image'] || [],
    }
}

function toWix(form) {
    return {
        ID: form.id || form._key,
        Title: form.title,
        Location: form.location,
        'Listing Type': [form.listingType],
        'Propety Status': [form.propertyStatus],    // typo preserved from Wix CMS
        'Property Type': [form.propertyType],
        Bedrooms: form.bedrooms !== '' ? Number(form.bedrooms) : null,
        Bathroom: form.bathrooms !== '' ? Number(form.bathrooms) : null,
        'Lot Size': form.lotSize,
        Currency: [form.currency],
        Pricing: form.pricing,
        Ammenities: form.amenities,           // typo preserved from Wix CMS
        'Property Image': form.images,
        _source: 'custom',
    }
}

function arrFirst(val, fallback) {
    if (Array.isArray(val)) return val[0] || fallback
    return val || fallback
}

const EMPTY_FORM = {
    _key: '', _source: 'custom',
    id: '', title: '', location: '',
    listingType: 'Rent', propertyStatus: 'Residential', propertyType: 'House',
    bedrooms: '', bathrooms: '', lotSize: '', currency: '$', pricing: '', amenities: '', images: [],
}

// ── Image helpers ─────────────────────────────────────────────────────────
// Cloudinary Optimize & Deliver transformation:
//   c_scale  = scale to width (no crop, aspect ratio preserved)
//   w_{n}    = target width
//   f_auto   = auto format: serves WebP/AVIF/JPEG based on browser
//   q_auto   = perceptual auto quality (Cloudinary picks best compression)
// Result: smaller file sizes, correct format, same visual quality.
function optimizeCloudinaryUrl(url, w = 800) {
    if (!url || !url.includes('res.cloudinary.com')) return url
    return url.replace('/upload/', `/upload/c_scale,w_${w},f_auto,q_auto/`)
}

function resolveThumb(img, w = 600) {
    const raw = img?.src || img?.Slug || img?.slug || ''
    if (!raw) return null
    if (raw.includes('res.cloudinary.com')) return optimizeCloudinaryUrl(raw, w)
    if (raw.startsWith('https://') || raw.startsWith('http://')) return raw
    const wixMatch = raw.match(/wix:image:\/\/v1\/([^/]+)\//)
    if (wixMatch) return `https://static.wixstatic.com/media/${wixMatch[1]}`
    if (!raw.includes(':') && !raw.includes('/')) return `https://static.wixstatic.com/media/${raw}`
    return null
}

// Upload a single file directly to Cloudinary using an unsigned preset.
// Uses XHR instead of fetch so we can track upload progress.
async function uploadToCloudinary(file, onProgress) {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error('Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file')
    }
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder', 'housetohome')

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = e => {
            if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText)
                resolve({ src: data.secure_url, alt: file.name.replace(/\.[^/.]+$/, '') })
            } else {
                reject(new Error(`Cloudinary ${xhr.status}: ${xhr.responseText}`))
            }
        }
        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
        xhr.send(fd)
    })
}

// ── Icons ─────────────────────────────────────────────────────────────────
const Icons = {
    home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    plus: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    save: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
    search: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    edit: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    trash: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>,
    bed: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></svg>,
    bath: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /><line x1="10" y1="5" x2="8" y2="7" /><line x1="2" y1="12" x2="22" y2="12" /></svg>,
    area: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h6v6H3z" /><path d="M15 15h6v6h-6z" /><path d="M3 9h18M9 3v18" /></svg>,
    back: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
    info: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    check: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    warn: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    image: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
    upload: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>,
    chevL: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
    chevR: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
    x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    xSm: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    star: <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
}

// ── Main Component ────────────────────────────────────────────────────────
export default function AdminPage() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [dirty, setDirty] = useState(false)
    const [toast, setToast] = useState(null)
    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [page, setPage] = useState(1)
    const [modal, setModal] = useState(null)
    const [deleteKey, setDeleteKey] = useState(null)

    // ── Load ──────────────────────────────────────────────────────────────
    // Backend GET /api/admin/properties must:
    //   1. Read all-properties.json           → tag each item _source:'legacy'
    //   2. Read housetohome-properties-rent.json  → tag _source:'custom'
    //   3. Read housetohome-properties-buy.json   → tag _source:'custom'
    //   4. Merge, deduplicating by ID (custom wins over legacy)
    //   5. Return the merged array
    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/properties')
            if (!res.ok) throw new Error(`Server error: ${res.status}`)
            const raw = await res.json()
            setItems(raw.map(toForm))
            setDirty(false)
        } catch (e) {
            showToast(e.message, 'err')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    function showToast(msg, type = 'ok') {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 4000)
    }

    // ── Save ──────────────────────────────────────────────────────────────
    // Splits items by listingType and posts to backend.
    //
    // Backend POST /api/admin/properties must accept body: { rent: [...], buy: [...] }
    //   1. Write rent array → src/data/housetohome-properties-rent.json
    //   2. Write buy array  → src/data/housetohome-properties-buy.json
    //   3. Collect all IDs now present in either split file
    //   4. Remove those IDs from all-properties.json
    //      (this migrates legacy entries as they are saved)
    async function handleSave() {
        setSaving(true)
        try {
            const rentItems = items.filter(it => it.listingType === 'Rent').map(toWix)
            const buyItems = items.filter(it => it.listingType !== 'Rent').map(toWix)

            const res = await fetch('/api/admin/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rent: rentItems, buy: buyItems }),
            })
            if (!res.ok) throw new Error(`Save failed: ${res.status}`)

            // Mark all items as custom now that they've been saved to split files
            setItems(prev => prev.map(it => ({ ...it, _source: 'custom' })))
            setDirty(false)
            showToast('Saved → housetohome-properties-rent/buy.json ✓')
        } catch (e) {
            showToast(e.message, 'err')
        } finally {
            setSaving(false)
        }
    }

    function openAdd() { setModal({ mode: 'add', form: { ...EMPTY_FORM, _key: crypto.randomUUID() } }) }
    function openEdit(item) { setModal({ mode: 'edit', form: { ...item } }) }

    function handleModalSave(form) {
        setItems(prev =>
            modal.mode === 'add'
                ? [{ ...form, _source: 'custom' }, ...prev]
                : prev.map(it => it._key === form._key ? { ...form, _source: 'custom' } : it)
        )
        setDirty(true)
        setModal(null)
    }

    function confirmDelete(key) { setDeleteKey(key) }
    function executeDelete() {
        setItems(prev => prev.filter(it => it._key !== deleteKey))
        setDirty(true)
        setDeleteKey(null)
    }

    // ── Filter + paginate ─────────────────────────────────────────────────
    const filtered = items.filter(it => {
        const q = search.toLowerCase()
        return (
            (!q || it.title.toLowerCase().includes(q) || it.location.toLowerCase().includes(q)) &&
            (!filterType || it.listingType === filterType) &&
            (!filterStatus || it.propertyStatus === filterStatus)
        )
    })

    const totalPages = Math.ceil(filtered.length / PER_PAGE)
    const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    function handleFilter(type, val) {
        if (type === 'type') setFilterType(v => v === val ? '' : val)
        if (type === 'status') setFilterStatus(v => v === val ? '' : val)
        setPage(1)
    }

    const legacyCount = items.filter(it => it._source === 'legacy').length
    const customCount = items.filter(it => it._source === 'custom').length

    return (
        <div style={{ minHeight: '100vh', background: '#f7f9fc', fontFamily: "'Schibsted Grotesk', sans-serif" }}>

            {/* ── Header ── */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 30,
                background: DARK, borderBottom: `3px solid ${RED}`,
                boxShadow: '0 2px 24px rgba(0,0,0,0.3)',
                padding: '0 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                height: 58,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: `linear-gradient(135deg, ${RED}, ${BLUE})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    }}>
                        {Icons.home}
                    </div>
                    <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: '#fff', fontSize: 17 }}>
                        HouseToHome
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>/ Admin</span>
                    {dirty && (
                        <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                            color: RED, background: `${RED}25`, border: `1px solid ${RED}50`,
                            borderRadius: 999, padding: '2px 10px',
                        }}>
                            Unsaved
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HdrBtn onClick={openAdd} bg={BLUE} icon={Icons.plus} label="Add" />
                    <HdrBtn
                        onClick={handleSave}
                        disabled={saving || !dirty}
                        bg={dirty ? '#16a34a' : 'rgba(255,255,255,0.08)'}
                        border={dirty ? 'none' : '1px solid rgba(255,255,255,0.15)'}
                        textColor={dirty ? '#fff' : 'rgba(255,255,255,0.45)'}
                        icon={saving ? <Spinner size={13} /> : Icons.save}
                        label={saving ? 'Saving…' : 'Save JSON'}
                    />
                    <Link to="/" style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: 'rgba(255,255,255,0.35)', fontSize: 12, textDecoration: 'none', marginLeft: 4,
                    }}>
                        {Icons.back} <span className="hide-xs">Site</span>
                    </Link>
                </div>
            </header>

            {/* ── Search & Filter Bar ── */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e8edf3', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ position: 'relative', maxWidth: 480 }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
                        {Icons.search}
                    </span>
                    <input
                        type="text"
                        placeholder="Search by title or location…"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1) }}
                        style={{
                            width: '100%', height: 40, paddingLeft: 38, paddingRight: 16,
                            border: '1.5px solid #e2e8f0', borderRadius: 999,
                            fontSize: 13, color: '#1e293b', background: '#f8fafc',
                            outline: 'none', boxSizing: 'border-box',
                            fontFamily: "'Schibsted Grotesk', sans-serif",
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginRight: 2 }}>Type</span>
                    <FilterPill label="For Rent" active={filterType === 'Rent'} onClick={() => handleFilter('type', 'Rent')} />
                    <FilterPill label="For Sale" active={filterType === 'Sale'} onClick={() => handleFilter('type', 'Sale')} />
                    <div style={{ width: 1, height: 16, background: '#e2e8f0', margin: '0 4px' }} />
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginRight: 2 }}>Status</span>
                    {PROPERTY_STATUSES.map(s => (
                        <FilterPill key={s} label={s} active={filterStatus === s} onClick={() => handleFilter('status', s)} />
                    ))}
                </div>

                <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span>
                        Showing <strong style={{ color: '#334155' }}>{visible.length}</strong> of{' '}
                        <strong style={{ color: '#334155' }}>{filtered.length}</strong> properties
                    </span>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span>
                        <strong style={{ color: BLUE }}>{customCount}</strong> migrated ·{' '}
                        <strong style={{ color: '#94a3b8' }}>{legacyCount}</strong> legacy
                    </span>
                    {(filterType || filterStatus || search) && (
                        <button
                            onClick={() => { setFilterType(''); setFilterStatus(''); setSearch(''); setPage(1) }}
                            style={{ fontSize: 11, color: RED, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: "'Schibsted Grotesk', sans-serif" }}>
                            Clear filters ×
                        </button>
                    )}
                </div>
            </div>

            {/* ── Info banner ── */}
            <div style={{ padding: '10px 20px 0', maxWidth: 1280, margin: '0 auto' }}>
                <div style={{
                    background: `${BLUE}08`, border: `1px solid ${BLUE}20`, borderRadius: 10,
                    padding: '9px 14px', fontSize: 12, color: '#555',
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                }}>
                    <span style={{ color: BLUE, flexShrink: 0, marginTop: 1 }}>{Icons.info}</span>
                    <span>
                        Edits are <strong>local</strong> until you click <strong>Save JSON</strong>.
                        Rent properties → <code style={{ fontSize: 11, background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>housetohome-properties-rent.json</code>{', '}
                        sale properties → <code style={{ fontSize: 11, background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>housetohome-properties-buy.json</code>.
                        Saved entries are automatically removed from <code style={{ fontSize: 11, background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>all-properties.json</code>.
                        Images upload directly to Cloudinary and are served with <code style={{ fontSize: 11, background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>f_auto,q_auto</code> optimization.
                    </span>
                </div>
            </div>

            {/* ── Card Grid ── */}
            <main style={{ padding: '20px 20px 60px', maxWidth: 1280, margin: '0 auto' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                        <Spinner size={28} dark />
                        <p style={{ marginTop: 16, fontSize: 14 }}>Loading properties…</p>
                    </div>
                ) : items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>🏠</div>
                        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: '#475569', marginBottom: 6 }}>No properties found</p>
                        <p style={{ fontSize: 13 }}>
                            Make sure <code style={{ fontSize: 11, background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>all-properties.json</code> exists in{' '}
                            <code style={{ fontSize: 11, background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>src/data/</code>
                        </p>
                    </div>
                ) : visible.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 17, color: '#475569', marginBottom: 6 }}>No properties match</p>
                        <p style={{ fontSize: 13 }}>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                        gap: 20,
                    }}>
                        {visible.map(item => (
                            <PropertyCard
                                key={item._key}
                                item={item}
                                onEdit={() => openEdit(item)}
                                onDelete={() => confirmDelete(item._key)}
                            />
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 40 }}>
                        <PageBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{Icons.chevL}</PageBtn>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                            <PageBtn key={n} onClick={() => setPage(n)} active={n === page}>{n}</PageBtn>
                        ))}
                        <PageBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{Icons.chevR}</PageBtn>
                    </div>
                )}
            </main>

            {modal && (
                <PropertyModal mode={modal.mode} initialForm={modal.form} onSave={handleModalSave} onClose={() => setModal(null)} />
            )}
            {deleteKey && (
                <ConfirmModal message="Delete this property from the list?" onConfirm={executeDelete} onCancel={() => setDeleteKey(null)} />
            )}

            {toast && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 20, zIndex: 9999,
                    background: toast.type === 'err' ? RED : '#16a34a',
                    color: '#fff', borderRadius: 12, padding: '12px 20px',
                    fontSize: 13, fontWeight: 600, fontFamily: "'Schibsted Grotesk', sans-serif",
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    display: 'flex', alignItems: 'center', gap: 8,
                    animation: 'toastIn 0.3s ease',
                }}>
                    {toast.type === 'err' ? Icons.info : Icons.check}
                    {toast.msg}
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,400&family=Schibsted+Grotesk:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; }
                @keyframes toastIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
                @keyframes modalIn { from { opacity:0; transform:translateY(-10px) scale(0.98) } to { opacity:1; transform:translateY(0) scale(1) } }
                @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
                @keyframes spin    { to { transform:rotate(360deg) } }
                .hide-xs { display: none; }
                @media (min-width: 480px) { .hide-xs { display: inline; } }
                input:focus, textarea:focus, select:focus { border-color: ${BLUE} !important; box-shadow: 0 0 0 3px ${BLUE}18; }
                button:active { transform: scale(0.97); }
                .card-hover-actions { opacity: 0; transition: opacity 0.2s ease; }
                .prop-card:hover .card-hover-actions { opacity: 1; }
                .card-bottom-actions { display: flex; }
                @media (min-width: 640px) {
                    .card-bottom-actions { display: none; }
                    .card-hover-actions  { display: flex; }
                }
                .modal-wrap { align-items: flex-end; }
                @media (min-width: 640px) { .modal-wrap { align-items: center; } }
                .img-thumb:hover .img-remove { opacity: 1 !important; }
            `}</style>
        </div>
    )
}

// ── Property Card ─────────────────────────────────────────────────────────
function PropertyCard({ item, onEdit, onDelete }) {
    const thumb = item.images?.[0] ? resolveThumb(item.images[0], 400) : null
    const isRent = item.listingType === 'Rent'
    const statusStyle = STATUS_COLORS[item.propertyStatus] || { bg: '#f1f5f9', text: '#475569' }
    const isLegacy = item._source === 'legacy'

    return (
        <div
            className="prop-card"
            style={{
                background: '#fff', borderRadius: 20, overflow: 'hidden',
                boxShadow: '0 2px 16px rgba(0,0,0,0.055)',
                border: `1px solid ${isLegacy ? 'rgba(0,0,0,0.055)' : `${BLUE}28`}`,
                display: 'flex', flexDirection: 'column',
                transition: 'box-shadow 0.25s ease, transform 0.25s ease',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(11,105,156,0.14), 0 4px 16px rgba(0,0,0,0.06)'
                e.currentTarget.style.transform = 'translateY(-3px)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.055)'
                e.currentTarget.style.transform = 'translateY(0)'
            }}
        >
            <div style={{ position: 'relative', height: 160, flexShrink: 0, overflow: 'hidden', background: '#e8edf3' }}>
                {thumb
                    ? <img src={thumb} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    : (
                        <div style={{
                            width: '100%', height: '100%',
                            background: `linear-gradient(135deg, ${BLUE}44, ${BLUE}88)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'rgba(255,255,255,0.45)',
                        }}>
                            {Icons.image}
                        </div>
                    )
                }

                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                    <span style={{
                        background: isRent ? BLUE : RED, color: '#fff',
                        fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                        padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase',
                        fontFamily: "'Schibsted Grotesk', sans-serif",
                    }}>
                        {item.listingType}
                    </span>
                </div>

                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <span style={{
                        background: statusStyle.bg, color: statusStyle.text,
                        fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
                        padding: '3px 10px', borderRadius: 999,
                        fontFamily: "'Schibsted Grotesk', sans-serif",
                    }}>
                        {item.propertyStatus}
                    </span>
                </div>

                {isLegacy && (
                    <div style={{ position: 'absolute', bottom: 8, left: 10 }}>
                        <span style={{
                            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
                            padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase',
                            fontFamily: "'Schibsted Grotesk', sans-serif",
                        }}>
                            Legacy
                        </span>
                    </div>
                )}

                <div className="card-hover-actions" style={{ position: 'absolute', bottom: 10, right: 10, gap: 6 }}>
                    <GlassBtn onClick={onEdit} color={BLUE} title="Edit">{Icons.edit}</GlassBtn>
                    <GlassBtn onClick={onDelete} color={RED} title="Delete">{Icons.trash}</GlassBtn>
                </div>
            </div>

            <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <div>
                    <p style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 600, color: DARK, lineHeight: 1.35, margin: 0, wordBreak: 'break-word' }}>
                        {item.title || <em style={{ color: '#94a3b8' }}>Untitled</em>}
                    </p>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0', fontFamily: "'Schibsted Grotesk', sans-serif" }}>
                        📍 {item.location || '—'}
                    </p>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #f0f7ff, #e8f4ff)',
                    borderRadius: 12, padding: '8px 12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: BLUE }}>
                        {item.pricing || '—'}
                    </span>
                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: "'Schibsted Grotesk', sans-serif" }}>
                        {item.propertyType}
                    </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {item.bedrooms && <Bubble icon={Icons.bed} label={`${item.bedrooms} bed`} />}
                    {item.bathrooms && <Bubble icon={Icons.bath} label={`${item.bathrooms} bath`} />}
                    {item.lotSize && <Bubble icon={Icons.area} label={item.lotSize} />}
                    {item.images?.length > 0 && (
                        <Bubble icon={Icons.image} label={`${item.images.length} photo${item.images.length !== 1 ? 's' : ''}`} />
                    )}
                </div>

                <div className="card-bottom-actions" style={{ gap: 8, marginTop: 4 }}>
                    <button onClick={onEdit} style={{
                        flex: 1, height: 34, borderRadius: 10,
                        background: `${BLUE}12`, border: `1px solid ${BLUE}25`,
                        color: BLUE, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        fontSize: 12, fontWeight: 600, fontFamily: "'Schibsted Grotesk', sans-serif",
                    }}>
                        {Icons.edit} Edit
                    </button>
                    <button onClick={onDelete} style={{
                        flex: 1, height: 34, borderRadius: 10,
                        background: `${RED}10`, border: `1px solid ${RED}20`,
                        color: RED, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        fontSize: 12, fontWeight: 600, fontFamily: "'Schibsted Grotesk', sans-serif",
                    }}>
                        {Icons.trash} Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Image Manager ─────────────────────────────────────────────────────────
function ImageManager({ images, onChange }) {
    const fileInputRef = useRef(null)
    // uploads: [{ id, name, progress, error, done }]
    const [uploads, setUploads] = useState([])

    function removeImage(idx) {
        onChange(images.filter((_, i) => i !== idx))
    }

    function setCover(idx) {
        if (idx === 0) return
        const next = [...images]
        const [img] = next.splice(idx, 1)
        next.unshift(img)
        onChange(next)
    }

    async function handleFiles(files) {
        const fileArr = Array.from(files)
        const ids = fileArr.map(() => crypto.randomUUID())

        setUploads(prev => [
            ...prev,
            ...fileArr.map((f, i) => ({ id: ids[i], name: f.name, progress: 0, error: null, done: false })),
        ])

        await Promise.allSettled(fileArr.map((file, i) =>
            uploadToCloudinary(file, pct =>
                setUploads(prev => prev.map(u => u.id === ids[i] ? { ...u, progress: pct } : u))
            )
                .then(imgObj => {
                    onChange(prev => [...prev, imgObj])
                    setUploads(prev => prev.map(u => u.id === ids[i] ? { ...u, done: true, progress: 100 } : u))
                    setTimeout(() => setUploads(prev => prev.filter(u => u.id !== ids[i])), 1400)
                })
                .catch(err => {
                    setUploads(prev => prev.map(u => u.id === ids[i] ? { ...u, error: err.message } : u))
                })
        ))
    }

    const onDrop = e => { e.preventDefault(); if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files) }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Images {images.length > 0 && `(${images.length})`}
                </label>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '5px 12px', borderRadius: 8,
                        background: `${BLUE}12`, border: `1px solid ${BLUE}30`,
                        color: BLUE, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        fontFamily: "'Schibsted Grotesk', sans-serif",
                    }}
                >
                    {Icons.upload} Upload to Cloudinary
                </button>
                <input
                    ref={fileInputRef} type="file" accept="image/*" multiple
                    style={{ display: 'none' }}
                    onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
                />
            </div>

            {/* Drop zone — shown when no images yet */}
            {images.length === 0 && uploads.length === 0 && (
                <div
                    onDrop={onDrop} onDragOver={e => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        border: `2px dashed ${BLUE}40`, borderRadius: 12,
                        padding: '28px 20px', textAlign: 'center',
                        cursor: 'pointer', color: '#94a3b8',
                        background: `${BLUE}04`,
                        transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${BLUE}80`; e.currentTarget.style.background = `${BLUE}08` }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = `${BLUE}40`; e.currentTarget.style.background = `${BLUE}04` }}
                >
                    <div style={{ marginBottom: 8, opacity: 0.45 }}>{Icons.image}</div>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 4px', color: '#64748b', fontFamily: "'Schibsted Grotesk', sans-serif" }}>
                        Drop images here or click to upload
                    </p>
                    <p style={{ fontSize: 11, margin: 0, fontFamily: "'Schibsted Grotesk', sans-serif" }}>
                        Uploads to Cloudinary · served as WebP/AVIF with q_auto compression
                    </p>
                </div>
            )}

            {/* Thumbnail grid */}
            {images.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
                    onDrop={onDrop} onDragOver={e => e.preventDefault()}
                >
                    {images.map((img, i) => {
                        const src = resolveThumb(img, 200)
                        return (
                            <div
                                key={i}
                                className="img-thumb"
                                style={{
                                    position: 'relative', width: 72, height: 72,
                                    borderRadius: 10, overflow: 'hidden',
                                    background: '#f0f3f7',
                                    border: `2.5px solid ${i === 0 ? BLUE : '#e8e8e8'}`,
                                    flexShrink: 0,
                                }}
                            >
                                {src
                                    ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>{Icons.image}</div>
                                }

                                {i === 0 && (
                                    <div style={{
                                        position: 'absolute', bottom: 3, left: 3,
                                        background: BLUE, color: '#fff', borderRadius: 4,
                                        fontSize: 8, fontWeight: 700, padding: '1px 5px',
                                        fontFamily: "'Schibsted Grotesk', sans-serif",
                                        letterSpacing: 0.5, textTransform: 'uppercase',
                                        display: 'flex', alignItems: 'center', gap: 2,
                                    }}>
                                        {Icons.star} Cover
                                    </div>
                                )}

                                {/* Hover overlay */}
                                <div className="img-remove" style={{
                                    position: 'absolute', inset: 0,
                                    background: 'rgba(0,0,0,0.45)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                    opacity: 0, transition: 'opacity 0.18s',
                                }}>
                                    <button
                                        type="button" onClick={() => removeImage(i)} title="Remove"
                                        style={{ width: 26, height: 26, borderRadius: 6, background: RED, border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        {Icons.xSm}
                                    </button>
                                    {i !== 0 && (
                                        <button
                                            type="button" onClick={() => setCover(i)} title="Set as cover"
                                            style={{ width: 26, height: 26, borderRadius: 6, background: BLUE, border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            {Icons.star}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {/* Add more */}
                    <button
                        type="button" onClick={() => fileInputRef.current?.click()}
                        style={{
                            width: 72, height: 72, borderRadius: 10,
                            border: `2px dashed ${BLUE}35`, background: `${BLUE}06`,
                            color: `${BLUE}80`, cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                            fontSize: 10, fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600,
                        }}
                    >
                        {Icons.plus}<span>Add</span>
                    </button>
                </div>
            )}

            {/* Upload progress rows */}
            {uploads.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                    {uploads.map(u => (
                        <div key={u.id} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: u.error ? 2 : 5 }}>
                                <span style={{ fontSize: 11, color: '#64748b', fontFamily: "'Schibsted Grotesk', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '74%' }}>
                                    {u.name}
                                </span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: u.error ? RED : u.done ? '#16a34a' : BLUE, fontFamily: "'Schibsted Grotesk', sans-serif" }}>
                                    {u.error ? 'Failed' : u.done ? '✓' : `${u.progress}%`}
                                </span>
                            </div>
                            {!u.error && (
                                <div style={{ height: 3, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', borderRadius: 99,
                                        background: u.done ? '#16a34a' : BLUE,
                                        width: `${u.progress}%`,
                                        transition: 'width 0.2s ease',
                                    }} />
                                </div>
                            )}
                            {u.error && (
                                <p style={{ fontSize: 10, color: RED, margin: 0, fontFamily: "'Schibsted Grotesk', sans-serif" }}>{u.error}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Property Modal (Add / Edit) ───────────────────────────────────────────
function PropertyModal({ mode, initialForm, onSave, onClose }) {
    const [form, setForm] = useState(initialForm)
    const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

    function handleSubmit(e) {
        e.preventDefault()
        if (!form.title.trim()) { alert('Title is required.'); return }
        onSave(form)
    }

    return (
        <ModalOverlay onClose={onClose}>
            <div style={{
                background: '#fff', borderRadius: 20,
                width: 'min(640px, 96vw)', maxHeight: '92dvh',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
                animation: 'modalIn 0.28s ease',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 22px 14px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
                }}>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: DARK, fontFamily: "'Fraunces', serif" }}>
                        {mode === 'add' ? '＋ Add Property' : '✏ Edit Property'}
                    </h2>
                    <button onClick={onClose} style={{
                        width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: '#f1f5f9', color: '#64748b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {Icons.x}
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1, padding: '18px 22px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                    <MField label="Title *">
                        <MInput type="text" value={form.title} onChange={e => set('title', e.target.value)}
                            placeholder="e.g. Modern 3 Bedroom House in Kabulonga" required />
                    </MField>

                    <MField label="Location">
                        <MInput type="text" value={form.location} onChange={e => set('location', e.target.value)}
                            placeholder="e.g. Kabulonga, Lusaka" />
                    </MField>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                        <MField label="Listing Type">
                            <MSelect value={form.listingType} onChange={e => set('listingType', e.target.value)}>
                                {LISTING_TYPES.map(t => <option key={t}>{t}</option>)}
                            </MSelect>
                        </MField>
                        <MField label="Property Status">
                            <MSelect value={form.propertyStatus} onChange={e => set('propertyStatus', e.target.value)}>
                                {PROPERTY_STATUSES.map(t => <option key={t}>{t}</option>)}
                            </MSelect>
                        </MField>
                        <MField label="Property Type">
                            <MSelect value={form.propertyType} onChange={e => set('propertyType', e.target.value)}>
                                {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                            </MSelect>
                        </MField>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <MField label="Bedrooms">
                            <MInput type="number" min="0" max="20" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} placeholder="—" />
                        </MField>
                        <MField label="Bathrooms">
                            <MInput type="number" min="0" max="20" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} placeholder="—" />
                        </MField>
                        <MField label="Lot Size">
                            <MInput type="text" value={form.lotSize} onChange={e => set('lotSize', e.target.value)} placeholder="450 sqm" />
                        </MField>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 12 }}>
                        <MField label="Currency">
                            <MSelect value={form.currency} onChange={e => set('currency', e.target.value)}>
                                {CURRENCIES.map(c => <option key={c} value={c}>{c === '$' ? '$ USD' : 'K ZMW'}</option>)}
                            </MSelect>
                        </MField>
                        <MField label="Pricing Label">
                            <MInput type="text" value={form.pricing} onChange={e => set('pricing', e.target.value)} placeholder="e.g. $1,500 / month" />
                        </MField>
                    </div>

                    <MField label="Amenities (HTML or plain text)">
                        <textarea value={form.amenities} onChange={e => set('amenities', e.target.value)}
                            rows={3} placeholder="e.g. Swimming pool, DSTV, Borehole…"
                            style={{
                                width: '100%', padding: '9px 12px', fontSize: 13,
                                border: '1.5px solid #e2e8f0', borderRadius: 10,
                                fontFamily: "'Schibsted Grotesk', sans-serif", color: '#1e293b',
                                background: '#f8fafc', outline: 'none', resize: 'vertical',
                                lineHeight: 1.5, boxSizing: 'border-box',
                            }} />
                    </MField>

                    {/* ── Image Manager ── */}
                    <ImageManager
                        images={form.images}
                        onChange={imgs => set('images', typeof imgs === 'function' ? imgs(form.images) : imgs)}
                    />

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4, borderTop: '1px solid #f1f5f9', marginTop: 4 }}>
                        <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Schibsted Grotesk', sans-serif" }}>
                            Cancel
                        </button>
                        <button type="submit" style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: BLUE, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: "'Schibsted Grotesk', sans-serif" }}>
                            {mode === 'add' ? 'Add Property' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </ModalOverlay>
    )
}

// ── Confirm Modal ─────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <ModalOverlay onClose={onCancel}>
            <div style={{
                background: '#fff', borderRadius: 20, padding: '28px 28px 24px',
                width: 'min(380px, 92vw)', textAlign: 'center',
                boxShadow: '0 32px 80px rgba(0,0,0,0.25)', animation: 'modalIn 0.25s ease',
            }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${RED}15`, color: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    {Icons.warn}
                </div>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: DARK, margin: '0 0 8px' }}>{message}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 22px' }}>This only removes it from the list. Click "Save JSON" to persist.</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button onClick={onCancel} style={{ padding: '9px 20px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Schibsted Grotesk', sans-serif" }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: RED, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: "'Schibsted Grotesk', sans-serif" }}>
                        Delete
                    </button>
                </div>
            </div>
        </ModalOverlay>
    )
}

// ── ModalOverlay ──────────────────────────────────────────────────────────
function ModalOverlay({ onClose, children }) {
    return (
        <div
            className="modal-wrap"
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(10,20,40,0.6)', backdropFilter: 'blur(4px)',
                display: 'flex', justifyContent: 'center',
                padding: 16, animation: 'fadeIn 0.2s ease',
            }}
        >
            {children}
        </div>
    )
}

// ── Tiny shared components ────────────────────────────────────────────────
function Bubble({ icon, label }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 999, padding: '3px 10px',
            fontSize: 11, color: '#475569', fontWeight: 600,
            fontFamily: "'Schibsted Grotesk', sans-serif",
        }}>
            {icon} {label}
        </span>
    )
}

function FilterPill({ label, active, onClick }) {
    return (
        <button onClick={onClick} style={{
            padding: '6px 14px', borderRadius: 999,
            background: active ? BLUE : '#f1f5f9',
            color: active ? '#fff' : '#475569',
            border: active ? `1.5px solid ${BLUE}` : '1.5px solid #e2e8f0',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Schibsted Grotesk', sans-serif",
            transition: 'all 0.15s ease', whiteSpace: 'nowrap',
        }}>
            {label}
        </button>
    )
}

function HdrBtn({ onClick, disabled, bg, border, textColor = '#fff', icon, label }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '7px 14px', borderRadius: 999,
            background: bg, color: textColor,
            border: border || 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: 12, fontWeight: 600,
            fontFamily: "'Schibsted Grotesk', sans-serif",
            transition: 'all 0.15s ease',
        }}>
            {icon} <span className="hide-xs">{label}</span>
        </button>
    )
}

function GlassBtn({ onClick, color, title, children }) {
    return (
        <button onClick={onClick} title={title} style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(255,255,255,0.92)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color, backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}>
            {children}
        </button>
    )
}

function PageBtn({ onClick, disabled, active, children }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            width: 36, height: 36, borderRadius: 999,
            background: active ? BLUE : (disabled ? '#f1f5f9' : '#fff'),
            color: active ? '#fff' : (disabled ? '#cbd5e1' : '#475569'),
            border: active ? `1.5px solid ${BLUE}` : '1.5px solid #e2e8f0',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontWeight: 700, fontSize: 13,
            fontFamily: "'Schibsted Grotesk', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            {children}
        </button>
    )
}

function MField({ label, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
            {children}
        </div>
    )
}

function MInput(props) {
    return (
        <input style={{
            width: '100%', height: 40, padding: '0 12px',
            border: '1.5px solid #e2e8f0', borderRadius: 10,
            fontSize: 13, color: '#1e293b', background: '#f8fafc',
            fontFamily: "'Schibsted Grotesk', sans-serif",
            outline: 'none', boxSizing: 'border-box',
        }} {...props} />
    )
}

function MSelect({ children, ...props }) {
    return (
        <select style={{
            width: '100%', height: 40, padding: '0 12px',
            border: '1.5px solid #e2e8f0', borderRadius: 10,
            fontSize: 13, color: '#1e293b', background: '#f8fafc',
            fontFamily: "'Schibsted Grotesk', sans-serif",
            outline: 'none', boxSizing: 'border-box',
        }} {...props}>
            {children}
        </select>
    )
}

function Spinner({ size = 14, dark = false }) {
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            border: `2px solid ${dark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.3)'}`,
            borderTopColor: dark ? '#64748b' : '#fff',
            animation: 'spin 0.7s linear infinite', flexShrink: 0,
        }} />
    )
}