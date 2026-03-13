import { useState, useEffect, useRef, useCallback } from 'react'
import PropertyCard from './PropertyCard'

const BLUE = '#0b699c'
const RED = '#e92026'
const INTERVAL_MS = 4500

// ── Mirrors AdminPage helpers exactly ────────────────────────────────────
function arrFirst(val, fallback) {
    if (Array.isArray(val)) return val[0] || fallback
    return val || fallback
}

function normalise(raw) {
    const isManaged = raw._source === 'managed' || raw.id !== undefined
    if (isManaged) {
        const lt = raw.listingType || 'Rent'
        return {
            id: raw.id || '',
            slug: raw.slug?.trim() || raw.id || '',
            title: raw.title || '',
            location: raw.location || '',
            listingType: lt.toLowerCase() === 'buy' ? 'Sale' : lt,
            propertyStatus: raw.propertyStatus || 'Residential',
            propertyType: raw.propertyType || 'House',
            bedrooms: raw.bedrooms ?? null,
            bathrooms: raw.bathrooms ?? null,
            currency: raw.currency || '$',
            pricing: raw.pricingLabel || '',
            images: raw.images || [],
        }
    }
    return {
        id: raw.ID || '',
        slug: raw.Slug?.trim() || raw.ID || '',
        title: raw.Title || '',
        location: raw.Location || '',
        listingType: arrFirst(raw['Listing Type'], 'Rent'),
        propertyStatus: arrFirst(raw['Propety Status'], 'Residential'),
        propertyType: arrFirst(raw['Property Type'], 'House'),
        bedrooms: raw.Bedrooms ?? null,
        bathrooms: raw.Bathroom ?? null,
        currency: arrFirst(raw.Currency, '$'),
        pricing: raw.Pricing || '',
        images: raw['Property Image'] || [],
    }
}

