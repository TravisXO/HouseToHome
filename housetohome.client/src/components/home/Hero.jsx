import { useState, useEffect, useRef } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'

const VIDEOS = [
    '/assets/Real_Estate_1.mp4',
    '/assets/Real_Estate_2.mp4',
    '/assets/Real_Estate_3.mp4',
]

const AGENTS = [
    {
        name: 'Raphael Bwalya',
        phone: '+260 979 818 280',
        tel: '+260979818280',
        img: '/assets/rapheal-bwalya.jpg',
    },
    {
        name: 'Ruslana Thornicroft',
        phone: '+260 965 127 888',
        tel: '+260965127888',
        img: '/assets/ruslana-thornicroft.jpg',
    },
    {
        name: 'James Banda',
        phone: '+260 966 574 377',
        tel: '+260966574377',
        img: '/assets/james-banda.jpg',
    },
]

const PROPERTY_TYPES = [
    'House',
    'Apartment',
    'Townhouse',
    'Vacant Land',
    'Farm',
    'Commercial',
    'Industrial',
]

const BEDROOM_OPTIONS = ['1+', '2+', '3+', '4+', '5+']
const BATHROOM_OPTIONS = ['1+', '2+', '3+', '4+', '5+']

function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

const SearchIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

const ChevronDownIcon = ({ rotated }) => (
    <svg
        width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: 'transform 0.3s ease', transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
)

