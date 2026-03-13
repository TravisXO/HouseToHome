import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'

// ── Brand ─────────────────────────────────────────────────────────────────
const BLUE = '#0b699c'
const RED = '#e92026'
const DARK = '#0a2540'

// ── Constants ─────────────────────────────────────────────────────────────
const LISTING_TYPES = ['Rent', 'Sale']
const PROPERTY_STATUSES = ['Residential', 'Commercial', 'Land', 'Investment']
const PROPERTY_TYPES = ['House', 'Apartment', 'Townhouse', 'Vacant Land', 'Farm', 'Commercial', 'Industrial']
const FURNISHING_STATUSES = ['', 'Furnished', 'Unfurnished', 'Semi-Furnished']
const CURRENCIES = ['$', 'K']
const PER_PAGE = 12

const STATUS_COLORS = {
    Residential: { bg: '#e0f2fe', text: '#0369a1' },
    Commercial: { bg: '#fef9c3', text: '#854d0e' },
    Land: { bg: '#dcfce7', text: '#166534' },
    Investment: { bg: '#f3e8ff', text: '#7e22ce' },
}

// ── Form ↔ JSON conversion ────────────────────────────────────────────────
function toForm(raw) {
    const isWix = raw.ID !== undefined && raw.Title !== undefined
    if (isWix) return wixToForm(raw)
    return camelToForm(raw)
}

function wixToForm(raw) {
    const listingType = arrFirst(raw['Listing Type'], 'Rent')
    return {
        _key: raw.ID || crypto.randomUUID(),
        _source: raw._source || 'legacy',
        id: raw.ID || '',
        title: raw.Title?.trim() || '',
        description: '',
        location: raw.Location?.trim() || '',
        listingType: listingType.toLowerCase() === 'buy' ? 'Sale' : listingType,
        propertyStatus: arrFirst(raw['Propety Status'], 'Residential'),
        propertyType: arrFirst(raw['Property Type'], 'House'),
        furnishingStatus: arrFirst(raw['Furnishing Status'], ''),
        bedrooms: raw.Bedrooms != null ? String(raw.Bedrooms) : '',
        bathrooms: raw.Bathroom != null ? String(raw.Bathroom) : '',
        lotSize: raw['Lot Size'] || '',
        currency: arrFirst(raw.Currency, '$'),
        pricingLabel: raw.Pricing || '',
        amenities: raw.Ammenities || '',
        images: (raw['Property Image'] || []).map(img =>
            typeof img === 'string'
                ? { publicId: '', secureUrl: '', src: img, alt: '' }
                : { publicId: '', secureUrl: '', src: img.src || img.Slug || img.slug || '', alt: img.alt || '' }
        ),
        videos: [],
    }
}

function camelToForm(raw) {
    return {
        _key: raw.id || crypto.randomUUID(),
        _source: raw._source || 'managed',
        id: raw.id || '',
        title: raw.title?.trim() || '',
        description: raw.description?.trim() || '',
        location: raw.location?.trim() || '',
        listingType: raw.listingType || 'Rent',
        propertyStatus: raw.propertyStatus || 'Residential',
        propertyType: raw.propertyType || 'House',
        furnishingStatus: raw.furnishingStatus || '',
        bedrooms: raw.bedrooms != null ? String(raw.bedrooms) : '',
        bathrooms: raw.bathrooms != null ? String(raw.bathrooms) : '',
        lotSize: raw.lotSize || '',
        currency: raw.currency || '$',
        pricingLabel: raw.pricingLabel || '',
        amenities: raw.amenities || '',
        images: raw.images || [],
        videos: raw.videos || [],
    }
}

function toJson(form) {
    return {
        id: form.id || form._key,
        slug: slugify(form.title) + '-' + (form.id || form._key).slice(0, 8),
        title: form.title,
        description: form.description,
        location: form.location,
        listingType: form.listingType,
        propertyStatus: form.propertyStatus,
        propertyType: form.propertyType,
        furnishingStatus: form.furnishingStatus,
        bedrooms: form.bedrooms !== '' ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms !== '' ? Number(form.bathrooms) : null,
        lotSize: form.lotSize,
        currency: form.currency,
        pricingLabel: form.pricingLabel,
        amenities: form.amenities,
        images: form.images.map(img => ({
            publicId: img.publicId || '',
            secureUrl: img.secureUrl || img.src || '',
            alt: img.alt || '',
        })),
        videos: form.videos.map(v => ({
            publicId: v.publicId || '',
            secureUrl: v.secureUrl || '',
        })),
        createdDate: new Date().toISOString(),
        _source: 'managed',
    }
}

function arrFirst(val, fallback) {
    if (Array.isArray(val)) return val[0] || fallback
    return val || fallback
}

