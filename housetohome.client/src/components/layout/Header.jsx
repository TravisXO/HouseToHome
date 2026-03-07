import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const BLUE = '#0b699c'
const RED = '#e92026'

const NAV_ITEMS = [
    { label: 'Home', href: '/' },
    {
        label: 'Rent', href: '#',
        dropdown: [
            { label: 'Residential For Rent', href: '/residential-rent' },
            { label: 'Commercial For Rent', href: '/commercial-rent' },
        ],
    },
    {
        label: 'Buy', href: '#',
        dropdown: [
            { label: 'Residential For Sale', href: '/residential-sale' },
            { label: 'Land For Sale', href: '/land-sale' },
            { label: 'Commercial For Sale', href: '/commercial-sale' },
            { label: 'Investment Properties', href: '/investments' },
        ],
    },
    { label: 'About Us', href: '/about' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Blog', href: '/blog' },
]

const FacebookIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
)

const WhatsAppIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
)

const ChevronDown = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
)

const MenuIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
)

const CloseIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

function NavItem({ item }) {
    const [open, setOpen] = useState(false)
    const hasDropdown = item.dropdown?.length > 0

    return (
        <div
            className="relative"
            onMouseEnter={() => hasDropdown && setOpen(true)}
            onMouseLeave={() => hasDropdown && setOpen(false)}
        >
            <Link
                to={item.href}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors duration-200"
                style={{ fontFamily: "'Schibsted Grotesk', sans-serif", color: '#1a1a1a', letterSpacing: '0.035em' }}
                onMouseEnter={e => e.currentTarget.style.color = BLUE}
                onMouseLeave={e => e.currentTarget.style.color = '#1a1a1a'}
            >
                {item.label}
                {hasDropdown && (
                    <span style={{ display: 'inline-flex', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: open ? RED : 'currentColor' }}>
                        <ChevronDown />
                    </span>
                )}
            </Link>

            {hasDropdown && open && (
                <div className="absolute top-full left-0 pt-1 z-50" style={{ minWidth: '215px' }}>
                    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderTop: `2px solid ${BLUE}`, borderRadius: '0 0 6px 6px', boxShadow: '0 8px 32px rgba(11,105,156,0.10)', overflow: 'hidden' }}>
                        {item.dropdown.map((sub, i) => (
                            <Link
                                key={sub.label}
                                to={sub.href}
                                className="flex items-center gap-2 px-4 py-3 text-sm transition-all duration-150"
                                style={{ fontFamily: "'Schibsted Grotesk', sans-serif", color: '#222', borderBottom: i < item.dropdown.length - 1 ? '1px solid #f5f5f5' : 'none', letterSpacing: '0.02em' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#f7fbff'; e.currentTarget.style.color = BLUE; e.currentTarget.style.paddingLeft = '20px' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#222'; e.currentTarget.style.paddingLeft = '16px' }}
                            >
                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: RED, flexShrink: 0 }} />
                                {sub.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function Header() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [mobileDropdown, setMobileDropdown] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <>
            {/* Top Info Bar */}
            <div style={{ background: BLUE, color: '#fff', fontFamily: "'Schibsted Grotesk', sans-serif", letterSpacing: '0.03em' }}>
                <div className="hidden lg:flex items-center justify-between px-8" style={{ height: '36px', fontSize: '12px', maxWidth: '1600px', margin: '0 auto' }}>
                    <span style={{ opacity: 0.88 }}>📍 16 Serval Road, Kabulonga, Lusaka, Zambia</span>
                    <div className="flex items-center gap-5" style={{ opacity: 0.9 }}>
                        <a href="mailto:info@housetohome.com" style={{ color: '#fff' }}>info@housetohome.com</a>
                        <a href="tel:+260979818280" style={{ color: '#fff' }}>+260 979 818 280</a>
                    </div>
                </div>
            </div>

            <header
                className="w-full sticky top-0 z-40 transition-all duration-300"
                style={{
                    background: '#ffffff',
                    borderBottom: `2px solid ${scrolled ? BLUE : '#ebebeb'}`,
                    boxShadow: scrolled ? '0 4px 20px rgba(11,105,156,0.10)' : 'none',
                }}
            >
                {/* Desktop */}
                <div className="hidden lg:flex items-center px-8" style={{ height: '90px', gap: '24px', maxWidth: '1600px', margin: '0 auto' }}>

                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0">
                        <img
                            src="/src/assets/logo.png"
                            alt="House to Home Zambia"
                            style={{ height: '90px', width: 'auto', objectFit: 'contain', transition: 'transform 0.3s ease' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                    </Link>

                    {/* Divider */}
                    <span style={{ width: '1px', height: '40px', background: '#e0e0e0', flexShrink: 0 }} />

                    {/* Nav Items */}
                    <nav className="flex items-center justify-center flex-1">
                        {NAV_ITEMS.map(item => <NavItem key={item.label} item={item} />)}
                    </nav>

                    {/* Divider */}
                    <span style={{ width: '1px', height: '40px', background: '#e0e0e0', flexShrink: 0 }} />

                    {/* Socials */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                            href="https://www.facebook.com/housetohomezambia/?_rdc=2&_rdr#"
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200"
                            style={{ color: BLUE, border: `1.5px solid ${BLUE}30` }}
                            aria-label="Facebook"
                            onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = '#fff'; e.currentTarget.style.border = `1.5px solid ${BLUE}` }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = BLUE; e.currentTarget.style.border = `1.5px solid ${BLUE}30` }}
                        >
                            <FacebookIcon />
                        </a>
                        <a
                            href="https://wa.me/260965127888"
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200"
                            style={{ color: RED, border: `1.5px solid ${RED}30` }}
                            aria-label="WhatsApp"
                            onMouseEnter={e => { e.currentTarget.style.background = RED; e.currentTarget.style.color = '#fff'; e.currentTarget.style.border = `1.5px solid ${RED}` }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = RED; e.currentTarget.style.border = `1.5px solid ${RED}30` }}
                        >
                            <WhatsAppIcon />
                        </a>

                        {/* CTA */}
                        <Link
                            to="/contact"
                            className="flex items-center px-5 py-2 text-xs font-semibold text-white rounded transition-all duration-200"
                            style={{ background: BLUE, fontFamily: "'Schibsted Grotesk', sans-serif", letterSpacing: '0.09em', textTransform: 'uppercase', boxShadow: `0 2px 10px ${BLUE}30`, whiteSpace: 'nowrap' }}
                            onMouseEnter={e => { e.currentTarget.style.background = RED; e.currentTarget.style.boxShadow = `0 2px 10px ${RED}40` }}
                            onMouseLeave={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.boxShadow = `0 2px 10px ${BLUE}30` }}
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>

                {/* Mobile */}
                <div className="lg:hidden flex items-center justify-between px-4" style={{ height: '68px' }}>
                    <Link to="/">
                        <img src="/src/assets/logo.png" alt="House to Home Zambia" style={{ height: '52px', width: 'auto', objectFit: 'contain' }} />
                    </Link>
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="flex items-center justify-center w-10 h-10 rounded" style={{ color: BLUE }} aria-label="Toggle navigation">
                        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="lg:hidden" style={{ borderTop: `2px solid ${BLUE}`, background: '#fff' }}>
                        <div className="px-4 py-3 flex flex-col">
                            {NAV_ITEMS.map(item => (
                                <div key={item.label}>
                                    <button
                                        className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium text-left"
                                        style={{ fontFamily: "'Schibsted Grotesk', sans-serif", color: '#111', letterSpacing: '0.03em' }}
                                        onClick={() => {
                                            if (item.dropdown) {
                                                setMobileDropdown(mobileDropdown === item.label ? null : item.label)
                                            } else {
                                                setMobileOpen(false)
                                                navigate(item.href)
                                            }
                                        }}
                                    >
                                        {item.label}
                                        {item.dropdown && (
                                            <span style={{ transform: mobileDropdown === item.label ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: BLUE }}>
                                                <ChevronDown />
                                            </span>
                                        )}
                                    </button>
                                    {item.dropdown && mobileDropdown === item.label && (
                                        <div className="ml-3 mb-1 flex flex-col" style={{ borderLeft: `2px solid ${BLUE}20` }}>
                                            {item.dropdown.map(sub => (
                                                <Link
                                                    key={sub.label}
                                                    to={sub.href}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm"
                                                    style={{ fontFamily: "'Schibsted Grotesk', sans-serif", color: '#555' }}
                                                    onClick={() => setMobileOpen(false)}
                                                >
                                                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: RED, flexShrink: 0 }} />
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="flex items-center gap-3 mt-3 pt-4" style={{ borderTop: '1px solid #f0f0f0' }}>
                                <a href="https://www.facebook.com/housetohomezambia/?_rdc=2&_rdr#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-full" style={{ color: BLUE, border: `1.5px solid ${BLUE}` }} aria-label="Facebook"><FacebookIcon /></a>
                                <a href="https://wa.me/260965127888" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-full" style={{ color: RED, border: `1.5px solid ${RED}` }} aria-label="WhatsApp"><WhatsAppIcon /></a>
                                <Link
                                    to="/contact"
                                    className="ml-auto px-5 py-2 text-xs font-semibold text-white rounded"
                                    style={{ background: BLUE, fontFamily: "'Schibsted Grotesk', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Accent rule */}
            <div style={{ height: '3px', background: `linear-gradient(to right, ${BLUE} 55%, ${RED} 100%)` }} />
        </>
    )
}