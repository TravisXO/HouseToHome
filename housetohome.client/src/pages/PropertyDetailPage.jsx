import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

const BLUE = '#0b699c'
const RED = '#e92026'
const DARK = '#0a2540'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function routeFromProperty(listingType, propertyStatus) {
    if (listingType === 'Rent') return propertyStatus === 'Commercial' ? '/commercial-rent' : '/residential-rent'
    if (propertyStatus === 'Land') return '/land-sale'
    if (propertyStatus === 'Commercial') return '/commercial-sale'
    if (propertyStatus === 'Investment') return '/investments'
    return '/residential-sale'
}

function routeLabel(listingType, propertyStatus) {
    if (listingType === 'Rent') return propertyStatus === 'Commercial' ? 'Commercial Rent' : 'Residential Rent'
    if (propertyStatus === 'Land') return 'Land for Sale'
    if (propertyStatus === 'Commercial') return 'Commercial Sale'
    if (propertyStatus === 'Investment') return 'Investments'
    return 'Residential Sale'
}

function resolveImg(img) {
    if (!img) return null
    const raw = typeof img === 'string' ? img : (img.secureUrl || img.src || img.slug || img.Slug || '')
    if (!raw) return null
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    const wixMatch = raw.match(/wix:image:\/\/v1\/([^/]+)\//)
    const s = wixMatch ? wixMatch[1] : raw
    if (!s || s.includes('://')) return null
    return `https://static.wixstatic.com/media/${s}`
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

function Gallery({ images }) {
    const [active, setActive] = useState(0)
    const [lightbox, setLightbox] = useState(false)

    if (!images?.length) {
        return (
            <div style={{
                width: '100%', height: '360px', borderRadius: '14px',
                background: '#f1f5f9', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#cbd5e1', fontSize: '40px',
            }}>🏠</div>
        )
    }

    const main = images[active]
    const mainUrl = resolveImg(main)
    const thumbs = images.slice(0, 6)

    return (
        <>
            {/* Main image */}
            <div
                onClick={() => setLightbox(true)}
                style={{
                    width: '100%', height: '360px', borderRadius: '14px',
                    overflow: 'hidden', cursor: 'zoom-in', background: '#f1f5f9',
                    position: 'relative', marginBottom: '8px',
                }}
            >
                {mainUrl
                    ? <img key={active} src={mainUrl} alt={main?.alt || 'Property'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', animation: 'imgFade 0.25s ease' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🏠</div>
                }
                {/* Counter */}
                <div style={{
                    position: 'absolute', bottom: '12px', right: '12px',
                    background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
                    borderRadius: '20px', padding: '3px 11px',
                    fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11px',
                    fontWeight: 700, color: DARK, letterSpacing: '0.03em',
                }}>
                    {active + 1} / {images.length}
                </div>
                {/* View all */}
                <div style={{
                    position: 'absolute', bottom: '12px', left: '12px',
                    background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
                    borderRadius: '7px', padding: '5px 10px', cursor: 'pointer',
                    fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11px',
                    fontWeight: 600, color: BLUE, display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                    View all
                </div>
                {/* Prev/next arrows on main */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={e => { e.stopPropagation(); setActive(i => Math.max(0, i - 1)) }}
                            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: active === 0 ? 0.3 : 1 }}
                        >‹</button>
                        <button
                            onClick={e => { e.stopPropagation(); setActive(i => Math.min(images.length - 1, i + 1)) }}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: active === images.length - 1 ? 0.3 : 1 }}
                        >›</button>
                    </>
                )}
            </div>

            {/* Thumbnail row */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                {thumbs.map((img, i) => {
                    const url = resolveImg(img)
                    return (
                        <div
                            key={i}
                            onClick={() => setActive(i)}
                            style={{
                                flex: '0 0 72px', height: '52px', borderRadius: '8px',
                                overflow: 'hidden', cursor: 'pointer', background: '#f1f5f9',
                                outline: active === i ? `2px solid ${BLUE}` : '2px solid transparent',
                                outlineOffset: '2px', opacity: active === i ? 1 : 0.55,
                                transition: 'opacity 0.2s, outline 0.15s', flexShrink: 0,
                            }}
                        >
                            {url
                                ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                : <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />
                            }
                        </div>
                    )
                })}
                {images.length > 6 && (
                    <div
                        onClick={() => setLightbox(true)}
                        style={{
                            flex: '0 0 72px', height: '52px', borderRadius: '8px',
                            background: BLUE, cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1px', flexShrink: 0,
                        }}
                    >
                        <span style={{ fontFamily: "'Fraunces', serif", fontSize: '14px', fontWeight: 700, color: '#fff' }}>+{images.length - 6}</span>
                        <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '8px', color: 'rgba(255,255,255,0.8)', fontWeight: 700, letterSpacing: '0.06em' }}>MORE</span>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    onClick={() => setLightbox(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(10,37,64,0.92)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', cursor: 'zoom-out' }}
                >
                    <img src={resolveImg(images[active])} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '10px', cursor: 'default' }} />
                    <button onClick={() => setLightbox(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '38px', height: '38px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer' }}>✕</button>
                    {images.length > 1 && <>
                        <button onClick={e => { e.stopPropagation(); setActive(i => Math.max(0, i - 1)) }} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '46px', height: '46px', borderRadius: '50%', fontSize: '22px', cursor: 'pointer' }}>‹</button>
                        <button onClick={e => { e.stopPropagation(); setActive(i => Math.min(images.length - 1, i + 1)) }} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '46px', height: '46px', borderRadius: '50%', fontSize: '22px', cursor: 'pointer' }}>›</button>
                    </>}
                </div>
            )}
        </>
    )
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function StatPill({ icon, label, value }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: '8px', padding: '8px 12px', flex: '1 1 90px',
        }}>
            <span style={{ fontSize: '16px', lineHeight: 1 }}>{icon}</span>
            <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '14px', color: DARK, lineHeight: 1 }}>{value}</div>
                <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{label}</div>
            </div>
        </div>
    )
}