function slugify(text) {
    return (text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
        .slice(0, 80)
}

const EMPTY_FORM = {
    _key: '', _source: 'managed',
    id: '', title: '', description: '', location: '',
    listingType: 'Rent', propertyStatus: 'Residential', propertyType: 'House',
    furnishingStatus: '', bedrooms: '', bathrooms: '',
    lotSize: '', currency: '$', pricingLabel: '', amenities: '',
    images: [], videos: [],
}

// ── Cloudinary helpers ────────────────────────────────────────────────────
function optimizeUrl(url, w = 800) {
    if (!url || !url.includes('res.cloudinary.com')) return url
    return url.replace('/upload/', `/upload/c_scale,w_${w},f_auto,q_auto/`)
}

function resolveThumb(img, w = 400) {
    const raw = typeof img === 'string'
        ? img
        : (img?.secureUrl || img?.src || img?.Slug || img?.slug || '')
    if (!raw) return null
    if (raw.includes('res.cloudinary.com')) return optimizeUrl(raw, w)
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    const wixM = raw.match(/wix:image:\/\/v1\/([^/]+)\//)
    if (wixM) return `https://static.wixstatic.com/media/${wixM[1]}`
    if (!raw.includes(':') && !raw.includes('/'))
        return `https://static.wixstatic.com/media/${raw}`
    return null
}

async function uploadMedia(file, onProgress) {
    const fd = new FormData()
    fd.append('file', file)
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = e => {
            if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText)
                resolve({ publicId: data.publicId, secureUrl: data.secureUrl, alt: file.name.replace(/\.[^/.]+$/, '') })
            } else {
                reject(new Error(`Upload failed (${xhr.status})`))
            }
        }
        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.open('POST', '/api/cloudinary/upload')
        xhr.send(fd)
    })
}

async function deleteMedia(publicId, resourceType = 'image') {
    if (!publicId) return
    try {
        await fetch('/api/cloudinary', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId, resourceType }),
        })
    } catch (_e) {
        // Non-fatal — media may be orphaned but data is clean
    }
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
    video: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>,
    upload: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>,
    chevL: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
    chevR: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
    x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    xSm: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    star: <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    play: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
    filter: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
    sort: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="9" y2="18" /></svg>,
    building: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="2" width="7" height="20" /><rect x="14" y="8" width="7" height="14" /><rect x="6" y="6" width="1" height="1" fill="currentColor" /><rect x="6" y="10" width="1" height="1" fill="currentColor" /><rect x="17" y="12" width="1" height="1" fill="currentColor" /></svg>,
}

// ── Shared UI Components ──────────────────────────────────────────────────
function Bubble({ icon, label }) {
    return (
        <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-0.5 text-[11px] text-slate-500 font-semibold font-body">
            {icon} {label}
        </span>
    )
}

function FilterPill({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold font-body transition-all duration-150 whitespace-nowrap border ${active
                ? 'bg-[#0b699c] text-white border-[#0b699c] shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:border-[#0b699c] hover:text-[#0b699c]'
                }`}
        >
            {label}
        </button>
    )
}

function Spinner({ size = 14, dark = false }) {
    const s = `${size}px`
    return (
        <div style={{ width: s, height: s, borderRadius: '50%', border: `2px solid ${dark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.3)'}`, borderTopColor: dark ? '#64748b' : '#fff', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
    )
}

function MField({ label, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
            {children}
        </div>
    )
}

function MInput(props) {
    return (
        <input
            className="w-full h-10 px-3 border-[1.5px] border-slate-200 rounded-xl text-[13px] text-slate-800 bg-slate-50 font-body outline-none focus:border-[#0b699c] focus:ring-2 focus:ring-[#0b699c]/10 transition-all"
            {...props}
        />
    )
}

function MSelect({ children, ...props }) {
    return (
        <select
            className="w-full h-10 px-3 border-[1.5px] border-slate-200 rounded-xl text-[13px] text-slate-800 bg-slate-50 font-body outline-none focus:border-[#0b699c] focus:ring-2 focus:ring-[#0b699c]/10 transition-all"
            {...props}
        >
            {children}
        </select>
    )
}

function GlassBtn({ onClick, color, title, children }) {
    return (
        <button
            onClick={onClick}
            title={title}
            style={{ color }}
            className="w-8 h-8 rounded-xl bg-white/90 border-0 cursor-pointer flex items-center justify-center backdrop-blur-sm shadow-md hover:scale-105 active:scale-95 transition-transform"
        >
            {children}
        </button>
    )
}