export default function Hero() {
    const videoRef = useRef(null)
    const [queue, setQueue] = useState(() => shuffle(VIDEOS))
    const [currentIndex, setCurrentIndex] = useState(0)
    const [bannerVisible, setBannerVisible] = useState(false)
    const [headlineVisible, setHeadlineVisible] = useState(false)

    // Mobile detection
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 769)

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 769)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    // Search state
    const [searchOpen, setSearchOpen] = useState(false)
    const [listingType, setListingType] = useState('rent')
    const [searchQuery, setSearchQuery] = useState('')
    const [propertyType, setPropertyType] = useState('')
    const [currency, setCurrency] = useState('USD')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [bedrooms, setBedrooms] = useState('')
    const [bathrooms, setBathrooms] = useState('')

    useEffect(() => {
        const t1 = setTimeout(() => setHeadlineVisible(true), 300)
        const t2 = setTimeout(() => setBannerVisible(true), 600)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [])

    const handleVideoEnded = () => {
        const nextIndex = currentIndex + 1
        if (nextIndex >= queue.length) {
            setQueue(prev => {
                let newQueue = shuffle(VIDEOS)
                while (newQueue[0] === prev[prev.length - 1]) {
                    newQueue = shuffle(VIDEOS)
                }
                return newQueue
            })
            setCurrentIndex(0)
        } else {
            setCurrentIndex(nextIndex)
        }
    }

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load()
            videoRef.current.play().catch(() => { })
        }
    }, [queue, currentIndex])

    const inputStyle = {
        width: '100%',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: '6px',
        padding: '9px 12px',
        color: '#fff',
        fontFamily: "'Schibsted Grotesk', sans-serif",
        fontSize: '12.5px',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    }

    const selectStyle = {
        ...inputStyle,
        cursor: 'pointer',
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        paddingRight: '28px',
    }

    const labelStyle = {
        fontFamily: "'Schibsted Grotesk', sans-serif",
        fontSize: '10.5px',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '5px',
        display: 'block',
    }

    return (
        <section style={{ position: 'relative', width: '100%', height: '92vh', minHeight: '600px', overflow: 'hidden', background: '#000' }}>

            {/* ── Video Background ── */}
            <video
                ref={videoRef}
                onEnded={handleVideoEnded}
                muted
                playsInline
                autoPlay
                style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    zIndex: 0,
                }}
            >
                <source src={queue[currentIndex]} type="video/mp4" />
            </video>

            {/* ── Dark overlay ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: isMobile
                    ? 'rgba(0,0,0,0.52)'
                    : 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 100%)',
            }} />

            {/* ── Container — constrains content to 1600px ── */}
            <div
                className="relative w-full h-full"
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 3,
                    maxWidth: '1600px',
                    margin: '0 auto',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                }}
            >

                {/* ── LEFT — Headline ── */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: isMobile ? '50%' : '5%',
                        transform: isMobile
                            ? (headlineVisible ? 'translate(-50%, -50%)' : 'translate(calc(-50% - 40px), -50%)')
                            : (headlineVisible ? 'translate(0, -50%)' : 'translate(-40px, -50%)'),
                        opacity: headlineVisible ? 1 : 0,
                        transition: 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
                        width: isMobile ? '90%' : 'auto',
                        maxWidth: isMobile ? '480px' : (searchOpen ? '500px' : '440px'),
                        pointerEvents: 'auto',
                        textAlign: isMobile ? 'center' : 'left',
                    }}
                >
                    {/* Accent line */}
                    <div style={{
                        width: '48px', height: '3px',
                        background: `linear-gradient(to right, ${RED}, ${BLUE})`,
                        borderRadius: '2px',
                        marginBottom: '20px',
                        marginLeft: isMobile ? 'auto' : '0',
                        marginRight: isMobile ? 'auto' : '0',
                    }} />

                    <h1 style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                        fontWeight: 700,
                        color: '#ffffff',
                        lineHeight: 1.15,
                        letterSpacing: '-0.01em',
                        textShadow: '0 2px 20px rgba(0,0,0,0.4)',
                        margin: 0,
                    }}>
                        Find Your Dream Home With{' '}
                        <span style={{ color: '#fff', position: 'relative', display: 'inline-block' }}>
                            House To Home
                            <span style={{
                                position: 'absolute', bottom: '-4px', left: 0, right: 0,
                                height: '3px', background: RED, borderRadius: '2px',
                            }} />
                        </span>
                        {' '}Zambia!
                    </h1>

                    {/* ── Search Toggle ── */}
                    <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start' }}>

                        {/* Toggle pill button */}
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '9px',
                                background: searchOpen ? BLUE : 'rgba(255,255,255,0.12)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                border: `1.5px solid ${searchOpen ? BLUE : 'rgba(255,255,255,0.35)'}`,
                                borderRadius: '50px',
                                padding: '10px 20px 10px 16px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '13px',
                                fontWeight: 600,
                                letterSpacing: '0.04em',
                                transition: 'all 0.3s ease',
                                boxShadow: searchOpen ? `0 4px 20px rgba(11,105,156,0.45)` : '0 2px 12px rgba(0,0,0,0.25)',
                            }}
                            onMouseEnter={e => { if (!searchOpen) { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)' } }}
                            onMouseLeave={e => { if (!searchOpen) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)' } }}
                        >
                            <SearchIcon />
                            Search Properties
                            <ChevronDownIcon rotated={searchOpen} />
                        </button>

                        {/* ── Expanded Search Panel ── */}
                        <div
                            style={{
                                marginTop: '12px',
                                maxHeight: searchOpen ? '700px' : '0px',
                                opacity: searchOpen ? 1 : 0,
                                overflow: 'hidden',
                                transition: 'max-height 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease',
                                pointerEvents: searchOpen ? 'auto' : 'none',
                            }}
                        >
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(11,105,156,0.94) 0%, rgba(8,78,118,0.97) 100%)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                borderRadius: '12px',
                                border: `1px solid rgba(255,255,255,0.15)`,
                                borderTop: `2px solid ${RED}`,
                                padding: '20px',
                                boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px',
                            }}>

                                {/* ── For Rent / For Sale Toggle ── */}
                                <div style={{
                                    display: 'flex',
                                    background: 'rgba(0,0,0,0.25)',
                                    borderRadius: '8px',
                                    padding: '3px',
                                    gap: '3px',
                                }}>
                                    {['rent', 'sale'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setListingType(type)}
                                            style={{
                                                flex: 1,
                                                padding: '8px 0',
                                                borderRadius: '6px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                                fontSize: '12.5px',
                                                fontWeight: 700,
                                                letterSpacing: '0.06em',
                                                textTransform: 'uppercase',
                                                transition: 'all 0.2s ease',
                                                background: listingType === type ? (type === 'rent' ? BLUE : RED) : 'transparent',
                                                color: listingType === type ? '#fff' : 'rgba(255,255,255,0.5)',
                                                boxShadow: listingType === type ? '0 2px 10px rgba(0,0,0,0.25)' : 'none',
                                            }}
                                        >
                                            For {type === 'rent' ? 'Rent' : 'Sale'}
                                        </button>
                                    ))}
                                </div>

                                {/* ── Location Search ── */}
                                <div>
                                    <label style={labelStyle}>Location</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}>
                                            <SearchIcon />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Province, city, town or neighbourhood…"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            style={{ ...inputStyle, paddingLeft: '34px' }}
                                            onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
                                            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'}
                                        />
                                    </div>
                                </div>

                                {/* ── Property Type ── */}
                                <div>
                                    <label style={labelStyle}>Property Type</label>
                                    <select
                                        value={propertyType}
                                        onChange={e => setPropertyType(e.target.value)}
                                        style={selectStyle}
                                        onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
                                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'}
                                    >
                                        <option value="" style={{ background: '#0b5a85', color: '#fff' }}>All Property Types</option>
                                        {PROPERTY_TYPES.map(type => (
                                            <option key={type} value={type} style={{ background: '#0b5a85', color: '#fff' }}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* ── Currency + Price Range ── */}
                                <div className="hero-price-grid" style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: '8px' }}>
                                    <div>
                                        <label style={labelStyle}>Currency</label>
                                        <select
                                            value={currency}
                                            onChange={e => { setCurrency(e.target.value); setMinPrice(''); setMaxPrice('') }}
                                            style={selectStyle}
                                            onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
                                            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'}
                                        >
                                            <option value="USD" style={{ background: '#0b5a85', color: '#fff' }}>$ USD</option>
                                            <option value="ZMW" style={{ background: '#0b5a85', color: '#fff' }}>K ZMW</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Min Price</label>
                                        <input
                                            type="number"
                                            placeholder={currency === 'USD' ? '$ 0' : 'K 0'}
                                            value={minPrice}
                                            onChange={e => setMinPrice(e.target.value)}
                                            style={inputStyle}
                                            onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
                                            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Max Price</label>
                                        <input
                                            type="number"
                                            placeholder={currency === 'USD' ? '$ Any' : 'K Any'}
                                            value={maxPrice}
                                            onChange={e => setMaxPrice(e.target.value)}
                                            style={inputStyle}
                                            onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
                                            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'}
                                        />
                                    </div>
                                </div>

                                {/* ── Bedrooms & Bathrooms ── */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <div>
                                        <label style={labelStyle}>Bedrooms</label>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {BEDROOM_OPTIONS.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setBedrooms(bedrooms === opt ? '' : opt)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '7px 0',
                                                        borderRadius: '5px',
                                                        border: `1px solid ${bedrooms === opt ? BLUE : 'rgba(255,255,255,0.18)'}`,
                                                        background: bedrooms === opt ? BLUE : 'rgba(255,255,255,0.07)',
                                                        color: bedrooms === opt ? '#fff' : 'rgba(255,255,255,0.65)',
                                                        fontFamily: "'Schibsted Grotesk', sans-serif",
                                                        fontSize: '11.5px',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease',
                                                    }}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Bathrooms</label>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {BATHROOM_OPTIONS.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setBathrooms(bathrooms === opt ? '' : opt)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '7px 0',
                                                        borderRadius: '5px',
                                                        border: `1px solid ${bathrooms === opt ? RED : 'rgba(255,255,255,0.18)'}`,
                                                        background: bathrooms === opt ? RED : 'rgba(255,255,255,0.07)',
                                                        color: bathrooms === opt ? '#fff' : 'rgba(255,255,255,0.65)',
                                                        fontFamily: "'Schibsted Grotesk', sans-serif",
                                                        fontSize: '11.5px',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease',
                                                    }}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* ── Search Button ── */}
                                <button
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: RED,
                                        border: 'none',
                                        borderRadius: '7px',
                                        color: '#fff',
                                        fontFamily: "'Schibsted Grotesk', sans-serif",
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        letterSpacing: '0.07em',
                                        textTransform: 'uppercase',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        boxShadow: '0 4px 18px rgba(233,32,38,0.4)',
                                        transition: 'all 0.2s ease',
                                        marginTop: '2px',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = RED; e.currentTarget.style.boxShadow = '0 4px 18px rgba(255,255,255,0.2)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = RED; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(233,32,38,0.4)' }}
                                >
                                    <SearchIcon />
                                    Find Properties
                                </button>

                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT — Banner Panel ── */}
                <div
                    className="hero-right-banner"
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: '48px',
                        width: '30%',
                        height: 'calc(100% - 10vh)',
                        transform: bannerVisible ? 'translateX(0)' : 'translateX(100%)',
                        opacity: bannerVisible ? 1 : 0,
                        transition: 'all 1s cubic-bezier(0.22, 1, 0.36, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '48px 40px',
                        background: 'linear-gradient(135deg, rgba(11,105,156,0.96) 0%, rgba(8,80,120,0.98) 100%)',
                        backdropFilter: 'blur(8px)',
                        borderLeft: `3px solid ${RED}`,
                        borderBottom: `3px solid ${RED}`,
                        borderRadius: '0 0 12px 0',
                        boxShadow: '-8px 0 40px rgba(0,0,0,0.3)',
                        gap: '28px',
                        overflowY: 'auto',
                        pointerEvents: 'auto',
                    }}
                >
                    {/* Top red accent bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(to right, ${RED}, transparent)` }} />

                    {/* Headline */}
                    <div>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(1.3rem, 2.2vw, 1.85rem)',
                            fontWeight: 700,
                            color: '#fff',
                            lineHeight: 1.25,
                            margin: '0 0 10px 0',
                            letterSpacing: '-0.01em',
                        }}>
                            Apartments & Houses for Rent in Lusaka, Zambia
                        </h2>
                        <p style={{
                            fontFamily: "'Schibsted Grotesk', sans-serif",
                            fontSize: '13.5px',
                            color: 'rgba(255,255,255,0.78)',
                            lineHeight: 1.7,
                            margin: 0,
                        }}>
                            Your Trusted Rental Agency for Homes, Apartments, and Commercial Properties.
                        </p>
                    </div>

                    {/* CTA */}
                    <a
                        href="/contact"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            alignSelf: 'flex-start',
                            padding: '13px 24px',
                            background: RED,
                            color: '#fff',
                            fontFamily: "'Schibsted Grotesk', sans-serif",
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            boxShadow: `0 4px 20px rgba(233,32,38,0.4)`,
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = RED; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.2)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = RED; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = `0 4px 20px rgba(233,32,38,0.4)` }}
                    >
                        Find Your Dream Home Today
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                    </a>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.15)' }} />

                    {/* Agents */}
                    <div>
                        <p style={{
                            fontFamily: "'Schibsted Grotesk', sans-serif",
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.5)',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            margin: '0 0 16px 0',
                        }}>
                            Meet Our Agents
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {AGENTS.map((agent, i) => (
                                <div
                                    key={agent.name}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        opacity: bannerVisible ? 1 : 0,
                                        transform: bannerVisible ? 'translateX(0)' : 'translateX(20px)',
                                        transition: `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${0.8 + i * 0.15}s`,
                                    }}
                                >
                                    {/* Agent photo */}
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <div style={{
                                            width: '54px', height: '54px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                                            position: 'relative',
                                        }}>
                                            <img
                                                src={agent.img}
                                                alt={agent.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                onError={e => {
                                                    e.currentTarget.style.display = 'none'
                                                    e.currentTarget.parentElement.style.background = `linear-gradient(135deg, ${BLUE}, #0a4f78)`
                                                }}
                                            />
                                            {/* Shine overlay */}
                                            <div style={{
                                                position: 'absolute', inset: 0, borderRadius: '50%',
                                                background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                                                animation: `shine 3s ease-in-out infinite ${i * 1}s`,
                                                pointerEvents: 'none',
                                            }} />
                                        </div>
                                        {/* Online dot */}
                                        <div style={{
                                            position: 'absolute', bottom: '2px', right: '2px',
                                            width: '10px', height: '10px', borderRadius: '50%',
                                            background: '#22c55e',
                                            border: '2px solid rgba(11,105,156,0.98)',
                                        }} />
                                    </div>

                                    {/* Agent info */}
                                    <div>
                                        <p style={{
                                            fontFamily: "'Schibsted Grotesk', sans-serif",
                                            fontSize: '13.5px', fontWeight: 600,
                                            color: '#fff', margin: '0 0 3px 0',
                                        }}>
                                            {agent.name}
                                        </p>
                                        <a
                                            href={`https://wa.me/${agent.tel.replace(/\s/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                                fontSize: '12px',
                                                color: 'rgba(255,255,255,0.65)',
                                                textDecoration: 'none',
                                                transition: 'color 0.2s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                                        >
                                            {agent.phone}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>{/* end container */}

            {/* ── Keyframes ── */}
            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(6px); }
                }
                @keyframes shine {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                @media (max-width: 768px) {
                    .hero-right-banner {
                        display: none !important;
                    }
                }
                @media (max-width: 480px) {
                    .hero-price-grid {
                        grid-template-columns: 1fr 1fr !important;
                    }
                    .hero-price-grid > :first-child {
                        grid-column: 1 / -1;
                    }
                }
            `}</style>
        </section>
    )
}