// ── Mirrors AdminPage resolveThumb exactly ────────────────────────────────
function resolveThumb(img) {
    const raw = img?.secureUrl || img?.src || img?.Slug || img?.slug || ''
    if (!raw) return null
    if (raw.startsWith('https://') || raw.startsWith('http://')) return raw
    const wixMatch = raw.match(/wix:image:\/\/v1\/([^/]+)\//)
    if (wixMatch) return `https://static.wixstatic.com/media/${wixMatch[1]}`
    if (!raw.includes(':') && !raw.includes('/'))
        return `https://static.wixstatic.com/media/${raw}`
    return null
}

const getCardsPerView = () => {
    if (typeof window === 'undefined') return 4
    if (window.innerWidth <= 480) return 1
    if (window.innerWidth <= 1024) return 2
    return 4
}

export default function PropertyListingsGrid() {
    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [cardsPerView, setCardsPerView] = useState(getCardsPerView)
    const [currentPage, setCurrentPage] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [visible, setVisible] = useState(false)
    const [transitioning, setTransitioning] = useState(false)

    const sectionRef = useRef(null)
    const timerRef = useRef(null)

    // ── Fetch from the same endpoint AdminPage uses ───────────────────────
    useEffect(() => {
        let cancelled = false
        fetch('/api/admin/properties')
            .then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json() })
            .then(data => {
                if (!cancelled) {
                    // Take the 10 most-recently added (last 10 in JSON, reversed)
                    const latest = [...data].slice(-10).reverse().map(normalise)
                    setProperties(latest)
                    setLoading(false)
                }
            })
            .catch(err => {
                if (!cancelled) { setError(err.message); setLoading(false) }
            })
        return () => { cancelled = true }
    }, [])

    const totalSlides = Math.ceil(properties.length / cardsPerView)

    // ── Intersection observer ─────────────────────────────────────────────
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true) },
            { threshold: 0.1 }
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    // ── Responsive resize ─────────────────────────────────────────────────
    useEffect(() => {
        const handle = () => {
            const next = getCardsPerView()
            setCardsPerView(prev => { if (prev !== next) setCurrentPage(0); return next })
        }
        window.addEventListener('resize', handle)
        return () => window.removeEventListener('resize', handle)
    }, [])

    // ── Smooth page transition ────────────────────────────────────────────
    const goTo = useCallback((page) => {
        if (totalSlides <= 0) return
        const next = ((page % totalSlides) + totalSlides) % totalSlides
        setTransitioning(true)
        setTimeout(() => { setCurrentPage(next); setTransitioning(false) }, 180)
    }, [totalSlides])

    // ── Auto-advance (currentPage excluded from deps intentionally) ───────
    useEffect(() => {
        if (isPaused || totalSlides <= 1) return
        timerRef.current = setInterval(() => {
            setTransitioning(true)
            setTimeout(() => {
                setCurrentPage(prev => (prev + 1) % totalSlides)
                setTransitioning(false)
            }, 180)
        }, INTERVAL_MS)
        return () => clearInterval(timerRef.current)
    }, [isPaused, totalSlides])

    const currentCards = properties.slice(
        currentPage * cardsPerView,
        currentPage * cardsPerView + cardsPerView
    )

    return (
        <section
            ref={sectionRef}
            className="listings-section"
            style={{ background: '#fff', padding: '100px 0', overflow: 'hidden' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="listings-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px' }}>

                {/* ── Header ── */}
                <div style={{
                    display: 'flex', alignItems: 'flex-end',
                    justifyContent: 'space-between', marginBottom: '48px',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(24px)',
                    transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                    flexWrap: 'wrap', gap: '16px',
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                            <span style={{
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '11.5px', fontWeight: 700,
                                color: RED, letterSpacing: '0.14em', textTransform: 'uppercase',
                            }}>Properties</span>
                        </div>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                            fontWeight: 700, color: '#111',
                            margin: 0, letterSpacing: '-0.02em', lineHeight: 1.15,
                        }}>
                            Latest <span style={{ color: BLUE }}>Properties</span>
                        </h2>
                    </div>

                    <a href="/residential-rent" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '7px',
                        padding: '11px 22px', border: `1.5px solid ${BLUE}`,
                        borderRadius: '6px', color: BLUE,
                        fontFamily: "'Schibsted Grotesk', sans-serif",
                        fontSize: '13px', fontWeight: 700,
                        letterSpacing: '0.04em', textDecoration: 'none',
                        transition: 'all 0.2s ease',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = BLUE }}
                    >
                        View All Listings
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                    </a>
                </div>

                {/* ── Skeleton ── */}
                {loading && (
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cardsPerView}, 1fr)`, gap: '24px' }}>
                        {Array.from({ length: cardsPerView }).map((_, i) => (
                            <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', background: '#f9f9f9' }}>
                                <div style={{
                                    height: '210px',
                                    background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                                    backgroundSize: '200% 100%', animation: 'plgShimmer 1.5s infinite',
                                }} />
                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ height: '11px', background: '#f0f0f0', borderRadius: '4px', width: '40%' }} />
                                    <div style={{ height: '17px', background: '#f0f0f0', borderRadius: '4px', width: '80%' }} />
                                    <div style={{ height: '13px', background: '#f0f0f0', borderRadius: '4px', width: '55%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Error ── */}
                {!loading && error && (
                    <div style={{
                        textAlign: 'center', padding: '60px 24px',
                        background: '#fff8f8', borderRadius: '14px',
                        border: '1.5px dashed #f9c0c0',
                    }}>
                        <p style={{ fontFamily: "'Fraunces', serif", fontSize: '1.1rem', color: '#333', margin: '0 0 6px' }}>
                            Couldn't load properties
                        </p>
                        <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13px', color: '#999', margin: 0 }}>
                            {error}
                        </p>
                    </div>
                )}

                {/* ── Cards ── */}
                {!loading && !error && properties.length > 0 && (
                    <>
                        <div
                            className="listings-grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${cardsPerView}, 1fr)`,
                                gap: '24px',
                                opacity: transitioning ? 0 : (visible ? 1 : 0),
                                transform: transitioning ? 'translateY(8px)' : 'translateY(0)',
                                transition: transitioning
                                    ? 'opacity 0.18s ease, transform 0.18s ease'
                                    : 'opacity 0.3s ease, transform 0.3s ease',
                            }}
                        >
                            {currentCards.map((property, i) => (
                                <div
                                    key={`${currentPage}-${property.slug || property.id || i}`}
                                    style={{
                                        opacity: visible && !transitioning ? 1 : 0,
                                        transform: visible && !transitioning ? 'translateY(0)' : 'translateY(20px)',
                                        transition: `opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s`,
                                    }}
                                >
                                    <PropertyCard property={property} resolveThumb={resolveThumb} />
                                </div>
                            ))}
                        </div>

                        {/* ── Dots + arrows ── */}
                        {totalSlides > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
                                <button
                                    onClick={() => goTo(currentPage - 1)}
                                    style={{ width: '38px', height: '38px', borderRadius: '50%', border: `1.5px solid ${BLUE}30`, background: '#fff', color: BLUE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = BLUE }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = BLUE; e.currentTarget.style.borderColor = `${BLUE}30` }}
                                    aria-label="Previous"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                                </button>

                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {Array.from({ length: totalSlides }).map((_, i) => (
                                        <button key={i} onClick={() => goTo(i)} style={{ width: i === currentPage ? '28px' : '8px', height: '8px', borderRadius: '50px', background: i === currentPage ? BLUE : `${BLUE}30`, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease' }} aria-label={`Page ${i + 1}`} />
                                    ))}
                                </div>

                                <button
                                    onClick={() => goTo(currentPage + 1)}
                                    style={{ width: '38px', height: '38px', borderRadius: '50%', border: `1.5px solid ${BLUE}30`, background: '#fff', color: BLUE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = BLUE }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = BLUE; e.currentTarget.style.borderColor = `${BLUE}30` }}
                                    aria-label="Next"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                                </button>
                            </div>
                        )}

                        {/* ── Progress bar ── */}
                        {!isPaused && totalSlides > 1 && (
                            <div style={{ marginTop: '16px', height: '2px', background: `${BLUE}15`, borderRadius: '2px', overflow: 'hidden' }}>
                                <div key={currentPage} style={{ height: '100%', background: BLUE, borderRadius: '2px', animation: `plgProgressBar ${INTERVAL_MS}ms linear forwards` }} />
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                @keyframes plgProgressBar { from { width: 0%; } to { width: 100%; } }
                @keyframes plgShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                @media (max-width: 1024px) and (min-width: 769px) { .listings-section { padding: 80px 0 !important; } .listings-container { padding: 0 32px !important; } }
                @media (max-width: 768px)  and (min-width: 481px) { .listings-section { padding: 70px 0 !important; } .listings-container { padding: 0 28px !important; } }
                @media (max-width: 480px)  { .listings-section { padding: 60px 0 !important; } .listings-container { padding: 0 20px !important; } }
            `}</style>
        </section>
    )
}