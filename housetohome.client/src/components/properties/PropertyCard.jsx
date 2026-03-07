import { useState } from 'react'
import { Link } from 'react-router-dom'

const BLUE = '#0b699c'
const RED = '#e92026'

// Wix CDN image resizing — cards display at ~455×210, serve 2× for retina
function wixImg(url, w, h, q = 80) {
    if (!url || !url.includes('wixstatic.com')) return url
    const base = url.split('/v1/')[0]
    const filename = base.split('/').pop()
    return `${base}/v1/fill/w_${w},h_${h},al_c,q_${q},usm_0.33_1.00_0.00/${filename}`
}

const BedIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v5" />
        <path d="M2 22V11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v11" />
        <path d="M2 17h20" />
        <path d="M6 11v-1a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
    </svg>
)

const BathIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
        <line x1="10" y1="5" x2="8" y2="7" />
        <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
)

const MapPinIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
)

const AreaIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
    </svg>
)

const ArrowIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
)

export default function PropertyCard({ property, priority = false }) {
    const [imgError, setImgError] = useState(false)

    const rawUrl = property.images?.[0]?.slug ?? null
    // 910×420 = 2× the 455×210 card size (retina-ready)
    const imageUrl = rawUrl ? wixImg(rawUrl, 910, 420) : null
    const coverAlt = property.images?.[0]?.alt || property.title
    const currencySymbol = property.currency === 'ZMW' ? 'K' : '$'
    const isRent = property.listingType === 'Rent'

    return (
        <div
            className="property-card"
            style={{
                background: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                width: '100%',
                cursor: 'pointer',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(11,105,156,0.14)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'
            }}
        >
            <Link to={`/properties/${property.slug}`} style={{ textDecoration: 'none', display: 'block' }}>

                {/* ── Image ── */}
                <div
                    className="property-card-image"
                    style={{
                        position: 'relative',
                        height: '210px',
                        overflow: 'hidden',
                        background: `linear-gradient(135deg, ${BLUE}33, #0a4f7822)`,
                    }}
                >
                    {imageUrl && !imgError ? (
                        <img
                            src={imageUrl}
                            alt={coverAlt}
                            width={910}
                            height={420}
                            loading={priority ? 'eager' : 'lazy'}
                            fetchpriority={priority ? 'high' : 'auto'}
                            decoding="async"
                            onError={() => setImgError(true)}
                            style={{
                                width: '100%', height: '100%',
                                objectFit: 'cover', display: 'block',
                                transition: 'transform 0.5s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                    ) : (
                        <div style={{
                            width: '100%', height: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: `${BLUE}66`, fontSize: '13px',
                            fontFamily: "'Schibsted Grotesk', sans-serif",
                        }}>
                            No image available
                        </div>
                    )}

                    {/* Listing type badge — pill style */}
                    <div style={{
                        position: 'absolute', top: '12px', left: '12px',
                        display: 'flex', gap: '6px', alignItems: 'center',
                    }}>
                        <span style={{
                            padding: '5px 12px',
                            borderRadius: '50px',
                            background: isRent ? BLUE : RED,
                            color: '#fff',
                            fontFamily: "'Schibsted Grotesk', sans-serif",
                            fontSize: '10.5px', fontWeight: 700,
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>
                            For {isRent ? 'Rent' : 'Sale'}
                        </span>
                        {property.propertyStatus && (
                            <span style={{
                                padding: '5px 12px',
                                borderRadius: '50px',
                                background: 'rgba(0,0,0,0.48)',
                                backdropFilter: 'blur(6px)',
                                color: '#fff',
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '10.5px', fontWeight: 600,
                                letterSpacing: '0.06em',
                            }}>
                                {property.propertyStatus}
                            </span>
                        )}
                    </div>

                    {/* Furnishing badge */}
                    {property.furnishingStatus && (
                        <span style={{
                            position: 'absolute', top: '12px', right: '12px',
                            padding: '5px 12px',
                            borderRadius: '50px',
                            background: 'rgba(0,0,0,0.55)',
                            backdropFilter: 'blur(6px)',
                            color: '#fff',
                            fontFamily: "'Schibsted Grotesk', sans-serif",
                            fontSize: '10.5px', fontWeight: 600,
                            letterSpacing: '0.06em',
                        }}>
                            {property.furnishingStatus}
                        </span>
                    )}
                </div>

                {/* ── Body ── */}
                <div style={{ padding: '18px 20px 20px' }}>

                    {/* Location */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        color: '#999', fontSize: '12px', marginBottom: '8px',
                        fontFamily: "'Schibsted Grotesk', sans-serif",
                    }}>
                        <MapPinIcon />
                        <span>
                            {property.location}
                            {property.addressCity ? `, ${property.addressCity}` : ''}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: '17px', fontWeight: 600,
                        color: '#111', margin: '0 0 12px 0',
                        lineHeight: 1.3, letterSpacing: '-0.01em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}>
                        {property.title}
                    </h3>

                    {/* Stats row */}
                    {(property.bedrooms != null || property.bathrooms != null || property.lotSize) && (
                        <div style={{ display: 'flex', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
                            {property.bedrooms != null && (
                                <Stat icon={<BedIcon />} value={`${property.bedrooms} Bed`} />
                            )}
                            {property.bathrooms != null && (
                                <Stat icon={<BathIcon />} value={`${property.bathrooms} Bath`} />
                            )}
                            {property.lotSize && (
                                <Stat icon={<AreaIcon />} value={property.lotSize} />
                            )}
                        </div>
                    )}

                    {/* Divider */}
                    <div style={{ height: '1px', background: '#f0f0f0', marginBottom: '14px' }} />

                    {/* Price row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            {property.pricingLabel ? (
                                <div style={{
                                    fontFamily: "'Fraunces', serif",
                                    fontSize: '19px', fontWeight: 700,
                                    color: BLUE, lineHeight: 1,
                                }}>
                                    {property.pricingLabel}
                                </div>
                            ) : property.price != null ? (
                                <>
                                    <div style={{
                                        fontFamily: "'Fraunces', serif",
                                        fontSize: '19px', fontWeight: 700,
                                        color: BLUE, lineHeight: 1,
                                    }}>
                                        {currencySymbol}{Number(property.price).toLocaleString()}
                                    </div>
                                    {isRent && (
                                        <div style={{
                                            fontFamily: "'Schibsted Grotesk', sans-serif",
                                            fontSize: '10.5px', color: '#aaa', marginTop: '2px',
                                        }}>
                                            /month
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{
                                    fontFamily: "'Schibsted Grotesk', sans-serif",
                                    fontSize: '13px', color: '#888',
                                }}>
                                    Price on request
                                </div>
                            )}
                        </div>
                    </div>

                    {/* View listing link */}
                    <div style={{
                        marginTop: '16px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        color: BLUE,
                        fontFamily: "'Schibsted Grotesk', sans-serif",
                        fontSize: '12.5px', fontWeight: 700, letterSpacing: '0.04em',
                        borderTop: '1px solid #f0f0f0',
                        paddingTop: '14px',
                    }}>
                        View Listing
                        <ArrowIcon />
                    </div>
                </div>
            </Link>

            <style>{`
                @media (max-width: 480px) {
                    .property-card-image { height: 220px !important; }
                    .property-card { border-radius: 10px !important; }
                }
            `}</style>
        </div>
    )
}

function Stat({ icon, value }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontFamily: "'Schibsted Grotesk', sans-serif",
            fontSize: '12.5px', fontWeight: 600, color: '#555',
        }}>
            {icon}
            <span>{value}</span>
        </div>
    )
}