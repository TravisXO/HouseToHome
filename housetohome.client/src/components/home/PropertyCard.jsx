const BLUE = '#0b699c'
const RED = '#e92026'

const BedIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 12h20M6 12v4" />
    </svg>
)

const BathIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z" /><path d="M6 12V5a2 2 0 0 1 2-2h3v2.25" />
    </svg>
)

const MapPinIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
)

const formatPrice = (pricing, currency) => {
    if (!pricing) return 'Price on Request'
    // If the pricing label is already formatted (e.g. "$1,500/month"), use it as-is
    if (pricing.includes('$') || pricing.toLowerCase().includes('k')) return pricing
    const num = Number(String(pricing).replace(/[^0-9.]/g, ''))
    if (!num) return pricing
    return currency === '$' ? `$${num.toLocaleString()}` : `K ${num.toLocaleString()}`
}

export default function PropertyCard({ property, resolveThumb }) {
    const {
        id,
        slug,
        title,
        location,
        listingType,
        propertyType,
        bedrooms,
        bathrooms,
        currency,
        pricing,
        images,
    } = property

    const thumb = resolveThumb(images?.[0])
    const isRent = listingType?.toLowerCase() === 'rent'

    // Navigate to detail page using slug (managed) or id (legacy)
    const href = slug ? `/properties/${encodeURIComponent(slug)}` : id ? `/properties/${encodeURIComponent(id)}` : '#'

    return (
        <div
            className="property-card"
            style={{
                background: '#fff', borderRadius: '12px', overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                width: '100%', cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 16px 48px rgba(11,105,156,0.14)` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)' }}
        >
            <a href={href} style={{ textDecoration: 'none', display: 'block' }}>

                {/* ── Image ── */}
                <div className="property-card-image" style={{ position: 'relative', height: '210px', overflow: 'hidden', background: `linear-gradient(135deg, ${BLUE}33, #0a4f7822)` }}>
                    {thumb ? (
                        <img
                            src={thumb}
                            alt={title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                            onError={e => { e.currentTarget.style.display = 'none' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                            </svg>
                        </div>
                    )}

                    {/* Listing type badge */}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '5px 12px', borderRadius: '50px', background: isRent ? BLUE : RED, color: '#fff', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        For {isRent ? 'Rent' : 'Sale'}
                    </div>

                    {/* Property type badge */}
                    {propertyType && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '5px 12px', borderRadius: '50px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', color: '#fff', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.06em' }}>
                            {propertyType}
                        </div>
                    )}
                </div>

                {/* ── Body ── */}
                <div style={{ padding: '18px 20px 20px' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#999', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', marginBottom: '8px' }}>
                        <MapPinIcon />
                        <span>{location || 'Lusaka, Zambia'}</span>
                    </div>

                    <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: 600, color: '#111', margin: '0 0 14px 0', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                        {title}
                    </h3>

                    <div style={{ height: '1px', background: '#f0f0f0', marginBottom: '14px' }} />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: '19px', fontWeight: 700, color: BLUE, lineHeight: 1 }}>
                                {formatPrice(pricing, currency)}
                            </div>
                            {isRent && (
                                <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10.5px', color: '#aaa', marginTop: '2px' }}>/month</div>
                            )}
                        </div>

                        {(bedrooms || bathrooms) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {bedrooms && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12.5px', fontWeight: 600, color: '#555' }}>
                                        <BedIcon /> {bedrooms}
                                    </div>
                                )}
                                {bathrooms && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12.5px', fontWeight: 600, color: '#555' }}>
                                        <BathIcon /> {bathrooms}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: BLUE, fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12.5px', fontWeight: 700, letterSpacing: '0.04em', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
                        View Listing
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </div>
            </a>

            <style>{`
                @media (max-width: 1024px) and (min-width: 769px) { .property-card-image { height: 190px !important; } }
                @media (max-width: 768px)  and (min-width: 481px) { .property-card-image { height: 200px !important; } }
                @media (max-width: 480px)  { .property-card-image { height: 220px !important; } .property-card { border-radius: 10px !important; } }
            `}</style>
        </div>
    )
}