import { useState, useEffect, useCallback, useReducer } from 'react'
import { useLocation, useSearchParams, Link } from 'react-router-dom'
import PropertyCard from '../components/properties/PropertyCard'

const BLUE = '#0b699c'
const RED = '#e92026'

// ── JSON normalisation (mirrors AdminPage) ────────────────────────────
function arrFirst(val, fb = '') {
    return Array.isArray(val) ? val[0] || fb : val || fb
}

function parsePrice(label) {
    if (!label) return null
    const m = label.match(/([\d,.]+)\s*million/i)
    if (m) { const n = parseFloat(m[1].replace(/,/g, '')); return isNaN(n) ? null : n * 1_000_000 }
    const n2 = label.match(/[\d,]+(\.\d+)?/)
    if (n2) { const n = parseFloat(n2[0].replace(/,/g, '')); return isNaN(n) ? null : n }
    return null
}

function normaliseProperty(raw) {
    // Detect format: managed (camelCase) vs legacy Wix (uppercase keys)
    const isManaged = raw._source === 'managed' || raw.id !== undefined

    if (isManaged) {
        const pricingLabel = raw.pricingLabel?.trim() || ''
        const lt = raw.listingType || 'Rent'
        return {
            id: raw.id || '',
            slug: raw.slug?.trim() || raw.id || '',
            title: raw.title?.trim() || '',
            location: raw.location?.trim() || '',
            listingType: lt.toLowerCase() === 'buy' ? 'Sale' : lt,
            propertyStatus: raw.propertyStatus || 'Residential',
            propertyType: raw.propertyType || 'House',
            furnishingStatus: raw.furnishingStatus || '',
            bedrooms: raw.bedrooms ?? null,
            bathrooms: raw.bathrooms ?? null,
            lotSize: raw.lotSize?.trim() || '',
            currency: raw.currency || '$',
            pricingLabel,
            price: parsePrice(pricingLabel),
            amenities: raw.amenities?.trim() || '',
            addressFormatted: raw.location?.trim() || '',
            images: raw.images || [],
        }
    }

    // Legacy Wix format
    const lt = arrFirst(raw['Listing Type'], 'Rent')
    const pricingLabel = raw.Pricing?.trim() || ''
    return {
        id: raw.ID || '',
        slug: raw.Slug?.trim() || raw.ID || '',
        title: raw.Title?.trim() || '',
        location: raw.Location?.trim() || '',
        listingType: lt.toLowerCase() === 'buy' ? 'Sale' : lt,
        propertyStatus: arrFirst(raw['Propety Status'], 'Residential'),
        propertyType: arrFirst(raw['Property Type'], 'House'),
        furnishingStatus: arrFirst(raw['Furnishing Status'], ''),
        bedrooms: raw.Bedrooms ?? null,
        bathrooms: raw.Bathroom ?? null,
        lotSize: raw['Lot Size']?.trim() || '',
        currency: arrFirst(raw.Currency, '$'),
        pricingLabel,
        price: parsePrice(pricingLabel),
        amenities: raw.Ammenities?.trim() || '',
        addressFormatted: raw.Location?.trim() || '',
        images: raw['Property Image'] || [],
    }
}

const ROUTE_CONFIG = {
    '/residential-rent': {
        label: 'Residential For Rent',
        sublabel: 'Homes & Apartments',
        listingType: 'Rent',
        propertyStatus: 'Residential',
        description: 'Houses and apartments available for rent across Lusaka.',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    '/commercial-rent': {
        label: 'Commercial For Rent',
        sublabel: 'Offices & Retail',
        listingType: 'Rent',
        propertyStatus: 'Commercial',
        description: 'Office spaces, retail units and warehouses for rent.',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
        ),
    },
    '/residential-sale': {
        label: 'Residential For Sale',
        sublabel: 'Buy a Home',
        listingType: 'Buy',
        propertyStatus: 'Residential',
        description: 'Houses and apartments available for purchase.',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    '/land-sale': {
        label: 'Land For Sale',
        sublabel: 'Plots & Farms',
        listingType: 'Buy',
        propertyStatus: 'Land',
        description: 'Serviced and unserviced land available across Zambia.',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 22h20" />
                <path d="M6.36 17.4 4 17l-.75-3.75L2 10l4.5-2L9 3l3 3 4-2 2.5 3L22 8l-1.5 4-1 3.5-2.5.5" />
            </svg>
        ),
    },
    '/commercial-sale': {
        label: 'Commercial For Sale',
        sublabel: 'Business Properties',
        listingType: 'Buy',
        propertyStatus: 'Commercial',
        description: 'Commercial properties available for purchase.',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
        ),
    },
    '/investments': {
        label: 'Investment Properties',
        sublabel: 'High-Yield Assets',
        listingType: 'Buy',
        propertyStatus: 'Investment',
        description: 'High-yield investment and income-generating properties.',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        ),
    },
}