// ─── Right Panel ──────────────────────────────────────────────────────────────

function RightPanel({ property }) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [message, setMessage] = useState(`Hi, I'm interested in "${property?.title}". Please get in touch.`)
    const [sent, setSent] = useState(false)
    const isRent = property?.listingType === 'Rent'

    function handleSubmit() {
        setSent(true)
        setTimeout(() => setSent(false), 4000)
    }

    const inp = {
        width: '100%', padding: '9px 11px', borderRadius: '7px',
        border: '1.5px solid #e2e8f0', fontFamily: "'Schibsted Grotesk', sans-serif",
        fontSize: '12.5px', outline: 'none', boxSizing: 'border-box',
        background: '#fff', color: DARK, transition: 'border-color 0.2s',
    }

    return (
        <div style={{ position: 'sticky', top: '88px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Price + key info card */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 20px rgba(11,105,156,0.07)' }}>
                {/* Blue price header */}
                <div style={{ background: `linear-gradient(135deg, ${BLUE}, #085a84)`, padding: '18px 20px' }}>
                    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>
                        {isRent ? 'Monthly Rent' : 'Asking Price'}
                    </div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '22px', color: '#fff', lineHeight: 1.1 }}>
                        {property?.pricingLabel || '—'}
                    </div>
                    {isRent && <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>per month</div>}
                </div>

                {/* Key details */}
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {property?.propertyStatus && (
                            <span style={{ background: '#e0f0fa', color: BLUE, borderRadius: '20px', padding: '3px 10px', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10px', fontWeight: 700 }}>{property.propertyStatus}</span>
                        )}
                        {property?.propertyType && (
                            <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: '20px', padding: '3px 10px', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10px', fontWeight: 600, border: '1px solid #e2e8f0' }}>{property.propertyType}</span>
                        )}
                        {property?.furnishingStatus && (
                            <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: '20px', padding: '3px 10px', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10px', fontWeight: 600, border: '1px solid #e2e8f0' }}>{property.furnishingStatus}</span>
                        )}
                    </div>

                    {/* Stats grid */}
                    {(property?.bedrooms != null || property?.bathrooms != null || property?.lotSize) && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '2px' }}>
                            {property.bedrooms != null && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', borderRadius: '7px', padding: '7px 10px' }}>
                                    <span style={{ fontSize: '14px' }}>🛏</span>
                                    <div>
                                        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '13px', color: DARK }}>{property.bedrooms}</div>
                                        <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Beds</div>
                                    </div>
                                </div>
                            )}
                            {property.bathrooms != null && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', borderRadius: '7px', padding: '7px 10px' }}>
                                    <span style={{ fontSize: '14px' }}>🚿</span>
                                    <div>
                                        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '13px', color: DARK }}>{property.bathrooms}</div>
                                        <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Baths</div>
                                    </div>
                                </div>
                            )}
                            {property.lotSize && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', borderRadius: '7px', padding: '7px 10px', gridColumn: '1 / -1' }}>
                                    <span style={{ fontSize: '14px' }}>📐</span>
                                    <div>
                                        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '13px', color: DARK }}>{property.lotSize}</div>
                                        <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lot Size</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Location */}
                    {(property?.addressFormatted || property?.location) && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', padding: '8px 10px', background: '#f8fafc', borderRadius: '7px' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                            <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>{property?.addressFormatted || property?.location}</span>
                        </div>
                    )}
                </div>

                {/* Quick contact buttons */}
                <div style={{ display: 'flex', borderTop: '1px solid #f1f5f9' }}>
                    <a href="tel:+260979818280" style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        padding: '11px', textDecoration: 'none', color: BLUE,
                        fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', fontWeight: 700,
                        borderRight: '1px solid #f1f5f9', transition: 'background 0.15s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" /></svg>
                        Call
                    </a>
                    <a href={`https://wa.me/260979818280?text=Hi, I'm interested in ${encodeURIComponent(property?.title || '')}`} target="_blank" rel="noreferrer"
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                            padding: '11px', textDecoration: 'none', color: '#16a34a',
                            fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', fontWeight: 700,
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                        WhatsApp
                    </a>
                </div>
            </div>

            {/* Enquiry form card */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px 18px', boxShadow: '0 2px 20px rgba(11,105,156,0.05)' }}>
                <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px' }}>Send Enquiry</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    <input style={inp} placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
                        onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    <input style={inp} placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)}
                        onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    <textarea style={{ ...inp, minHeight: '72px', resize: 'vertical' }} value={message} onChange={e => setMessage(e.target.value)}
                        onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    <button
                        onClick={handleSubmit}
                        style={{
                            width: '100%', padding: '10px', border: 'none', borderRadius: '7px',
                            background: sent ? '#16a34a' : BLUE, color: '#fff',
                            fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 700,
                            fontSize: '12.5px', cursor: 'pointer', transition: 'background 0.2s',
                            letterSpacing: '0.03em',
                        }}
                        onMouseEnter={e => !sent && (e.currentTarget.style.background = '#085a84')}
                        onMouseLeave={e => !sent && (e.currentTarget.style.background = BLUE)}
                    >
                        {sent ? '✓ Enquiry Sent!' : 'Send Enquiry'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ style }) {
    return (
        <div style={{
            background: 'linear-gradient(90deg, #f1f5f9 25%, #e8eef4 50%, #f1f5f9 75%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
            borderRadius: '10px', ...style,
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
                const r = await fetch('/api/admin/properties')
                if (!r.ok) throw new Error('Failed to load properties.')
                const all = await r.json()
                const decoded = decodeURIComponent(slug)
                const raw = all.find(p =>
                    (p.slug && p.slug === decoded) || (p.id && p.id === decoded) ||
                    (p.Slug && p.Slug === decoded) || (p.ID && p.ID === decoded)
                )
                if (!raw) throw new Error('Property not found.')
                if (!cancelled) {
                    const arrFirst = (val, fb = '') => Array.isArray(val) ? val[0] || fb : val || fb
                    const isManaged = raw._source === 'managed' || raw.id !== undefined
                    let normalised
                    if (isManaged) {
                        const lt = raw.listingType || 'Rent'
                        normalised = {
                            id: raw.id || '', slug: raw.slug || raw.id || '',
                            title: raw.title?.trim() || '', description: raw.description?.trim() || '',
                            location: raw.location?.trim() || '',
                            listingType: lt.toLowerCase() === 'buy' ? 'Sale' : lt,
                            propertyStatus: raw.propertyStatus || 'Residential',
                            propertyType: raw.propertyType || 'House',
                            furnishingStatus: raw.furnishingStatus || '',
                            bedrooms: raw.bedrooms ?? null, bathrooms: raw.bathrooms ?? null,
                            lotSize: raw.lotSize?.trim() || '', currency: raw.currency || '$',
                            pricingLabel: raw.pricingLabel?.trim() || '',
                            amenities: raw.amenities?.trim() || '',
                            addressFormatted: raw.location?.trim() || '',
                            images: raw.images || [], latitude: null, longitude: null,
                        }
                    } else {
                        const lt = arrFirst(raw['Listing Type'], 'Rent')
                        normalised = {
                            id: raw.ID || '', slug: raw.Slug?.trim() || raw.ID || '',
                            title: raw.Title?.trim() || '', description: '',
                            location: raw.Location?.trim() || '',
                            listingType: lt.toLowerCase() === 'buy' ? 'Sale' : lt,
                            propertyStatus: arrFirst(raw['Propety Status'], 'Residential'),
                            propertyType: arrFirst(raw['Property Type'], 'House'),
                            furnishingStatus: arrFirst(raw['Furnishing Status'], ''),
                            bedrooms: raw.Bedrooms ?? null, bathrooms: raw.Bathroom ?? null,
                            lotSize: raw['Lot Size']?.trim() || '',
                            currency: arrFirst(raw.Currency, '$'),
                            pricingLabel: raw.Pricing?.trim() || '',
                            amenities: raw.Ammenities?.trim() || '',
                            addressFormatted: raw.Location?.trim() || '',
                            images: raw['Property Image'] || [], latitude: null, longitude: null,
                        }
                    }
                    setProperty(normalised)
                    setLoading(false)
                    setError(null)
                }
            } catch (err) {
                if (!cancelled) { setError(err.message); setLoading(false) }
            }
        }
        load()
        return () => { cancelled = true }
    }, [slug])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 80)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const crumbRoute = property ? routeFromProperty(property.listingType, property.propertyStatus) : null
    const crumbLabel = property ? routeLabel(property.listingType, property.propertyStatus) : null
    const isRent = property?.listingType === 'Rent'

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <style>{`
                * { box-sizing: border-box; }
                @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes imgFade { from{opacity:0} to{opacity:1} }
                .pdp-cols { display: flex; flex-direction: column; gap: 20px; }
                .pdp-right { display: none; }
                .pdp-right-mobile { display: block; }
                .amenities-content ul { padding-left: 1.2rem; margin: 0; }
                .amenities-content li { margin-bottom: 4px; font-family: 'Schibsted Grotesk', sans-serif; font-size: 13px; color: #475569; }
                .amenities-content p { font-family: 'Schibsted Grotesk', sans-serif; font-size: 13px; color: #475569; margin: 0 0 6px; }
                @media(min-width: 860px) {
                    .pdp-cols { display: grid !important; grid-template-columns: 70fr 30fr; gap: 24px; align-items: start; }
                    .pdp-right { display: block !important; }
                    .pdp-right-mobile { display: none !important; }
                }
                @media(max-width: 520px) {
                    .pdp-section { padding: 0 16px 40px !important; }
                }
            `}</style>

            {/* Sticky mini-bar */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                background: 'rgba(248,250,252,0.96)', backdropFilter: 'blur(12px)',
                borderBottom: '1px solid #e2e8f0',
                transform: scrolled ? 'translateY(0)' : 'translateY(-100%)',
                transition: 'transform 0.3s ease',
                padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
            }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '14px', color: DARK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {property?.title}
                </span>
                <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '15px', color: BLUE, whiteSpace: 'nowrap' }}>
                    {property?.pricingLabel}
                </span>
            </div>

            <section className="pdp-section" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 32px 48px' }}>

                {/* Breadcrumb */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '16px 0 14px', flexWrap: 'wrap' }}>
                    <Link to="/" style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
                    <span style={{ color: '#cbd5e1', fontSize: '12px' }}>›</span>
                    {crumbRoute && <>
                        <Link to={crumbRoute} style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', color: '#94a3b8', textDecoration: 'none' }}>{crumbLabel}</Link>
                        <span style={{ color: '#cbd5e1', fontSize: '12px' }}>›</span>
                    </>}
                    <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', color: DARK, fontWeight: 500 }}>
                        {loading ? '…' : (property?.title || 'Property')}
                    </span>
                </nav>

                {/* Error */}
                {error && (
                    <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                        <p style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', color: '#dc2626', margin: '0 0 12px' }}>{error}</p>
                        <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', background: BLUE, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600 }}>← Go Back</button>
                    </div>
                )}

                {/* Skeleton */}
                {loading && !error && (
                    <div className="pdp-cols" style={{ animation: 'fadeUp 0.3s ease' }}>
                        <div>
                            <Skeleton style={{ height: '360px', marginBottom: '8px' }} />
                            <Skeleton style={{ height: '52px', marginBottom: '16px' }} />
                            <Skeleton style={{ height: '24px', width: '60%', marginBottom: '8px' }} />
                            <Skeleton style={{ height: '16px', width: '35%' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Skeleton style={{ height: '280px' }} />
                            <Skeleton style={{ height: '180px' }} />
                        </div>
                    </div>
                )}

                {/* Main content */}
                {!loading && !error && property && (
                    <div className="pdp-cols" style={{ animation: 'fadeUp 0.4s ease' }}>

                        {/* LEFT: gallery + details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>

                            {/* Gallery */}
                            <Gallery images={property.images} />

                            {/* Title + badges */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px', flexWrap: 'wrap' }}>
                                    <span style={{ background: isRent ? BLUE : RED, color: '#fff', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 11px', borderRadius: '20px' }}>
                                        For {isRent ? 'Rent' : 'Sale'}
                                    </span>
                                    {property.propertyStatus && (
                                        <span style={{ background: '#e0f0fa', color: BLUE, fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10px', fontWeight: 700, padding: '3px 11px', borderRadius: '20px' }}>{property.propertyStatus}</span>
                                    )}
                                    {property.furnishingStatus && (
                                        <span style={{ background: '#f1f5f9', color: '#475569', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10px', fontWeight: 600, padding: '3px 11px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>{property.furnishingStatus}</span>
                                    )}
                                </div>
                                <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 'clamp(1.2rem, 2.5vw, 1.75rem)', color: DARK, margin: '0 0 6px', lineHeight: 1.2 }}>
                                    {property.title}
                                </h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                    <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12.5px', color: '#64748b' }}>{property.addressFormatted || property.location || 'Lusaka, Zambia'}</span>
                                </div>
                            </div>

                            {/* Description */}
                            {property.description && (
                                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 18px' }}>
                                    <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '14px', color: DARK, margin: '0 0 8px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>About This Property</h2>
                                    <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13px', color: '#475569', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-line' }}>{property.description}</p>
                                </div>
                            )}

                            {/* Amenities */}
                            {property.amenities && (
                                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 18px' }}>
                                    <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '14px', color: DARK, margin: '0 0 8px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>Amenities & Features</h2>
                                    <div className="amenities-content" dangerouslySetInnerHTML={{ __html: property.amenities }} />
                                </div>
                            )}

                            {/* Map */}
                            {(property.latitude || property.longitude) && (
                                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                    <div style={{ padding: '14px 18px 10px' }}>
                                        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '14px', color: DARK, margin: 0 }}>Location</h2>
                                        <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>{property.addressFormatted}</p>
                                    </div>
                                    <iframe title="Property location" width="100%" height="200" loading="lazy" style={{ display: 'block', border: 'none' }}
                                        src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`} />
                                </div>
                            )}

                            {/* Mobile right panel */}
                            <div className="pdp-right-mobile">
                                <RightPanel property={property} />
                            </div>

                            {/* Back */}
                            <div>
                                <button
                                    onClick={() => navigate(-1)}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                                        background: 'transparent', border: '1.5px solid #e2e8f0',
                                        borderRadius: '7px', padding: '8px 14px', cursor: 'pointer',
                                        fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 600,
                                        fontSize: '12px', color: '#64748b', transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.color = BLUE }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
                                >
                                    ← Back to Listings
                                </button>
                            </div>
                        </div>

                        {/* RIGHT: sticky panel */}
                        <div className="pdp-right">
                            <RightPanel property={property} />
                        </div>

                    </div>
                )}
            </section>
        </div>
    )
}