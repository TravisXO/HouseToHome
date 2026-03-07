import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

// ─── Helpers ────────────────────────────────────────────────────────────────

function routeFromProperty(listingType, propertyStatus) {
    if (listingType === 'Rent') {
        return propertyStatus === 'Commercial' ? '/commercial-rent' : '/residential-rent'
    }
    if (propertyStatus === 'Land') return '/land-sale'
    if (propertyStatus === 'Commercial') return '/commercial-sale'
    if (propertyStatus === 'Investment') return '/investments'
    return '/residential-sale'
}

function routeLabel(listingType, propertyStatus) {
    if (listingType === 'Rent') {
        return propertyStatus === 'Commercial' ? 'Commercial Rent' : 'Residential Rent'
    }
    if (propertyStatus === 'Land') return 'Land for Sale'
    if (propertyStatus === 'Commercial') return 'Commercial Sale'
    if (propertyStatus === 'Investment') return 'Investments'
    return 'Residential Sale'
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Badge({ children, variant = 'blue' }) {
    const styles = {
        blue: { background: '#0b699c', color: '#fff' },
        red: { background: '#e92026', color: '#fff' },
        outline: { background: 'transparent', border: '1.5px solid #0b699c', color: '#0b699c' },
        soft: { background: '#e8f3fa', color: '#0b699c' },
    }
    return (
        <span
            style={{
                ...styles[variant],
                fontFamily: "'Schibsted Grotesk', sans-serif",
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '3px 10px',
                borderRadius: '4px',
                display: 'inline-block',
                whiteSpace: 'nowrap',
            }}
        >
            {children}
        </span>
    )
}

function Stat({ icon, label, value }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '64px' }}>
            <div style={{ fontSize: '1.4rem', color: '#0b699c' }}>{icon}</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1.2rem', color: '#111', lineHeight: 1 }}>
                {value}
            </div>
            <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
            </div>
        </div>
    )
}

// ─── Image Gallery ───────────────────────────────────────────────────────────

function Gallery({ images }) {
    const [active, setActive] = useState(0)
    const [lightbox, setLightbox] = useState(false)

    if (!images?.length) {
        return (
            <div style={{
                width: '100%', aspectRatio: '16/9', background: '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '12px', color: '#9ca3af', fontSize: '3rem',
            }}>
                🏠
            </div>
        )
    }

    const main = images[active]

    return (
        <div>
            {/* Main image */}
            <div
                style={{
                    width: '100%', aspectRatio: '16/9', overflow: 'hidden',
                    borderRadius: '12px', position: 'relative', cursor: 'zoom-in',
                    background: '#111',
                }}
                onClick={() => setLightbox(true)}
            >
                <img
                    key={active}
                    src={main.slug}
                    alt={main.alt || 'Property image'}
                    style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        display: 'block',
                        animation: 'fadeIn 0.3s ease',
                    }}
                />
                <div style={{
                    position: 'absolute', bottom: '12px', right: '12px',
                    background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: '6px',
                    padding: '4px 10px', fontSize: '0.75rem', fontFamily: "'Schibsted Grotesk', sans-serif",
                    backdropFilter: 'blur(4px)',
                }}>
                    {active + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div style={{
                    display: 'flex', gap: '8px', marginTop: '10px',
                    overflowX: 'auto', paddingBottom: '4px',
                }}>
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            style={{
                                flex: '0 0 80px', height: '56px', borderRadius: '8px',
                                overflow: 'hidden', padding: 0, border: 'none',
                                cursor: 'pointer', outline: active === i ? '2.5px solid #0b699c' : 'none',
                                outlineOffset: '2px', opacity: active === i ? 1 : 0.6,
                                transition: 'opacity 0.2s, outline 0.2s',
                            }}
                        >
                            <img
                                src={img.slug}
                                alt={img.alt || ''}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {lightbox && (
                <div
                    onClick={() => setLightbox(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, cursor: 'zoom-out', padding: '20px',
                    }}
                >
                    <img
                        src={main.slug}
                        alt={main.alt || ''}
                        style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }}
                        onClick={e => e.stopPropagation()}
                    />
                    <div style={{ position: 'absolute', top: '16px', right: '20px' }}>
                        <button
                            onClick={() => setLightbox(false)}
                            style={{
                                background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                                width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.2rem',
                                cursor: 'pointer',
                            }}
                        >✕</button>
                    </div>
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={e => { e.stopPropagation(); setActive(i => Math.max(0, i - 1)) }}
                                style={navBtn('left')}
                            >‹</button>
                            <button
                                onClick={e => { e.stopPropagation(); setActive(i => Math.min(images.length - 1, i + 1)) }}
                                style={navBtn('right')}
                            >›</button>
                        </>
                    )}
                </div>
            )}

            <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
        </div>
    )
}