const PAGE_SIZE = 12
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
]

// ── Filter state via useReducer ───────────────────────────────────────────────
// Using a reducer means the route-change effect only calls dispatch() once,
// satisfying the react-hooks/set-state-in-effect lint rule.

function initFilters(searchParams) {
    return {
        page: 1,
        sort: 'newest',
        propertyType: searchParams.get('propertyType') || '',
        currency: searchParams.get('currency') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        bedrooms: searchParams.get('bedrooms') ? `${searchParams.get('bedrooms')}+` : '',
        bathrooms: searchParams.get('bathrooms') ? `${searchParams.get('bathrooms')}+` : '',
        search: searchParams.get('q') || '',
        searchDraft: searchParams.get('q') || '',
    }
}

function filtersReducer(state, action) {
    switch (action.type) {
        case 'INIT': return { ...action.payload }
        case 'SET': return { ...state, [action.field]: action.value }
        case 'CLEAR': return { ...action.payload }
        default: return state
    }
}

export default function PropertyListingPage() {
    const { pathname } = useLocation()
    const [searchParams] = useSearchParams()
    const config = ROUTE_CONFIG[pathname]

    // ── All filter fields in one reducer ──
    const [filters, dispatch] = useReducer(filtersReducer, searchParams, initFilters)
    const { page, sort, propertyType, currency, minPrice, maxPrice, bedrooms, bathrooms, search, searchDraft } = filters

    // ── Named setter wrappers so existing JSX below needs no changes ──
    const setPage = useCallback((v) => dispatch({ type: 'SET', field: 'page', value: typeof v === 'function' ? v(filters.page) : v }), [filters.page])
    const setSort = useCallback((v) => dispatch({ type: 'SET', field: 'sort', value: v }), [])
    const setPropertyType = useCallback((v) => dispatch({ type: 'SET', field: 'propertyType', value: v }), [])
    const setCurrency = useCallback((v) => dispatch({ type: 'SET', field: 'currency', value: v }), [])
    const setMinPrice = useCallback((v) => dispatch({ type: 'SET', field: 'minPrice', value: v }), [])
    const setMaxPrice = useCallback((v) => dispatch({ type: 'SET', field: 'maxPrice', value: v }), [])
    const setBedrooms = useCallback((v) => dispatch({ type: 'SET', field: 'bedrooms', value: v }), [])
    const setBathrooms = useCallback((v) => dispatch({ type: 'SET', field: 'bathrooms', value: v }), [])
    const setSearch = useCallback((v) => dispatch({ type: 'SET', field: 'search', value: v }), [])
    const setSearchDraft = useCallback((v) => dispatch({ type: 'SET', field: 'searchDraft', value: v }), [])

    // ── Fetch state — single object so setFetchState is called once per fetch ──
    const [fetchState, setFetchState] = useState({ properties: [], total: 0, pages: 1, loading: true, error: null })
    const { properties, total, pages, loading, error } = fetchState

    const [filtersOpen, setFiltersOpen] = useState(false)

    const activeFilterCount = [propertyType, currency, minPrice, maxPrice, bedrooms, bathrooms, search].filter(Boolean).length

    // ── Route change: reset all filters — single dispatch, not multiple setStates ──
    useEffect(() => {
        dispatch({ type: 'INIT', payload: initFilters(searchParams) })
    }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── retryCount bumped by the retry button to re-trigger the effect ──────
    const [retryCount, setRetryCount] = useState(0)

    // ── Fetch + client-side filter — all state updates inside async callbacks ─
    useEffect(() => {
        if (!config) return
        let cancelled = false

        fetch('/api/admin/properties')
            .then(res => { if (!res.ok) throw new Error('Failed to load properties'); return res.json() })
            .then(raw => {
                if (cancelled) return

                let all = raw.map(normaliseProperty)

                // Route filter
                const configLt = config.listingType.toLowerCase()
                all = all.filter(p => {
                    const lt = p.listingType.toLowerCase()
                    const ltMatch = lt === configLt || (configLt === 'buy' && (lt === 'sale' || lt === 'buy'))
                    return ltMatch && p.propertyStatus === config.propertyStatus
                })

                // Additional filters
                if (propertyType) all = all.filter(p => p.propertyType === propertyType)
                if (currency) all = all.filter(p => p.currency === currency)
                if (minPrice) all = all.filter(p => p.price != null && p.price >= Number(minPrice))
                if (maxPrice) all = all.filter(p => p.price != null && p.price <= Number(maxPrice))
                if (bedrooms) all = all.filter(p => p.bedrooms != null && p.bedrooms >= Number(bedrooms.replace('+', '')))
                if (bathrooms) all = all.filter(p => p.bathrooms != null && p.bathrooms >= Number(bathrooms.replace('+', '')))
                if (search) {
                    const q = search.toLowerCase()
                    all = all.filter(p =>
                        p.title.toLowerCase().includes(q) ||
                        p.location.toLowerCase().includes(q)
                    )
                }

                // Sort
                if (sort === 'price_asc') all.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
                if (sort === 'price_desc') all.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity))
                if (sort === 'newest') all.reverse()

                // Paginate
                const total = all.length
                const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
                const items = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

                setFetchState({ properties: items, total, pages, loading: false, error: null })
            })
            .catch(err => {
                if (!cancelled) setFetchState(prev => ({ ...prev, loading: false, error: err.message }))
            })

        return () => { cancelled = true }
    }, [config, page, propertyType, currency, minPrice, maxPrice, bedrooms, bathrooms, search, sort, retryCount])

    function handleSearch(e) {
        e.preventDefault()
        setSearch(searchDraft)
        setPage(1)
    }

    function clearAll() {
        dispatch({ type: 'CLEAR', payload: initFilters(new URLSearchParams()) })
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (!config) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '80px 24px' }}>
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', color: '#333' }}>Page not found.</p>
                <Link to="/" style={{ color: BLUE, fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '14px' }}>← Back to Home</Link>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f7f8fa' }}>

            {/* ── Hero Header ── */}
            <div style={{
                background: `linear-gradient(135deg, #072f4a 0%, ${BLUE} 60%, #0e7fc2 100%)`,
                position: 'relative',
                overflow: 'hidden',
                paddingBottom: '0',
            }}>
                {/* Decorative background circles */}
                <div style={{
                    position: 'absolute', top: '-60px', right: '-60px',
                    width: '360px', height: '360px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-80px', left: '30%',
                    width: '280px', height: '280px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.03)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', top: '20px', left: '15%',
                    width: '140px', height: '140px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.03)',
                    pointerEvents: 'none',
                }} />

                <div className="listing-hero-inner" style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 32px 40px', position: 'relative' }}>

                    {/* Breadcrumb */}
                    <div className="listing-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
                        <Link to="/"
                            style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                        >
                            Home
                        </Link>
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>›</span>
                        <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
                            {config.label}
                        </span>
                    </div>

                    {/* Title row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '12px' }}>
                        <div className="listing-hero-icon" style={{
                            width: '56px', height: '56px', borderRadius: '14px',
                            background: 'rgba(255,255,255,0.12)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', flexShrink: 0,
                            border: '1px solid rgba(255,255,255,0.18)',
                        }}>
                            {config.icon}
                        </div>
                        <div>
                            <div style={{
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em',
                                textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)',
                                marginBottom: '4px',
                            }}>
                                {config.sublabel}
                            </div>
                            <h1 className="listing-hero-title" style={{
                                fontFamily: "'Fraunces', serif",
                                fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
                                fontWeight: 700,
                                color: '#fff',
                                margin: 0,
                                lineHeight: 1.1,
                                letterSpacing: '-0.02em',
                            }}>
                                {config.label}
                            </h1>
                        </div>
                    </div>

                    <p className="listing-hero-desc" style={{
                        fontFamily: "'Schibsted Grotesk', sans-serif",
                        fontSize: '14px', color: 'rgba(255,255,255,0.65)',
                        margin: '0 0 0 76px',
                    }}>
                        {config.description}
                        {!loading && (
                            <span style={{ marginLeft: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                                — {total} listing{total !== 1 ? 's' : ''} found
                            </span>
                        )}
                    </p>
                </div>

                {/* ── Integrated Search Bar ── */}
                <div className="listing-search-wrap" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px' }}>
                    <form
                        onSubmit={handleSearch}
                        style={{
                            display: 'flex', gap: '0',
                            background: '#fff',
                            borderRadius: '12px 12px 0 0',
                            overflow: 'hidden',
                            boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
                        }}
                    >
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 18px', gap: '10px', borderRight: '1px solid #eee' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                className="search-bar-input"
                                type="text"
                                placeholder="Search by location, title, or neighbourhood…"
                                value={searchDraft}
                                onChange={e => setSearchDraft(e.target.value)}
                                style={{
                                    flex: 1, border: 'none', outline: 'none', padding: '18px 0',
                                    fontFamily: "'Schibsted Grotesk', sans-serif",
                                    fontSize: '14px', color: '#333', background: 'transparent',
                                }}
                            />
                        </div>
                        <button
                            className="search-bar-filters"
                            type="button"
                            onClick={() => setFiltersOpen(o => !o)}
                            style={{
                                padding: '0 20px',
                                border: 'none', borderRight: '1px solid #eee',
                                background: filtersOpen ? `${BLUE}10` : '#fff',
                                color: filtersOpen ? BLUE : '#555',
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '13px', fontWeight: 600,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                            </svg>
                            <span className="search-btn-text">Filters</span>
                            {activeFilterCount > 0 && (
                                <span style={{
                                    background: RED, color: '#fff',
                                    borderRadius: '50%', width: '18px', height: '18px',
                                    fontSize: '10px', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                        <button
                            className="search-bar-submit"
                            type="submit"
                            style={{
                                padding: '0 28px',
                                background: BLUE, color: '#fff', border: 'none',
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em',
                                cursor: 'pointer', whiteSpace: 'nowrap',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#095d87'}
                            onMouseLeave={e => e.currentTarget.style.background = BLUE}
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            {/* ── Expandable Filters Panel ── */}
            <div
                className="filters-panel"
                style={{
                    background: '#fff',
                    borderBottom: '1px solid #e8e8e8',
                    maxHeight: filtersOpen ? '300px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: filtersOpen ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
                }}>
                <div className="filters-inner" style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 32px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>

                    <select value={propertyType} onChange={e => { setPropertyType(e.target.value); setPage(1) }} style={filterSelectStyle}>
                        <option value="">All Types</option>
                        {['House', 'Apartment', 'Townhouse', 'Vacant Land', 'Farm', 'Commercial', 'Industrial'].map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>

                    <select value={currency} onChange={e => { setCurrency(e.target.value); setPage(1) }} style={{ ...filterSelectStyle, maxWidth: '110px' }}>
                        <option value="">Currency</option>
                        <option value="USD">USD ($)</option>
                        <option value="ZMW">ZMW (K)</option>
                    </select>

                    <input type="number" placeholder="Min price" value={minPrice}
                        onChange={e => { setMinPrice(e.target.value); setPage(1) }}
                        style={{ ...filterSelectStyle, maxWidth: '120px' }} />

                    <input type="number" placeholder="Max price" value={maxPrice}
                        onChange={e => { setMaxPrice(e.target.value); setPage(1) }}
                        style={{ ...filterSelectStyle, maxWidth: '120px' }} />

                    <select value={bedrooms} onChange={e => { setBedrooms(e.target.value); setPage(1) }} style={{ ...filterSelectStyle, maxWidth: '120px' }}>
                        <option value="">Bedrooms</option>
                        {['1+', '2+', '3+', '4+', '5+'].map(o => <option key={o} value={o}>{o} Bed</option>)}
                    </select>

                    <select value={bathrooms} onChange={e => { setBathrooms(e.target.value); setPage(1) }} style={{ ...filterSelectStyle, maxWidth: '120px' }}>
                        <option value="">Bathrooms</option>
                        {['1+', '2+', '3+', '4+'].map(o => <option key={o} value={o}>{o} Bath</option>)}
                    </select>

                    {activeFilterCount > 0 && (
                        <button onClick={clearAll} className="filters-clear-btn" style={{
                            flexShrink: 0,
                            padding: '7px 14px', borderRadius: '6px',
                            border: '1px solid #e0e0e0', background: '#fafafa',
                            color: '#666', cursor: 'pointer',
                            fontFamily: "'Schibsted Grotesk', sans-serif",
                            fontSize: '12px', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '5px',
                            transition: 'all 0.2s', whiteSpace: 'nowrap',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fff0f0'; e.currentTarget.style.color = RED; e.currentTarget.style.borderColor = `${RED}55` }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#e0e0e0' }}
                        >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* ── Active Filter Chips + Sort Bar ── */}
            <div className="listing-chips-bar" style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 32px 0' }}>
                <div className="chips-sort-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>

                    {/* Active chips */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {!loading && (
                            <span style={{
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '13px', color: '#888',
                            }}>
                                {loading ? '' : `${total} result${total !== 1 ? 's' : ''}`}
                            </span>
                        )}
                        {search && <FilterChip label={`"${search}"`} onRemove={() => { setSearch(''); setSearchDraft('') }} />}
                        {propertyType && <FilterChip label={propertyType} onRemove={() => setPropertyType('')} />}
                        {currency && <FilterChip label={currency} onRemove={() => setCurrency('')} />}
                        {minPrice && <FilterChip label={`Min: ${minPrice}`} onRemove={() => setMinPrice('')} />}
                        {maxPrice && <FilterChip label={`Max: ${maxPrice}`} onRemove={() => setMaxPrice('')} />}
                        {bedrooms && <FilterChip label={`${bedrooms} Beds`} onRemove={() => setBedrooms('')} />}
                        {bathrooms && <FilterChip label={`${bathrooms} Baths`} onRemove={() => setBathrooms('')} />}
                    </div>

                    {/* Sort */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12.5px', color: '#888' }}>Sort:</span>
                        <select
                            value={sort}
                            onChange={e => { setSort(e.target.value); setPage(1) }}
                            style={{
                                ...filterSelectStyle,
                                flex: 'unset', minWidth: 'unset', width: 'auto',
                            }}
                        >
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Grid ── */}
            <div className="listing-grid-wrap" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 32px 64px' }}>
                {loading ? (
                    <LoadingGrid />
                ) : error ? (
                    <ErrorState message={error} onRetry={() => setRetryCount(c => c + 1)} />
                ) : properties.length === 0 ? (
                    <EmptyState onClear={activeFilterCount > 0 ? clearAll : null} />
                ) : (
                    <>
                        <div className="listing-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '28px',
                        }}>
                            {properties.map((p, i) => <PropertyCard key={p.id || p.slug || i} property={p} />)}
                        </div>

                        {/* ── Pagination ── */}
                        {pages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '56px' }}>

                                {/* Prev arrow */}
                                <button
                                    onClick={() => { setPage(p => p - 1); scrollToTop() }}
                                    disabled={page === 1}
                                    style={paginationArrowStyle(page === 1)}
                                    onMouseEnter={e => { if (page !== 1) { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = BLUE } }}
                                    onMouseLeave={e => { if (page !== 1) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = BLUE; e.currentTarget.style.borderColor = `${BLUE}30` } }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>

                                {/* Page numbers */}
                                {getPaginationRange(page, pages).map((n, i) =>
                                    n === '...' ? (
                                        <span key={`ellipsis-${i}`} style={{
                                            fontFamily: "'Schibsted Grotesk', sans-serif",
                                            fontSize: '13px', color: '#aaa', padding: '0 4px',
                                        }}>…</span>
                                    ) : (
                                        <button
                                            key={n}
                                            onClick={() => { setPage(n); scrollToTop() }}
                                            style={{
                                                width: '38px', height: '38px',
                                                borderRadius: '8px',
                                                border: n === page ? `2px solid ${BLUE}` : '1.5px solid #e0e0e0',
                                                background: n === page ? BLUE : '#fff',
                                                color: n === page ? '#fff' : '#444',
                                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                                fontSize: '13px', fontWeight: n === page ? 700 : 400,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={e => { if (n !== page) { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.color = BLUE } }}
                                            onMouseLeave={e => { if (n !== page) { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.color = '#444' } }}
                                        >
                                            {n}
                                        </button>
                                    )
                                )}

                                {/* Next arrow */}
                                <button
                                    onClick={() => { setPage(p => p + 1); scrollToTop() }}
                                    disabled={page === pages}
                                    style={paginationArrowStyle(page === pages)}
                                    onMouseEnter={e => { if (page !== pages) { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = BLUE } }}
                                    onMouseLeave={e => { if (page !== pages) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = BLUE; e.currentTarget.style.borderColor = `${BLUE}30` } }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`

                /* ── 1024px – 769px (tablet landscape) ── */
                @media (max-width: 1024px) and (min-width: 769px) {
                    .listing-hero-inner   { padding: 36px 28px 32px !important; }
                    .listing-search-wrap  { padding: 0 28px !important; }
                    .listing-chips-bar    { padding: 14px 28px 0 !important; }
                    .listing-grid-wrap    { padding: 20px 28px 56px !important; }
                    .filters-inner        { padding: 12px 28px !important; }
                    .listing-grid         { grid-template-columns: repeat(2, 1fr) !important; }
                    .listing-hero-desc    { margin-left: 0 !important; margin-top: 8px !important; }
                }

                /* ── 768px – 481px (tablet portrait) ── */
                @media (max-width: 768px) and (min-width: 481px) {
                    .listing-hero-inner   { padding: 28px 24px 28px !important; }
                    .listing-search-wrap  { padding: 0 24px !important; }
                    .listing-chips-bar    { padding: 12px 24px 0 !important; }
                    .listing-grid-wrap    { padding: 18px 24px 48px !important; }
                    .filters-inner        { padding: 10px 24px 14px !important; flex-wrap: wrap !important; }
                    .filters-inner select,
                    .filters-inner input  { flex: 1 1 calc(50% - 5px) !important; min-width: 0 !important; max-width: none !important; }
                    .listing-grid         { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }
                    .listing-hero-title   { font-size: 1.7rem !important; }
                    .listing-hero-desc    { margin-left: 0 !important; margin-top: 8px !important; }
                    .listing-hero-icon    { width: 44px !important; height: 44px !important; }
                    .search-bar-input     { font-size: 13px !important; padding: 14px 0 !important; }
                }

                /* ── 480px – 0px (mobile) ── */
                @media (max-width: 480px) {
                    .listing-hero-inner   { padding: 24px 16px 24px !important; }
                    .listing-search-wrap  { padding: 0 16px !important; }
                    .listing-chips-bar    { padding: 10px 16px 0 !important; }
                    .listing-grid-wrap    { padding: 14px 16px 40px !important; }
                    .listing-grid         { grid-template-columns: 1fr !important; gap: 16px !important; }
                    .listing-hero-title   { font-size: 1.35rem !important; }
                    .listing-hero-desc    { margin-left: 0 !important; margin-top: 8px !important; display: none !important; }
                    .listing-hero-icon    { width: 40px !important; height: 40px !important; border-radius: 10px !important; }
                    .listing-breadcrumb   { margin-bottom: 16px !important; }
                    .search-btn-text      { display: none !important; }
                    .search-bar-filters   { padding: 0 14px !important; }
                    .search-bar-submit    { padding: 0 16px !important; font-size: 12px !important; }
                    .search-bar-input     { font-size: 13px !important; padding: 14px 0 !important; }
                    .chips-sort-row       { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }

                    /* Filters panel: 2-column grid on mobile */
                    .filters-inner        {
                        padding: 12px 16px 16px !important;
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 8px !important;
                    }
                    /* Clear button spans full width at the bottom */
                    .filters-inner .filters-clear-btn {
                        grid-column: 1 / -1 !important;
                        width: 100% !important;
                        justify-content: center !important;
                    }
                }

            `}</style>
        </div>
    )
}

// ── Pagination range helper ───────────────────────────────────────────────────
function getPaginationRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
    return [1, '...', current - 1, current, current + 1, '...', total]
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px 4px 12px',
            borderRadius: '50px',
            background: `${BLUE}12`,
            border: `1px solid ${BLUE}25`,
            fontFamily: "'Schibsted Grotesk', sans-serif",
            fontSize: '12px', fontWeight: 600, color: BLUE,
        }}>
            {label}
            <button onClick={onRemove} style={{
                background: 'none', border: 'none', padding: '0', cursor: 'pointer',
                color: BLUE, display: 'flex', alignItems: 'center', lineHeight: 1,
            }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    )
}

function LoadingGrid() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '28px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                    <div style={{ height: '210px', background: 'linear-gradient(90deg, #f2f2f2 25%, #e8e8e8 50%, #f2f2f2 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                    <div style={{ padding: '20px' }}>
                        <div style={{ height: '12px', background: '#f2f2f2', borderRadius: '4px', marginBottom: '12px', width: '45%' }} />
                        <div style={{ height: '18px', background: '#f2f2f2', borderRadius: '4px', marginBottom: '8px', width: '80%' }} />
                        <div style={{ height: '14px', background: '#f2f2f2', borderRadius: '4px', width: '60%' }} />
                    </div>
                </div>
            ))}
            <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        </div>
    )
}

function ErrorState({ message, onRetry }) {
    return (
        <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: '#fff', borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `${RED}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: '1.2rem', color: '#333', marginBottom: '8px' }}>Something went wrong</p>
            <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", color: '#888', fontSize: '13px', marginBottom: '20px' }}>{message}</p>
            <button onClick={onRetry} style={{
                padding: '10px 24px', background: BLUE, color: '#fff', border: 'none',
                borderRadius: '8px', fontFamily: "'Schibsted Grotesk', sans-serif",
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
                Try Again
            </button>
        </div>
    )
}

function EmptyState({ onClear }) {
    return (
        <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: '#fff', borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `${BLUE}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            </div>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: '1.4rem', color: '#222', marginBottom: '8px' }}>No properties found</p>
            <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", color: '#888', fontSize: '14px', marginBottom: '24px' }}>
                Try adjusting your filters or check back soon.
            </p>
            {onClear && (
                <button onClick={onClear} style={{
                    padding: '10px 24px',
                    border: `1.5px solid ${BLUE}`,
                    borderRadius: '8px',
                    background: 'transparent',
                    color: BLUE,
                    fontFamily: "'Schibsted Grotesk', sans-serif",
                    fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer',
                }}>
                    Clear Filters
                </button>
            )}
        </div>
    )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const filterSelectStyle = {
    padding: '7px 10px',
    border: '1.5px solid #e8e8e8',
    borderRadius: '6px',
    fontFamily: "'Schibsted Grotesk', sans-serif",
    fontSize: '12.5px', color: '#333',
    background: '#fafafa',
    outline: 'none',
    flex: '1 1 120px',
    minWidth: '100px',
    height: '34px',
    transition: 'border-color 0.2s',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
}

function paginationArrowStyle(disabled) {
    return {
        width: '38px', height: '38px', borderRadius: '8px',
        border: `1.5px solid ${disabled ? '#e8e8e8' : `${BLUE}30`}`,
        background: '#fff',
        color: disabled ? '#ccc' : BLUE,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease',
    }
}