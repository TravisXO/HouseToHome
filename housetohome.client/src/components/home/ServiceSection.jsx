import { useEffect, useRef, useState } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'

const SERVICES = [
    {
        id: 'renters',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
        title: 'For Renters',
        tagline: 'Find Your Perfect Home',
        body: 'We help you find a house or apartment that fits your needs. Our apartment listings are updated daily — giving you access to the freshest inventory in Lusaka\'s most desirable neighbourhoods.',
        cta: 'Browse Rentals',
        href: '/residential-rent',
        accent: BLUE,
    },
    {
        id: 'owners',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        ),
        title: 'For Property Owners',
        tagline: 'Maximize Your Returns',
        body: 'Rent your house or apartment with us. As one of Zambia\'s top real estate companies, we find reliable, vetted tenants quickly — so your property never sits empty.',
        cta: 'List Your Property',
        href: '/contact',
        accent: RED,
        featured: true,
    },
    {
        id: 'buyers',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
        ),
        title: 'For Buyers & Sellers',
        tagline: 'Buy, Sell or Invest',
        body: 'Looking to buy a property or apartment? Explore our for-sale listings. We also offer buy-to-rent properties for commercial investment — with expert guidance at every step.',
        cta: 'Explore For Sale',
        href: '/residential-sale',
        accent: BLUE,
    },
]