function PageBtn({ onClick, disabled, active, children }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] font-body border transition-all ${active
                ? 'bg-[#0b699c] text-white border-[#0b699c] shadow-sm'
                : disabled
                    ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-[#0b699c] hover:text-[#0b699c]'
                }`}
        >
            {children}
        </button>
    )
}

// ── Pagination helper — returns page numbers + '…' ellipsis markers ───────
function buildPageRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages = []
    // Always show first, last, current, and 1 neighbour on each side
    const show = new Set([1, total, current, current - 1, current + 1].filter(n => n >= 1 && n <= total))
    const sorted = [...show].sort((a, b) => a - b)
    for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) pages.push('…')
        pages.push(sorted[i])
    }
    return pages
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
    const [sortBy, setSortBy] = useState('default')
    const [page, setPage] = useState(1)
    const [modal, setModal] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [activeTab, setActiveTab] = useState('all')
    const [showFilters, setShowFilters] = useState(false)

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
        setTimeout(() => setToast(null), 4500)
    }

    async function handleSave() {
        setSaving(true)
        try {
            const rentItems = items.filter(it => it.listingType === 'Rent').map(toJson)
            const buyItems = items.filter(it => it.listingType !== 'Rent').map(toJson)
            const res = await fetch('/api/admin/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rent: rentItems, buy: buyItems }),
            })
            if (!res.ok) throw new Error(`Save failed: ${res.status}`)
            setItems(prev => prev.map(it => ({ ...it, _source: 'managed' })))
            setDirty(false)
            showToast('Saved → Rent.json + Buy.json ✓')
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
                ? [{ ...form, _source: 'managed' }, ...prev]
                : prev.map(it => it._key === form._key ? { ...form, _source: 'managed' } : it)
        )
        setDirty(true)
        setModal(null)
    }

    function confirmDelete(item) {
        setDeleteTarget({ key: item._key, id: item.id, images: item.images, videos: item.videos })
    }

    async function executeDelete() {
        const { key, id, images, videos } = deleteTarget
        if (id) {
            try { await fetch(`/api/admin/properties/${encodeURIComponent(id)}`, { method: 'DELETE' }) }
            catch (_e) { /* non-fatal */ }
        }
        const mediaToDelete = [
            ...(images || []).map(img => ({ publicId: img.publicId, type: 'image' })),
            ...(videos || []).map(v => ({ publicId: v.publicId, type: 'video' })),
        ].filter(m => m.publicId)
        await Promise.allSettled(mediaToDelete.map(m => deleteMedia(m.publicId, m.type)))
        setItems(prev => prev.filter(it => it._key !== key))
        setDirty(false)
        setDeleteTarget(null)
        showToast('Property deleted.')
    }

    // ── Filter + Sort + Tab ───────────────────────────────────────────────
    let filtered = items.filter(it => {
        const q = search.toLowerCase()
        const tabMatch = activeTab === 'all' || (activeTab === 'managed' && it._source === 'managed') || (activeTab === 'legacy' && it._source === 'legacy')
        return (
            tabMatch &&
            (!q || it.title.toLowerCase().includes(q) || it.location.toLowerCase().includes(q)) &&
            (!filterType || it.listingType === filterType) &&
            (!filterStatus || it.propertyStatus === filterStatus)
        )
    })

    if (sortBy === 'title-az') filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
    if (sortBy === 'title-za') filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title))
    if (sortBy === 'images') filtered = [...filtered].sort((a, b) => (b.images?.length || 0) - (a.images?.length || 0))

    const totalPages = Math.ceil(filtered.length / PER_PAGE)
    const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    function handleFilter(type, val) {
        if (type === 'type') setFilterType(v => v === val ? '' : val)
        if (type === 'status') setFilterStatus(v => v === val ? '' : val)
        setPage(1)
    }

    const legacyCount = items.filter(it => it._source === 'legacy').length
    const managedCount = items.filter(it => it._source === 'managed').length
    const rentCount = items.filter(it => it.listingType === 'Rent').length
    const saleCount = items.filter(it => it.listingType === 'Sale').length
    const hasActiveFilters = filterType || filterStatus || search

    return (
        <div className="min-h-screen bg-[#f4f6f9] font-body">

            {/* ── Sticky Header ── */}
            <header className="sticky top-0 z-30 bg-[#0a2540] border-b-[3px] border-[#e92026] shadow-2xl">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white"
                            style={{ background: `linear-gradient(135deg, ${RED}, ${BLUE})` }}>
                            {Icons.home}
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-display font-semibold text-white text-base sm:text-[17px] whitespace-nowrap">HouseToHome</span>
                            <span className="text-white/30 text-sm hidden sm:inline">/</span>
                            <span className="text-white/40 text-xs hidden sm:inline">Admin</span>
                        </div>
                        {dirty && (
                            <span className="flex-shrink-0 text-[10px] font-bold tracking-wide uppercase text-[#e92026] bg-[#e92026]/20 border border-[#e92026]/40 rounded-full px-2.5 py-0.5">
                                Unsaved
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={openAdd}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-[#0b699c] text-white text-xs font-semibold hover:bg-[#0957a0] active:scale-95 transition-all shadow-md"
                        >
                            {Icons.plus}
                            <span className="hidden sm:inline">Add Property</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !dirty}
                            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 ${dirty
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md'
                                : 'bg-white/8 text-white/40 border border-white/15 cursor-not-allowed'
                                }`}
                        >
                            {saving ? <Spinner size={13} /> : Icons.save}
                            <span className="hidden sm:inline">{saving ? 'Saving…' : 'Save JSON'}</span>
                        </button>
                        <Link
                            to="/"
                            className="flex items-center gap-1 text-white/35 hover:text-white/70 text-xs transition-colors ml-1"
                        >
                            {Icons.back}
                            <span className="hidden sm:inline">Site</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── Max-width wrapper ── */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6">

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
                    {[
                        { label: 'Total', value: items.length, color: DARK, accent: '#e0e9f2' },
                        { label: 'Managed', value: managedCount, color: BLUE, accent: '#dbeeff' },
                        { label: 'For Rent', value: rentCount, color: '#0891b2', accent: '#cffafe' },
                        { label: 'For Sale', value: saleCount, color: RED, accent: '#fee2e2' },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm border border-slate-100">
                            <div>
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
                                <p className="text-2xl font-bold font-display mt-0.5" style={{ color: s.color }}>{s.value}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.accent }}>
                                <span style={{ color: s.color }}>{Icons.building}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Info Banner ── */}
                <div className="mt-4 bg-[#0b699c]/6 border border-[#0b699c]/18 rounded-2xl px-4 py-3 flex items-start gap-3 text-[12px] text-slate-600">
                    <span className="text-[#0b699c] flex-shrink-0 mt-0.5">{Icons.info}</span>
                    <span>
                        <strong>Legacy</strong> properties come from{' '}
                        <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded-md">all-properties.json</code>.
                        Edit one and click <strong>Save JSON</strong> to migrate it — it will move to{' '}
                        <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded-md">Rent.json</code> or{' '}
                        <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded-md">Buy.json</code>.
                        Images and videos upload via the server to Cloudinary.
                    </span>
                </div>

                {/* ── Tabs ── */}
                <div className="mt-5 flex items-center gap-1 bg-white rounded-2xl p-1 shadow-sm border border-slate-100 w-fit">
                    {[
                        { key: 'all', label: `All (${items.length})` },
                        { key: 'managed', label: `Managed (${managedCount})` },
                        { key: 'legacy', label: `Legacy (${legacyCount})` },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setPage(1) }}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 font-body ${activeTab === tab.key
                                ? 'bg-[#0a2540] text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Search + Filter + Sort Bar ── */}
                <div className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Top row */}
                    <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                {Icons.search}
                            </span>
                            <input
                                type="text"
                                placeholder="Search by title or location…"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1) }}
                                className="w-full h-10 pl-10 pr-4 border-[1.5px] border-slate-200 rounded-xl text-[13px] text-slate-800 bg-slate-50 font-body outline-none focus:border-[#0b699c] focus:ring-2 focus:ring-[#0b699c]/10 transition-all"
                            />
                        </div>
                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 flex-shrink-0">{Icons.sort}</span>
                            <select
                                value={sortBy}
                                onChange={e => { setSortBy(e.target.value); setPage(1) }}
                                className="h-10 pl-3 pr-8 border-[1.5px] border-slate-200 rounded-xl text-[13px] text-slate-700 bg-slate-50 font-body outline-none focus:border-[#0b699c] transition-all appearance-none cursor-pointer"
                            >
                                <option value="default">Default order</option>
                                <option value="title-az">Title A → Z</option>
                                <option value="title-za">Title Z → A</option>
                                <option value="images">Most photos</option>
                            </select>
                        </div>
                        {/* Toggle Filters */}
                        <button
                            onClick={() => setShowFilters(v => !v)}
                            className={`flex items-center gap-2 px-4 h-10 rounded-xl text-[13px] font-semibold border transition-all flex-shrink-0 ${showFilters || hasActiveFilters
                                ? 'bg-[#0b699c]/10 border-[#0b699c]/30 text-[#0b699c]'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                        >
                            {Icons.filter}
                            <span>Filters</span>
                            {hasActiveFilters && (
                                <span className="w-4 h-4 rounded-full bg-[#0b699c] text-white text-[9px] font-bold flex items-center justify-center">
                                    {(filterType ? 1 : 0) + (filterStatus ? 1 : 0) + (search ? 1 : 0)}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Expandable Filter Panel */}
                    {showFilters && (
                        <div className="border-t border-slate-100 px-3 sm:px-4 py-3 flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-10 flex-shrink-0">Type</span>
                                <FilterPill label="For Rent" active={filterType === 'Rent'} onClick={() => handleFilter('type', 'Rent')} />
                                <FilterPill label="For Sale" active={filterType === 'Sale'} onClick={() => handleFilter('type', 'Sale')} />
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-10 flex-shrink-0">Status</span>
                                {PROPERTY_STATUSES.map(s => (
                                    <FilterPill key={s} label={s} active={filterStatus === s} onClick={() => handleFilter('status', s)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Results count + clear */}
                    <div className="border-t border-slate-50 px-4 py-2.5 flex items-center justify-between text-[12px] text-slate-400">
                        <span>
                            Showing <strong className="text-slate-600">{visible.length}</strong> of{' '}
                            <strong className="text-slate-600">{filtered.length}</strong> properties
                        </span>
                        {hasActiveFilters && (
                            <button
                                onClick={() => { setFilterType(''); setFilterStatus(''); setSearch(''); setPage(1) }}
                                className="text-[#e92026] font-semibold hover:underline"
                            >
                                Clear filters ×
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Card Grid ── */}
                <main className="py-5 pb-16">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                            <Spinner size={28} dark />
                            <p className="mt-4 text-sm">Loading properties…</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-center">
                            <div className="text-5xl mb-4">🏠</div>
                            <p className="font-display text-lg text-slate-500 mb-2">No properties found</p>
                            <p className="text-sm">Make sure <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">all-properties.json</code>, <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">Rent.json</code>, or <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">Buy.json</code> exist.</p>
                        </div>
                    ) : visible.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-center">
                            <div className="text-5xl mb-4">🔍</div>
                            <p className="font-display text-lg text-slate-500">No properties match your filters</p>
                            <button onClick={() => { setFilterType(''); setFilterStatus(''); setSearch(''); setPage(1) }} className="mt-3 text-[#0b699c] text-sm font-semibold hover:underline">
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {visible.map(item => (
                                <AdminCard
                                    key={item._key}
                                    item={item}
                                    onEdit={() => openEdit(item)}
                                    onDelete={() => confirmDelete(item)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-1.5 mt-10 flex-wrap">
                            <PageBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{Icons.chevL}</PageBtn>
                            {buildPageRange(page, totalPages).map((n, i) =>
                                n === '…'
                                    ? <span key={`ellipsis-${i}`} className="w-8 text-center text-slate-400 text-sm select-none">…</span>
                                    : <PageBtn key={n} onClick={() => setPage(n)} active={n === page}>{n}</PageBtn>
                            )}
                            <PageBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{Icons.chevR}</PageBtn>
                        </div>
                    )}
                </main>
            </div>

            {/* ── FAB (mobile) ── */}
            <button
                onClick={openAdd}
                className="fixed bottom-6 right-5 z-20 sm:hidden w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: `linear-gradient(135deg, ${BLUE}, #0957a0)` }}
                aria-label="Add property"
            >
                {Icons.plus}
            </button>

            {/* ── Modals ── */}
            {modal && (
                <PropertyModal mode={modal.mode} initialForm={modal.form} onSave={handleModalSave} onClose={() => setModal(null)} />
            )}
            {deleteTarget && (
                <ConfirmModal
                    message="Delete this property?"
                    subtext={`This will also delete ${([...(deleteTarget.images || []), ...(deleteTarget.videos || [])]).filter(m => m.publicId).length} Cloudinary asset(s).`}
                    onConfirm={executeDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {/* ── Toast ── */}
            {toast && (
                <div
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-5 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-white text-sm font-semibold shadow-2xl"
                    style={{ background: toast.type === 'err' ? RED : '#16a34a', animation: 'toastIn 0.3s ease' }}
                >
                    {toast.type === 'err' ? Icons.info : Icons.check}
                    {toast.msg}
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,400&family=Schibsted+Grotesk:wght@400;500;600;700&display=swap');
                *, *::before, *::after { box-sizing: border-box; }
                .font-body { font-family: 'Schibsted Grotesk', sans-serif; }
                .font-display { font-family: 'Fraunces', serif; }
                @keyframes toastIn { from { opacity:0; transform:translateY(10px) translateX(-50%) } to { opacity:1; transform:translateY(0) translateX(-50%) } }
                @keyframes modalIn { from { opacity:0; transform:translateY(-12px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
                @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
                @keyframes spin    { to { transform:rotate(360deg) } }
                @media (min-width: 640px) {
                    @keyframes toastIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
                }
                .prop-card:hover .card-hover-btns { opacity: 1 !important; }
                .card-always-btns { display: flex; }
                @media (min-width: 640px) {
                    .card-always-btns { display: none; }
                    .card-hover-btns { display: flex; }
                }
                .img-thumb:hover .img-overlay { opacity: 1 !important; }
                .modal-wrap { align-items: flex-end; }
                @media (min-width: 640px) { .modal-wrap { align-items: center; } }
                select { appearance: none; -webkit-appearance: none; }
            `}</style>
        </div>
    )
}

// ── Admin Property Card ───────────────────────────────────────────────────
function AdminCard({ item, onEdit, onDelete }) {
    const thumb = item.images?.[0] ? resolveThumb(item.images[0], 400) : null
    const isRent = item.listingType === 'Rent'
    const statusStyle = STATUS_COLORS[item.propertyStatus] || { bg: '#f1f5f9', text: '#475569' }
    const isLegacy = item._source === 'legacy'
    const hasVideo = item.videos?.length > 0

    return (
        <div
            className="prop-card group bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-250 hover:shadow-xl hover:-translate-y-1 flex flex-col"
            style={{ borderColor: isLegacy ? 'rgba(0,0,0,0.06)' : `${BLUE}28` }}
        >
            {/* Image */}
            <div className="relative h-44 flex-shrink-0 overflow-hidden bg-slate-100">
                {thumb
                    ? <img src={thumb} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                    : (
                        <div className="w-full h-full flex items-center justify-center text-white/40"
                            style={{ background: `linear-gradient(135deg, ${BLUE}44, ${BLUE}88)` }}>
                            {Icons.image}
                        </div>
                    )
                }

                {/* Top-left badges */}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span
                        className="text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase"
                        style={{ background: isRent ? BLUE : RED }}
                    >
                        {item.listingType}
                    </span>
                    {hasVideo && (
                        <span className="bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            {Icons.play} Video
                        </span>
                    )}
                </div>

                {/* Top-right status */}
                <div className="absolute top-2.5 right-2.5">
                    <span
                        className="text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full"
                        style={{ background: statusStyle.bg, color: statusStyle.text }}
                    >
                        {item.propertyStatus}
                    </span>
                </div>

                {/* Legacy badge */}
                {isLegacy && (
                    <div className="absolute bottom-2.5 left-2.5">
                        <span className="bg-black/50 backdrop-blur-sm text-white/80 text-[9px] font-bold tracking-wide uppercase px-2 py-1 rounded-full">
                            Legacy — edit to migrate
                        </span>
                    </div>
                )}

                {/* Hover action buttons */}
                <div className="card-hover-btns absolute bottom-2.5 right-2.5 gap-1.5 opacity-0 transition-opacity duration-200">
                    <GlassBtn onClick={onEdit} color={BLUE} title="Edit">{Icons.edit}</GlassBtn>
                    <GlassBtn onClick={onDelete} color={RED} title="Delete">{Icons.trash}</GlassBtn>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-2.5 flex-1">
                <div>
                    <p className="font-display text-[15px] font-semibold leading-snug text-[#0a2540] break-words">
                        {item.title || <em className="text-slate-400">Untitled</em>}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-1">📍 {item.location || '—'}</p>
                </div>

                {/* Price strip */}
                <div className="bg-gradient-to-r from-[#f0f7ff] to-[#e8f4ff] rounded-xl px-3 py-2 flex items-center justify-between">
                    <span className="font-display text-base font-bold text-[#0b699c]">
                        {item.pricingLabel || '—'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                        {item.propertyType}
                    </span>
                </div>

                {/* Bubbles */}
                <div className="flex flex-wrap gap-1.5">
                    {item.bedrooms && <Bubble icon={Icons.bed} label={`${item.bedrooms} bed`} />}
                    {item.bathrooms && <Bubble icon={Icons.bath} label={`${item.bathrooms} bath`} />}
                    {item.lotSize && <Bubble icon={Icons.area} label={item.lotSize} />}
                    {item.images?.length > 0 && <Bubble icon={Icons.image} label={`${item.images.length} photo${item.images.length !== 1 ? 's' : ''}`} />}
                    {item.videos?.length > 0 && <Bubble icon={Icons.video} label={`${item.videos.length} video${item.videos.length !== 1 ? 's' : ''}`} />}
                </div>

                {item.description && (
                    <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2">{item.description}</p>
                )}

                {/* Mobile action buttons (always visible on touch) */}
                <div className="card-always-btns gap-2 mt-auto pt-2">
                    <button
                        onClick={onEdit}
                        className="flex-1 h-9 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        style={{ background: `${BLUE}12`, border: `1px solid ${BLUE}25`, color: BLUE }}
                    >
                        {Icons.edit} Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex-1 h-9 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        style={{ background: `${RED}10`, border: `1px solid ${RED}20`, color: RED }}
                    >
                        {Icons.trash} Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Media Manager ─────────────────────────────────────────────────────────
function MediaManager({ label, accept, items, onChange, isVideo = false }) {
    const fileInputRef = useRef(null)
    const [uploads, setUploads] = useState([])

    function removeItem(idx) {
        const item = items[idx]
        if (item?.publicId) deleteMedia(item.publicId, isVideo ? 'video' : 'image')
        onChange(items.filter((_, i) => i !== idx))
    }

    function setCover(idx) {
        if (idx === 0 || isVideo) return
        const next = [...items]
        const [img] = next.splice(idx, 1)
        next.unshift(img)
        onChange(next)
    }

    async function handleFiles(files) {
        const fileArr = Array.from(files)
        const ids = fileArr.map(() => crypto.randomUUID())
        setUploads(prev => [...prev, ...fileArr.map((f, i) => ({ id: ids[i], name: f.name, progress: 0, error: null, done: false }))])
        await Promise.allSettled(fileArr.map((file, i) =>
            uploadMedia(file, pct =>
                setUploads(prev => prev.map(u => u.id === ids[i] ? { ...u, progress: pct } : u))
            )
                .then(mediaObj => {
                    onChange(prev => [...prev, mediaObj])
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
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {label} {items.length > 0 && <span className="text-[#0b699c]">({items.length})</span>}
                </label>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                    style={{ background: `${BLUE}12`, border: `1px solid ${BLUE}30`, color: BLUE }}
                >
                    {Icons.upload} Upload via Server
                </button>
                <input
                    ref={fileInputRef} type="file" accept={accept} multiple
                    className="hidden"
                    onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
                />
            </div>

            {/* Drop zone */}
            {items.length === 0 && uploads.length === 0 && (
                <div
                    onDrop={onDrop} onDragOver={e => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-2xl py-8 px-5 text-center cursor-pointer text-slate-400 transition-all hover:border-[#0b699c]/60 hover:bg-[#0b699c]/4 group"
                    style={{ borderColor: `${BLUE}40`, background: `${BLUE}03` }}
                >
                    <div className="mb-2 opacity-40 flex justify-center">{isVideo ? Icons.video : Icons.image}</div>
                    <p className="text-[13px] font-semibold text-slate-500">
                        Drop {isVideo ? 'videos' : 'images'} here or click to upload
                    </p>
                    <p className="text-[11px] mt-1">Uploaded via server · stored in Cloudinary with f_auto, q_auto</p>
                </div>
            )}

            {/* Thumbnails */}
            {items.length > 0 && (
                <div className="flex flex-wrap gap-2" onDrop={onDrop} onDragOver={e => e.preventDefault()}>
                    {items.map((item, i) => {
                        const src = isVideo ? null : resolveThumb(item, 200)
                        return (
                            <div
                                key={i}
                                className="img-thumb relative w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0"
                                style={{
                                    background: isVideo ? '#1e1b4b' : '#f0f3f7',
                                    border: `2.5px solid ${i === 0 && !isVideo ? BLUE : '#e8e8e8'}`,
                                }}
                            >
                                {!isVideo && src
                                    ? <img src={src} alt="" className="w-full h-full object-cover block" />
                                    : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-1" style={{ color: isVideo ? '#a5b4fc' : '#ccc' }}>
                                            {isVideo ? Icons.play : Icons.image}
                                            {isVideo && <span className="text-[8px] text-indigo-300">Video</span>}
                                        </div>
                                    )
                                }
                                {i === 0 && !isVideo && (
                                    <div className="absolute bottom-1 left-1 text-white text-[8px] font-bold uppercase tracking-wide px-1 py-0.5 rounded flex items-center gap-0.5"
                                        style={{ background: BLUE }}>
                                        Cover
                                    </div>
                                )}
                                <div className="img-overlay absolute inset-0 bg-black/45 flex items-center justify-center gap-1 opacity-0 transition-opacity duration-150">
                                    <button type="button" onClick={() => removeItem(i)} title="Remove"
                                        className="w-6 h-6 rounded-md flex items-center justify-center text-white cursor-pointer border-0"
                                        style={{ background: RED }}>
                                        {Icons.xSm}
                                    </button>
                                    {i !== 0 && !isVideo && (
                                        <button type="button" onClick={() => setCover(i)} title="Set as cover"
                                            className="w-6 h-6 rounded-md flex items-center justify-center text-white cursor-pointer border-0"
                                            style={{ background: BLUE }}>
                                            {Icons.star}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {/* Add more button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-[72px] h-[72px] rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-semibold cursor-pointer border-2 border-dashed transition-colors"
                        style={{ borderColor: `${BLUE}35`, background: `${BLUE}06`, color: `${BLUE}80` }}
                    >
                        {Icons.plus}
                        <span>Add</span>
                    </button>
                </div>
            )}

            {/* Upload progress */}
            {uploads.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-1">
                    {uploads.map(u => (
                        <div key={u.id} className="bg-slate-50 rounded-xl px-3 py-2">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] text-slate-500 truncate max-w-[74%]">{u.name}</span>
                                <span className={`text-[11px] font-bold ${u.error ? 'text-[#e92026]' : u.done ? 'text-emerald-600' : 'text-[#0b699c]'}`}>
                                    {u.error ? 'Failed' : u.done ? '✓' : `${u.progress}%`}
                                </span>
                            </div>
                            {!u.error && (
                                <div className="h-[3px] bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-200"
                                        style={{ width: `${u.progress}%`, background: u.done ? '#16a34a' : BLUE }}
                                    />
                                </div>
                            )}
                            {u.error && <p className="text-[10px] text-[#e92026] mt-0.5">{u.error}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Property Modal ────────────────────────────────────────────────────────
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
            <div className="bg-white rounded-3xl w-full max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl"
                style={{ maxWidth: 'min(680px, 96vw)', animation: 'modalIn 0.28s ease' }}>

                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <h2 className="font-display text-[17px] font-bold text-[#0a2540]">
                        {mode === 'add' ? '＋ Add Property' : '✏ Edit Property'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors border-0 cursor-pointer"
                    >
                        {Icons.x}
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 sm:px-6 py-5 flex flex-col gap-4">
                    <MField label="Title *">
                        <MInput type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Modern 3 Bedroom House in Kabulonga" required />
                    </MField>

                    <MField label="Location">
                        <MInput type="text" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Kabulonga, Lusaka" />
                    </MField>

                    <MField label="Description">
                        <textarea
                            value={form.description}
                            onChange={e => set('description', e.target.value)}
                            rows={4}
                            placeholder="Describe the property — neighbourhood, highlights, nearby amenities…"
                            className="w-full px-3 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-[13px] text-slate-800 bg-slate-50 font-body outline-none resize-vertical leading-relaxed focus:border-[#0b699c] focus:ring-2 focus:ring-[#0b699c]/10 transition-all"
                            style={{ boxSizing: 'border-box' }}
                        />
                    </MField>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                        <MField label="Furnishing">
                            <MSelect value={form.furnishingStatus} onChange={e => set('furnishingStatus', e.target.value)}>
                                {FURNISHING_STATUSES.map(t => <option key={t} value={t}>{t || '— None —'}</option>)}
                            </MSelect>
                        </MField>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
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

                    <div className="grid gap-3" style={{ gridTemplateColumns: '90px 1fr' }}>
                        <MField label="Currency">
                            <MSelect value={form.currency} onChange={e => set('currency', e.target.value)}>
                                {CURRENCIES.map(c => <option key={c} value={c}>{c === '$' ? '$ USD' : 'K ZMW'}</option>)}
                            </MSelect>
                        </MField>
                        <MField label="Pricing Label">
                            <MInput type="text" value={form.pricingLabel} onChange={e => set('pricingLabel', e.target.value)} placeholder="e.g. $1,500 / month" />
                        </MField>
                    </div>

                    <MField label="Amenities (HTML or plain text)">
                        <textarea
                            value={form.amenities}
                            onChange={e => set('amenities', e.target.value)}
                            rows={3}
                            placeholder="e.g. Swimming pool, DSTV, Borehole, 24/7 security…"
                            className="w-full px-3 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-[13px] text-slate-800 bg-slate-50 font-body outline-none resize-vertical leading-relaxed focus:border-[#0b699c] focus:ring-2 focus:ring-[#0b699c]/10 transition-all"
                            style={{ boxSizing: 'border-box' }}
                        />
                    </MField>

                    <MediaManager
                        label="Photos"
                        accept="image/*"
                        items={form.images}
                        onChange={imgs => set('images', typeof imgs === 'function' ? imgs(form.images) : imgs)}
                        isVideo={false}
                    />

                    <MediaManager
                        label="Videos"
                        accept="video/*"
                        items={form.videos}
                        onChange={vids => set('videos', typeof vids === 'function' ? vids(form.videos) : vids)}
                        isVideo={true}
                    />

                    {/* Form Actions */}
                    <div className="flex gap-2.5 justify-end pt-2 border-t border-slate-100 mt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 text-slate-500 text-[13px] font-semibold font-body hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-xl text-white text-[13px] font-bold font-body border-0 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                            style={{ background: BLUE }}
                        >
                            {mode === 'add' ? 'Add Property' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </ModalOverlay>
    )
}

// ── Confirm Modal ─────────────────────────────────────────────────────────
function ConfirmModal({ message, subtext, onConfirm, onCancel }) {
    return (
        <ModalOverlay onClose={onCancel}>
            <div className="bg-white rounded-3xl p-7 text-center shadow-2xl" style={{ width: 'min(400px, 92vw)', animation: 'modalIn 0.25s ease' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${RED}15`, color: RED }}>
                    {Icons.warn}
                </div>
                <p className="font-display text-[16px] font-bold text-[#0a2540] mb-1.5">{message}</p>
                {subtext && <p className="text-[12px] text-slate-400 mb-6">{subtext}</p>}
                <div className="flex gap-2.5 justify-center">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 text-slate-500 text-[13px] font-semibold font-body cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2 rounded-xl text-white text-[13px] font-bold font-body border-0 cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ background: RED }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </ModalOverlay>
    )
}

// ── Modal Overlay ─────────────────────────────────────────────────────────
function ModalOverlay({ onClose, children }) {
    return (
        <div
            className="modal-wrap fixed inset-0 z-[1000] flex justify-center p-4 sm:p-6"
            style={{ background: 'rgba(10,20,40,0.65)', backdropFilter: 'blur(6px)', animation: 'fadeIn 0.2s ease' }}
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
            {children}
        </div>
    )
}