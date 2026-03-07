import { useState, useEffect, useRef, useCallback } from 'react'
import PropertyCard from './PropertyCard'

const BLUE = '#0b699c'
const RED = '#e92026'

const CARDS_PER_VIEW = 4
const INTERVAL_MS = 4500

// ── Derive cards-per-view from current window width ──
const getCardsPerView = () => {
    if (typeof window === 'undefined') return CARDS_PER_VIEW
    if (window.innerWidth <= 480) return 1
    if (window.innerWidth <= 1024) return 2
    return CARDS_PER_VIEW
}

// ── Normalise a raw API property into the shape PropertyCard expects ──
function normaliseProperty(p) {
    const firstImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null
    return {
        id: p.id,
        image: firstImage?.slug ?? null,
        title: p.title,
        neighbourhood: p.addressFormatted || p.location || '',
        price: p.price ?? null,
        currency: p.currency ?? 'USD',
        listingType: p.listingType?.toLowerCase() ?? '',
        propertyType: p.propertyType ?? '',
        bedrooms: p.bedrooms ?? null,
        bathrooms: p.bathrooms ?? null,
        // ── Links directly to the PropertyDetailPage route ──
        href: `/properties/${p.slug}`,
    }
}

export default function PropertyListingsGrid() {
    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [cardsPerView, setCardsPerView] = useState(getCardsPerView)
    const [currentPage, setCurrentPage] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [visible, setVisible] = useState(false)
    const sectionRef = useRef(null)
    const timerRef = useRef(null)

    // ── Fetch the 10 most-recently added properties ──
    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)
        fetch('/api/properties?sort=newest&pageSize=10&page=1')
            .then(r => { if (!r.ok) throw new Error('Failed to load properties'); return r.json() })
            .then(data => {
                if (!cancelled) {
                    setProperties((data.items ?? []).map(normaliseProperty))
                }
            })
            .catch(err => { if (!cancelled) setError(err.message) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    // ── Reset carousel to page 0 whenever the property list changes ──
    useEffect(() => { setCurrentPage(0) }, [properties])

    const totalSlides = Math.ceil(properties.length / cardsPerView)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true) },
            { threshold: 0.1 }
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    // ── Update cardsPerView on resize and reset page to avoid out-of-bounds ──
    useEffect(() => {
        const handleResize = () => {
            const next = getCardsPerView()
            setCardsPerView(prev => {
                if (prev !== next) { setCurrentPage(0) }
                return next
            })
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const goTo = useCallback((page) => {
        setCurrentPage(((page % totalSlides) + totalSlides) % totalSlides)
    }, [totalSlides])

    // ── Auto-advance only when there is more than one slide ──
    useEffect(() => {
        if (isPaused || totalSlides <= 1) return
        timerRef.current = setInterval(() => {
            goTo(currentPage + 1)
        }, INTERVAL_MS)
        return () => clearInterval(timerRef.current)
    }, [currentPage, isPaused, goTo, totalSlides])

    const currentCards = properties.slice(currentPage * cardsPerView, currentPage * cardsPerView + cardsPerView)

    return (
        <section
            ref={sectionRef}
            className="listings-section"
            style={{ background: '#fff', padding: '100px 0', overflow: 'hidden' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="listings-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px' }}>

                {/* ── Section Header ── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    marginBottom: '48px',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(24px)',
                    transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                    flexWrap: 'wrap',
                    gap: '16px',
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                            <span style={{
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '11.5px',
                                fontWeight: 700,
                                color: RED,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                            }}>Properties</span>
                        </div>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                            fontWeight: 700,
                            color: '#111',
                            margin: 0,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.15,
                        }}>
                            Latest{' '}
                            <span style={{ color: BLUE }}>Properties</span>
                        </h2>
                    </div>

                    <a
                        href="/residential-rent"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '11px 22px',
                            border: `1.5px solid ${BLUE}`,
                            borderRadius: '6px',
                            color: BLUE,
                            fontFamily: "'Schibsted Grotesk', sans-serif",
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textDecoration: 'none',
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

                {/* ── Loading skeleton ── */}
                {loading && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${cardsPerView}, 1fr)`,
                        gap: '24px',
                    }}>
                        {Array.from({ length: cardsPerView }).map((_, i) => (
                            <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', background: '#f9f9f9', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <div style={{
                                    height: '210px',
                                    background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                                    backgroundSize: '200% 100%',
                                    animation: 'plgShimmer 1.5s infinite',
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

                {/* ── Error state ── */}
                {!loading && error && (
                    <div style={{
                        textAlign: 'center', padding: '60px 24px',
                        background: '#fff8f8', borderRadius: '14px',
                        border: '1.5px dashed #f9c0c0',
                    }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: '#fde8e8', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 14px',
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <p style={{ fontFamily: "'Fraunces', serif", fontSize: '1.1rem', color: '#333', marginBottom: '6px' }}>
                            Couldn't load properties
                        </p>
                        <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13px', color: '#999', margin: 0 }}>
                            Please check your connection and try refreshing the page.
                        </p>
                    </div>
                )}

                {/* ── Cards Grid ── */}
                {!loading && !error && properties.length > 0 && (
                    <>
                        <div
                            className="listings-grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${cardsPerView}, 1fr)`,
                                gap: '24px',
                                opacity: visible ? 1 : 0,
                                transition: 'opacity 0.5s ease',
                            }}
                        >
                            {currentCards.map((property, i) => (
                                <div
                                    key={property.id}
                                    style={{
                                        opacity: visible ? 1 : 0,
                                        transform: visible ? 'translateY(0)' : 'translateY(32px)',
                                        transition: `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.08}s`,
                                    }}
                                >
                                    <PropertyCard property={property} />
                                </div>
                            ))}
                        </div>

                        {/* ── Pagination dots + arrows ── */}
                        {totalSlides > 1 && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '16px',
                                marginTop: '40px',
                            }}>
                                {/* Prev */}
                                <button
                                    onClick={() => goTo(currentPage - 1)}
                                    style={{
                                        width: '38px', height: '38px',
                                        borderRadius: '50%',
                                        border: `1.5px solid ${BLUE}30`,
                                        background: '#fff',
                                        color: BLUE,
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = BLUE }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = BLUE; e.currentTarget.style.borderColor = `${BLUE}30` }}
                                    aria-label="Previous"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>

                                {/* Dots */}
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {Array.from({ length: totalSlides }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => goTo(i)}
                                            style={{
                                                width: i === currentPage ? '28px' : '8px',
                                                height: '8px',
                                                borderRadius: '50px',
                                                background: i === currentPage ? BLUE : `${BLUE}30`,
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: 0,
                                                transition: 'all 0.3s ease',
                                            }}
                                            aria-label={`Page ${i + 1}`}
                                        />
                                    ))}
                                </div>

                                {/* Next */}
                                <button
                                    onClick={() => goTo(currentPage + 1)}
                                    style={{
                                        width: '38px', height: '38px',
                                        borderRadius: '50%',
                                        border: `1.5px solid ${BLUE}30`,
                                        background: '#fff',
                                        color: BLUE,
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = BLUE }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = BLUE; e.currentTarget.style.borderColor = `${BLUE}30` }}
                                    aria-label="Next"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Auto-scroll progress bar */}
                        {!isPaused && totalSlides > 1 && (
                            <div style={{ marginTop: '16px', height: '2px', background: `${BLUE}15`, borderRadius: '2px', overflow: 'hidden' }}>
                                <div
                                    key={currentPage}
                                    style={{
                                        height: '100%',
                                        background: BLUE,
                                        borderRadius: '2px',
                                        animation: `plgProgressBar ${INTERVAL_MS}ms linear forwards`,
                                    }}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                @keyframes plgProgressBar {
                    from { width: 0%; }
                    to   { width: 100%; }
                }
                @keyframes plgShimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                /* ── 1024px – 769px (tablet landscape) ── */
                @media (max-width: 1024px) and (min-width: 769px) {
                    .listings-section    { padding: 80px 0 !important; }
                    .listings-container  { padding: 0 32px !important; }
                }

                /* ── 768px – 480px (tablet portrait) ── */
                @media (max-width: 768px) and (min-width: 481px) {
                    .listings-section    { padding: 70px 0 !important; }
                    .listings-container  { padding: 0 28px !important; }
                }

                /* ── 480px – 0px (mobile) ── */
                @media (max-width: 480px) {
                    .listings-section    { padding: 60px 0 !important; }
                    .listings-container  { padding: 0 20px !important; }
                }
            `}</style>
        </section>
    )
}