export default function ServicesSection() {
    const [visible, setVisible] = useState(false)
    const sectionRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true) },
            { threshold: 0.1 }
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    return (
        <section
            ref={sectionRef}
            className="services-section"
            style={{ background: '#f9f9f9', padding: '100px 0', overflow: 'hidden' }}
        >
            <div className="services-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px' }}>

                {/* ── Section Header ── */}
                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: '64px',
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(24px)',
                        transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                        <span style={{
                            fontFamily: "'Schibsted Grotesk', sans-serif",
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: RED,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                        }}>What We Offer</span>
                        <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                    </div>
                    <h2 style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                        fontWeight: 700,
                        color: '#111',
                        margin: '0 0 16px 0',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.15,
                    }}>
                        Our{' '}
                        <span style={{ color: BLUE }}>Services</span>
                    </h2>
                    <p style={{
                        fontFamily: "'Schibsted Grotesk', sans-serif",
                        fontSize: '15.5px',
                        color: '#888',
                        maxWidth: '480px',
                        margin: '0 auto',
                        lineHeight: 1.7,
                    }}>
                        Whether you're renting, owning, buying or selling — we have the expertise to guide you every step of the way.
                    </p>
                </div>

                {/* ── Service Cards ── */}
                <div className="services-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '24px',
                    alignItems: 'stretch',
                }}>
                    {SERVICES.map((service, i) => (
                        <div
                            key={service.id}
                            style={{
                                position: 'relative',
                                background: service.featured ? `linear-gradient(145deg, ${BLUE} 0%, #0a4f78 100%)` : '#fff',
                                borderRadius: '16px',
                                padding: '40px 36px',
                                boxShadow: service.featured
                                    ? `0 24px 64px rgba(11,105,156,0.25)`
                                    : '0 4px 24px rgba(0,0,0,0.07)',
                                border: service.featured ? `none` : '1px solid #efefef',
                                overflow: 'hidden',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                opacity: visible ? 1 : 0,
                                transform: visible
                                    ? (service.featured ? 'translateY(-8px)' : 'translateY(0)')
                                    : 'translateY(40px)',
                                transitionDelay: `${i * 0.12}s`,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = service.featured ? 'translateY(-14px)' : 'translateY(-6px)'
                                e.currentTarget.style.boxShadow = service.featured
                                    ? `0 32px 80px rgba(11,105,156,0.35)`
                                    : '0 16px 48px rgba(0,0,0,0.12)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = service.featured ? 'translateY(-8px)' : 'translateY(0)'
                                e.currentTarget.style.boxShadow = service.featured
                                    ? `0 24px 64px rgba(11,105,156,0.25)`
                                    : '0 4px 24px rgba(0,0,0,0.07)'
                            }}
                        >
                            {/* Featured top accent */}
                            {service.featured && (
                                <>
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0,
                                        height: '3px',
                                        background: `linear-gradient(to right, ${RED}, transparent)`,
                                    }} />
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px', right: '16px',
                                        padding: '4px 12px',
                                        background: RED,
                                        borderRadius: '50px',
                                        fontFamily: "'Schibsted Grotesk', sans-serif",
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        color: '#fff',
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                    }}>Popular</div>
                                </>
                            )}

                            {/* Background decoration for featured */}
                            {service.featured && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-30px', right: '-30px',
                                    width: '160px', height: '160px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.04)',
                                    pointerEvents: 'none',
                                }} />
                            )}

                            {/* Icon */}
                            <div style={{
                                width: '68px', height: '68px',
                                borderRadius: '16px',
                                background: service.featured
                                    ? 'rgba(255,255,255,0.12)'
                                    : `${service.accent}12`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: service.featured ? '#fff' : service.accent,
                                marginBottom: '28px',
                                flexShrink: 0,
                                border: service.featured ? '1px solid rgba(255,255,255,0.2)' : `1px solid ${service.accent}20`,
                            }}>
                                {service.icon}
                            </div>

                            {/* Tagline */}
                            <div style={{
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '11px',
                                fontWeight: 700,
                                color: service.featured ? RED : service.accent,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                marginBottom: '10px',
                            }}>{service.tagline}</div>

                            {/* Title */}
                            <h3 style={{
                                fontFamily: "'Fraunces', serif",
                                fontSize: '22px',
                                fontWeight: 700,
                                color: service.featured ? '#fff' : '#111',
                                margin: '0 0 16px 0',
                                lineHeight: 1.2,
                                letterSpacing: '-0.01em',
                            }}>{service.title}</h3>

                            {/* Divider */}
                            <div style={{
                                width: '40px', height: '2px',
                                background: service.featured ? 'rgba(255,255,255,0.3)' : `${service.accent}40`,
                                borderRadius: '2px',
                                marginBottom: '18px',
                            }} />

                            {/* Body */}
                            <p style={{
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '14.5px',
                                color: service.featured ? 'rgba(255,255,255,0.75)' : '#666',
                                lineHeight: 1.75,
                                margin: '0 0 32px 0',
                                flex: 1,
                            }}>{service.body}</p>

                            {/* CTA */}
                            <a
                                href={service.href}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '7px',
                                    padding: '11px 20px',
                                    borderRadius: '6px',
                                    border: service.featured ? `1.5px solid rgba(255,255,255,0.3)` : `1.5px solid ${service.accent}`,
                                    background: 'transparent',
                                    color: service.featured ? '#fff' : service.accent,
                                    fontFamily: "'Schibsted Grotesk', sans-serif",
                                    fontSize: '12.5px',
                                    fontWeight: 700,
                                    letterSpacing: '0.05em',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                    alignSelf: 'flex-start',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = service.featured ? 'rgba(255,255,255,0.15)' : service.accent
                                    e.currentTarget.style.color = service.featured ? '#fff' : '#fff'
                                    e.currentTarget.style.borderColor = service.featured ? 'rgba(255,255,255,0.5)' : service.accent
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = service.featured ? '#fff' : service.accent
                                    e.currentTarget.style.borderColor = service.featured ? 'rgba(255,255,255,0.3)' : service.accent
                                }}
                            >
                                {service.cta}
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`

                /* ── 1024px – 769px (tablet landscape) ── */
                @media (max-width: 1024px) and (min-width: 769px) {
                    .services-section { padding: 80px 0 !important; }
                    .services-container { padding: 0 32px !important; }
                    .services-grid { grid-template-columns: repeat(2, 1fr) !important; max-width: 720px; margin: 0 auto; }
                }

                /* ── 768px – 480px (tablet portrait) ── */
                @media (max-width: 768px) and (min-width: 481px) {
                    .services-section { padding: 70px 0 !important; }
                    .services-container { padding: 0 28px !important; }
                    .services-grid { grid-template-columns: 1fr !important; max-width: 500px; margin: 0 auto; }
                }

                /* ── 480px – 0px (mobile) ── */
                @media (max-width: 480px) {
                    .services-section { padding: 60px 0 !important; }
                    .services-container { padding: 0 20px !important; }
                    .services-grid { grid-template-columns: 1fr !important; }
                }

            `}</style>
        </section>
    )
}