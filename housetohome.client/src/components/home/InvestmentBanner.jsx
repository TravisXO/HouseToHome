import { useEffect, useRef, useState } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'

const FEATURES = [
    { icon: '📈', label: 'High Rental Yields' },
    { icon: '🏙️', label: 'Prime Lusaka Locations' },
    { icon: '🔑', label: 'Turnkey Properties' },
    { icon: '💼', label: 'Expert Guidance' },
]

export default function InvestmentBanner() {
    const [visible, setVisible] = useState(false)
    const sectionRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true) },
            { threshold: 0.15 }
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    return (
        <section
            ref={sectionRef}
            className="investment-section"
            style={{
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, #071e2e 0%, #0b3d5c 50%, #0b699c 100%)`,
                padding: '100px 0',
            }}
        >
            {/* ── Background texture dots ── */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
                backgroundSize: '32px 32px',
                pointerEvents: 'none',
            }} />

            {/* ── Red diagonal accent ── */}
            <div style={{
                position: 'absolute',
                top: 0, right: 0,
                width: '40%',
                height: '100%',
                background: `linear-gradient(135deg, transparent 40%, rgba(233,32,38,0.08) 100%)`,
                pointerEvents: 'none',
            }} />

            {/* ── Large decorative text ── */}
            <div className="investment-deco-text" style={{
                position: 'absolute',
                bottom: '-40px',
                right: '-20px',
                fontFamily: "'Fraunces', serif",
                fontSize: '220px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.03)',
                lineHeight: 1,
                letterSpacing: '-0.05em',
                pointerEvents: 'none',
                userSelect: 'none',
            }}>
                INVEST
            </div>

            <div className="investment-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 1 }}>
                <div className="investment-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '80px',
                    alignItems: 'center',
                }}>

                    {/* ── LEFT — Content ── */}
                    <div
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateX(0)' : 'translateX(-48px)',
                            transition: 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                    >
                        {/* Label */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                            <span style={{
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '11.5px',
                                fontWeight: 700,
                                color: RED,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                            }}>Investment Opportunities</span>
                        </div>

                        {/* Heading */}
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                            fontWeight: 700,
                            color: '#fff',
                            lineHeight: 1.15,
                            letterSpacing: '-0.02em',
                            margin: '0 0 24px 0',
                        }}>
                            Featured{' '}
                            <span style={{ position: 'relative', display: 'inline-block' }}>
                                Investment
                                <span style={{
                                    position: 'absolute', bottom: '-4px', left: 0, right: 0,
                                    height: '3px', background: RED, borderRadius: '2px',
                                }} />
                            </span>
                            {' '}Properties
                        </h2>

                        {/* Body */}
                        <p style={{
                            fontFamily: "'Schibsted Grotesk', sans-serif",
                            fontSize: '15px',
                            color: 'rgba(255,255,255,0.72)',
                            lineHeight: 1.85,
                            margin: '0 0 40px 0',
                            maxWidth: '480px',
                        }}>
                            Zambia's real estate market offers exceptional returns for savvy investors. Discover our handpicked portfolio of income-generating properties — from residential developments to commercial spaces in Lusaka's most sought-after locations.
                        </p>

                        {/* Feature pills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '40px' }}>
                            {FEATURES.map(f => (
                                <div
                                    key={f.label}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '7px',
                                        padding: '8px 16px',
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: '50px',
                                        color: 'rgba(255,255,255,0.85)',
                                        fontFamily: "'Schibsted Grotesk', sans-serif",
                                        fontSize: '12.5px',
                                        fontWeight: 500,
                                    }}
                                >
                                    <span>{f.icon}</span>
                                    {f.label}
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <a
                            href="/investments"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '15px 32px',
                                background: RED,
                                color: '#fff',
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '13.5px',
                                fontWeight: 700,
                                letterSpacing: '0.07em',
                                textTransform: 'uppercase',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                boxShadow: `0 6px 28px rgba(233,32,38,0.45)`,
                                transition: 'all 0.25s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = RED; e.currentTarget.style.boxShadow = '0 6px 28px rgba(255,255,255,0.2)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = RED; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = `0 6px 28px rgba(233,32,38,0.45)` }}
                        >
                            Explore Our Exclusive Properties
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                        </a>
                    </div>

                    {/* ── RIGHT — Stats cards ── */}
                    <div
                        className="investment-stats-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateX(0)' : 'translateX(48px)',
                            transition: 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s',
                        }}
                    >
                        {[
                            { value: '15–22%', label: 'Annual Rental Yield', desc: 'Average return on residential investments in Lusaka' },
                            { value: '$150K+', label: 'Entry Price Point', desc: 'Access premium properties from USD 150,000' },
                            { value: '3–5yr', label: 'Capital Growth', desc: 'Typical property value appreciation cycle' },
                            { value: '100%', label: 'Managed Listings', desc: 'Full property management available on request' },
                        ].map((card, i) => (
                            <div
                                key={card.label}
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    padding: '28px 24px',
                                    backdropFilter: 'blur(8px)',
                                    transition: 'all 0.25s ease',
                                    opacity: visible ? 1 : 0,
                                    transform: visible ? 'translateY(0)' : 'translateY(24px)',
                                    transitionDelay: `${0.3 + i * 0.1}s`,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                            >
                                <div style={{
                                    fontFamily: "'Fraunces', serif",
                                    fontSize: '28px',
                                    fontWeight: 700,
                                    color: '#fff',
                                    lineHeight: 1,
                                    marginBottom: '6px',
                                }}>{card.value}</div>
                                <div style={{
                                    fontFamily: "'Schibsted Grotesk', sans-serif",
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: RED,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    marginBottom: '8px',
                                }}>{card.label}</div>
                                <div style={{
                                    fontFamily: "'Schibsted Grotesk', sans-serif",
                                    fontSize: '12.5px',
                                    color: 'rgba(255,255,255,0.5)',
                                    lineHeight: 1.6,
                                }}>{card.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Responsive styles */}
            <style>{`

                /* ── 1024px – 769px (tablet landscape) ── */
                @media (max-width: 1024px) and (min-width: 769px) {
                    .investment-section { padding: 80px 0 !important; }
                    .investment-container { padding: 0 32px !important; }
                    .investment-grid { gap: 48px !important; }
                    .investment-deco-text { font-size: 140px !important; }
                }

                /* ── 768px – 480px (tablet portrait) ── */
                @media (max-width: 768px) and (min-width: 481px) {
                    .investment-section { padding: 70px 0 !important; }
                    .investment-container { padding: 0 28px !important; }
                    .investment-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
                    .investment-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .investment-deco-text { font-size: 100px !important; bottom: -20px !important; }
                }

                /* ── 480px – 0px (mobile) ── */
                @media (max-width: 480px) {
                    .investment-section { padding: 60px 0 !important; }
                    .investment-container { padding: 0 20px !important; }
                    .investment-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
                    .investment-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
                    .investment-deco-text { font-size: 72px !important; bottom: -10px !important; }
                }

            `}</style>
        </section>
    )
}