function navBtn(side) {
    return {
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        [side]: '16px', background: 'rgba(255,255,255,0.15)', border: 'none',
        color: '#fff', width: '48px', height: '48px', borderRadius: '50%',
        fontSize: '2rem', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', lineHeight: 1,
    }
}

// ─── Contact Card ─────────────────────────────────────────────────────────────

function ContactCard({ property }) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [message, setMessage] = useState(
        `Hi, I'm interested in "${property?.title}". Please get in touch.`
    )
    const [sent, setSent] = useState(false)

    function handleSubmit() {
        // Wire up to real API / mailto as needed
        setSent(true)
        setTimeout(() => setSent(false), 4000)
    }

    const inputStyle = {
        width: '100%', padding: '10px 14px', borderRadius: '8px',
        border: '1.5px solid #e5e7eb', fontFamily: "'Schibsted Grotesk', sans-serif",
        fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    }

    return (
        <div style={{
            background: '#fff', borderRadius: '16px',
            border: '1.5px solid #e5e7eb', padding: '24px',
            boxShadow: '0 4px 24px rgba(11,105,156,0.07)',
        }}>
            {/* Price */}
            <div style={{ marginBottom: '20px' }}>
                <p style={{
                    fontFamily: "'Fraunces', serif", fontWeight: 700,
                    fontSize: '1.7rem', color: '#0b699c', margin: 0, lineHeight: 1.1,
                }}>
                    {property?.pricingLabel || '—'}
                </p>
                {property?.listingType === 'Rent' && (
                    <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '0.78rem', color: '#6b7280', margin: '4px 0 0' }}>
                        per month
                    </p>
                )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '0 0 20px' }} />

            <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600, fontSize: '0.85rem', color: '#111', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Enquire about this property
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                    style={inputStyle}
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#0b699c'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <input
                    style={inputStyle}
                    placeholder="Phone number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#0b699c'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <textarea
                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#0b699c'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                    onClick={handleSubmit}
                    style={{
                        background: sent ? '#16a34a' : '#0b699c',
                        color: '#fff', border: 'none', borderRadius: '8px',
                        padding: '12px', fontFamily: "'Schibsted Grotesk', sans-serif",
                        fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
                        transition: 'background 0.25s, transform 0.15s',
                        width: '100%',
                    }}
                    onMouseEnter={e => !sent && (e.target.style.background = '#085a84')}
                    onMouseLeave={e => !sent && (e.target.style.background = '#0b699c')}
                >
                    {sent ? '✓ Enquiry Sent!' : 'Send Enquiry'}
                </button>
            </div>

            {/* Quick actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <a
                    href="tel:+260"
                    style={{
                        flex: 1, textAlign: 'center', padding: '10px',
                        border: '1.5px solid #0b699c', borderRadius: '8px',
                        color: '#0b699c', textDecoration: 'none',
                        fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600,
                        fontSize: '0.85rem', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.target.style.background = '#e8f3fa'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                    📞 Call
                </a>
                <a
                    href={`https://wa.me/260?text=Hi, I'm interested in ${property?.title}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        flex: 1, textAlign: 'center', padding: '10px',
                        border: '1.5px solid #25d366', borderRadius: '8px',
                        color: '#25d366', textDecoration: 'none',
                        fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600,
                        fontSize: '0.85rem', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.target.style.background = '#f0fdf4'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                    💬 WhatsApp
                </a>
            </div>
        </div>
    )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function Skeleton({ style }) {
    return (
        <div style={{
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
            borderRadius: '8px',
            ...style,
        }} />
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PropertyDetailPage() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const [property, setProperty] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const r = await fetch(`/api/properties/${slug}`)
                if (!r.ok) throw new Error(r.status === 404 ? 'Property not found.' : 'Failed to load property.')
                const data = await r.json()
                if (!cancelled) {
                    setProperty(data)
                    setLoading(false)
                    setError(null)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message)
                    setLoading(false)
                }
            }
        }
        load()
        return () => { cancelled = true }
    }, [slug])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // ── Breadcrumb ────────────────────────────────────────────────────
    const crumbRoute = property ? routeFromProperty(property.listingType, property.propertyStatus) : null
    const crumbLabel = property ? routeLabel(property.listingType, property.propertyStatus) : null

    return (
        <div style={{ background: '#fafafa', minHeight: '100vh' }}>
            <style>{`
                @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                .detail-page * { box-sizing: border-box; }
                .detail-page a:hover { text-decoration: underline; }
                .amenities-content ul { padding-left: 1.4rem; margin: 0; }
                .amenities-content li { margin-bottom: 6px; font-family: 'Schibsted Grotesk', sans-serif; font-size: 0.92rem; color: #374151; }
                .amenities-content p { font-family: 'Schibsted Grotesk', sans-serif; font-size: 0.92rem; color: #374151; margin: 0 0 8px; }
                .tag-chip { 
                    background: #f3f4f6; border-radius: 20px; padding: 5px 14px;
                    font-family: 'Schibsted Grotesk', sans-serif; font-size: 0.82rem;
                    color: #374151; display: inline-block; white-space: nowrap;
                }
                @media(min-width: 768px) {
                    .detail-grid { display: grid !important; grid-template-columns: 1fr 360px; gap: 36px; align-items: start; }
                    .card-sticky { position: sticky !important; top: 90px; }
                }
                @media(min-width: 1024px) {
                    .detail-grid { grid-template-columns: 1fr 400px; gap: 48px; }
                }
            `}</style>

            <div className="detail-page">

                {/* ── Sticky mini-bar (shows after scroll) ── */}
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                    background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid #e5e7eb',
                    transform: scrolled ? 'translateY(0)' : 'translateY(-100%)',
                    transition: 'transform 0.3s ease',
                    padding: '10px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '12px',
                }}>
                    <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '0.95rem', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {property?.title}
                    </span>
                    <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1rem', color: '#0b699c', whiteSpace: 'nowrap' }}>
                        {property?.pricingLabel}
                    </span>
                </div>

                {/* ── Breadcrumb ── */}
                <div style={{
                    maxWidth: '1600px', margin: '0 auto',
                    padding: '20px 20px 0',
                }}>
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <Link to="/" style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '0.82rem', color: '#6b7280', textDecoration: 'none' }}>
                            Home
                        </Link>
                        <span style={{ color: '#d1d5db', fontSize: '0.82rem' }}>›</span>
                        {crumbRoute && (
                            <>
                                <Link to={crumbRoute} style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '0.82rem', color: '#6b7280', textDecoration: 'none' }}>
                                    {crumbLabel}
                                </Link>
                                <span style={{ color: '#d1d5db', fontSize: '0.82rem' }}>›</span>
                            </>
                        )}
                        <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '0.82rem', color: '#111' }}>
                            {loading ? '…' : (property?.title || 'Property')}
                        </span>
                    </nav>
                </div>

                {/* ── Content ── */}
                <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px 20px 60px' }}>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px',
                            padding: '24px', textAlign: 'center', animation: 'fadeUp 0.4s ease',
                        }}>
                            <p style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', color: '#dc2626', margin: '0 0 8px' }}>
                                {error}
                            </p>
                            <button
                                onClick={() => navigate(-1)}
                                style={{
                                    marginTop: '12px', padding: '10px 24px', background: '#0b699c',
                                    color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
                                    fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600,
                                }}
                            >
                                ← Go Back
                            </button>
                        </div>
                    )}

                    {/* Loading skeleton */}
                    {loading && !error && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <Skeleton style={{ height: '400px', marginBottom: '24px' }} />
                            <Skeleton style={{ height: '32px', width: '60%', marginBottom: '12px' }} />
                            <Skeleton style={{ height: '20px', width: '40%', marginBottom: '24px' }} />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Skeleton style={{ height: '80px', flex: 1 }} />
                                <Skeleton style={{ height: '80px', flex: 1 }} />
                                <Skeleton style={{ height: '80px', flex: 1 }} />
                            </div>
                        </div>
                    )}

                    {/* Main content */}
                    {!loading && !error && property && (
                        <div style={{ animation: 'fadeUp 0.5s ease' }}>

                            {/* ── Gallery (full width) ── */}
                            <Gallery images={property.images} />

                            {/* ── Title row ── */}
                            <div style={{ margin: '24px 0 4px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '10px', justifyContent: 'space-between' }}>
                                <h1 style={{
                                    fontFamily: "'Fraunces', serif", fontWeight: 700,
                                    fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                                    color: '#0d1117', margin: 0, lineHeight: 1.2, flex: '1 1 300px',
                                }}>
                                    {property.title}
                                </h1>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '4px' }}>
                                    <Badge variant={property.listingType === 'Rent' ? 'blue' : 'red'}>
                                        {property.listingType === 'Rent' ? 'For Rent' : 'For Sale'}
                                    </Badge>
                                    <Badge variant="soft">{property.propertyType}</Badge>
                                    {property.furnishingStatus && (
                                        <Badge variant="outline">{property.furnishingStatus}</Badge>
                                    )}
                                </div>
                            </div>

                            {/* Location */}
                            <p style={{
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '0.95rem', color: '#6b7280',
                                margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '4px',
                            }}>
                                <span style={{ color: '#e92026' }}>📍</span>
                                {property.addressFormatted || property.location}
                            </p>

                            {/* ── Two-column grid ── */}
                            <div className="detail-grid" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                                {/* LEFT: details */}
                                <div>

                                    {/* Stats bar */}
                                    <div style={{
                                        background: '#fff', borderRadius: '14px',
                                        border: '1.5px solid #e5e7eb', padding: '20px',
                                        display: 'flex', gap: '8px', flexWrap: 'wrap',
                                        justifyContent: 'space-around',
                                        marginBottom: '28px',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                                    }}>
                                        {property.bedrooms != null && (
                                            <Stat icon="🛏" label="Bedrooms" value={property.bedrooms} />
                                        )}
                                        {property.bathrooms != null && (
                                            <Stat icon="🚿" label="Bathrooms" value={property.bathrooms} />
                                        )}
                                        {property.lotSize && (
                                            <Stat icon="📐" label="Lot Size" value={property.lotSize} />
                                        )}
                                        <Stat icon="🏷" label="Type" value={property.propertyType} />
                                        <Stat icon="📍" label="Area" value={property.location} />
                                    </div>

                                    {/* Tags */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                                        <span className="tag-chip">🏡 {property.propertyStatus}</span>
                                        <span className="tag-chip">🌍 {property.addressCity}, {property.addressCountry}</span>
                                        {property.currency && (
                                            <span className="tag-chip">💱 Priced in {property.currency}</span>
                                        )}
                                    </div>

                                    {/* Amenities */}
                                    {property.amenities && (
                                        <div style={{
                                            background: '#fff', borderRadius: '14px',
                                            border: '1.5px solid #e5e7eb', padding: '24px',
                                            marginBottom: '28px',
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                                        }}>
                                            <h2 style={{
                                                fontFamily: "'Fraunces', serif", fontWeight: 600,
                                                fontSize: '1.25rem', color: '#0d1117',
                                                margin: '0 0 16px',
                                                paddingBottom: '12px', borderBottom: '1px solid #f0f0f0',
                                            }}>
                                                Amenities & Features
                                            </h2>
                                            <div
                                                className="amenities-content"
                                                dangerouslySetInnerHTML={{ __html: property.amenities }}
                                            />
                                        </div>
                                    )}

                                    {/* Map placeholder */}
                                    {(property.latitude || property.longitude) && (
                                        <div style={{
                                            background: '#fff', borderRadius: '14px',
                                            border: '1.5px solid #e5e7eb', overflow: 'hidden',
                                            marginBottom: '28px',
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                                        }}>
                                            <div style={{ padding: '20px 24px 0' }}>
                                                <h2 style={{
                                                    fontFamily: "'Fraunces', serif", fontWeight: 600,
                                                    fontSize: '1.25rem', color: '#0d1117', margin: 0,
                                                }}>
                                                    Location
                                                </h2>
                                                <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '0.85rem', color: '#6b7280', margin: '4px 0 16px' }}>
                                                    {property.addressFormatted}
                                                </p>
                                            </div>
                                            <iframe
                                                title="Property location"
                                                width="100%"
                                                height="280"
                                                loading="lazy"
                                                style={{ display: 'block', border: 'none' }}
                                                src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                                            />
                                        </div>
                                    )}

                                    {/* Contact card — shown below content on mobile, sticky on desktop */}
                                    <div className="detail-card-mobile" style={{ display: 'block' }}>
                                        <ContactCard property={property} />
                                    </div>

                                </div>

                                {/* RIGHT: sticky contact card (hidden on mobile, shown via grid) */}
                                <div className="card-sticky" style={{ display: 'none' }}>
                                    <ContactCard property={property} />
                                </div>

                            </div>

                            {/* ── Back button ── */}
                            <div style={{ marginTop: '32px' }}>
                                <button
                                    onClick={() => navigate(-1)}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        background: 'transparent', border: '1.5px solid #d1d5db',
                                        borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
                                        fontFamily: "'Schibsted Grotesk', sans-serif",
                                        fontWeight: 500, fontSize: '0.9rem', color: '#374151',
                                        transition: 'border-color 0.2s, color 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#0b699c'; e.currentTarget.style.color = '#0b699c' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151' }}
                                >
                                    ← Back to Listings
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>

            {/* ── Responsive: show/hide contact card ── */}
            <style>{`
                @media (min-width: 768px) {
                    .detail-card-mobile { display: none !important; }
                    .card-sticky { display: block !important; }
                }
            `}</style>
        </div>
    )
}