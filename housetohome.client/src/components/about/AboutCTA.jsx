import { useEffect, useRef, useState } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'

const CONTACT_POINTS = [
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
        ),
        label: 'Visit Us',
        value: 'No. 32A Leopards Lane, Kabulonga, Lusaka',
        href: 'https://maps.google.com/?q=32A+Leopards+Lane+Kabulonga+Lusaka+Zambia',
        highlight: true,
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
        ),
        label: 'Call Us',
        value: '+260 969 818 280',
        href: 'tel:+260969818280',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
            </svg>
        ),
        label: 'Email Us',
        value: 'info@housetohomezambia.com',
        href: 'mailto:info@housetohomezambia.com',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
        ),
        label: 'Website',
        value: 'www.housetohomezambia.com',
        href: 'https://www.housetohomezambia.com',
    },
]

export default function AboutCTA() {
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
            style={{
                position: 'relative', overflow: 'hidden',
                background: `linear-gradient(135deg, #071e2e 0%, #0b3d5c 50%, ${BLUE} 100%)`,
                padding: '100px 0',
            }}
        >
            {/* Background dot texture */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
                backgroundSize: '32px 32px', pointerEvents: 'none',
            }} />

            {/* Red diagonal accent */}
            <div style={{
                position: 'absolute', top: 0, right: 0, width: '40%', height: '100%',
                background: `linear-gradient(135deg, transparent 40%, rgba(233,32,38,0.07) 100%)`,
                pointerEvents: 'none',
            }} />

            {/* Large decorative text */}
            <div className="cta-deco-text" style={{
                position: 'absolute', bottom: '-40px', right: '-20px',
                fontFamily: "'Fraunces', serif", fontSize: '200px', fontWeight: 700,
                color: 'rgba(255,255,255,0.03)', lineHeight: 1, letterSpacing: '-0.05em',
                pointerEvents: 'none', userSelect: 'none',
            }}>H2H</div>

            <div className="cta-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 1 }}>
                <div className="cta-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>

                    {/* ── LEFT — Heading & CTA ── */}
                    <div style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateX(0)' : 'translateX(-48px)',
                        transition: 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                            <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11.5px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Ready to Get Started?</span>
                        </div>

                        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 24px 0' }}>
                            Let Us{' '}
                            <span style={{ position: 'relative', display: 'inline-block' }}>
                                Make Life Easier
                                <span style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '3px', background: RED, borderRadius: '2px' }} />
                            </span>
                            {' '}For You
                        </h2>

                        <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.85, margin: '0 0 16px 0', maxWidth: '460px' }}>
                            Whether you're renting, buying, selling, or investing — the House to Home team is ready to guide you every step of the way. We are a proud, 100% indigenously Zambian business committed to making real estate simple.
                        </p>

                        <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13.5px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: '0 0 36px 0', maxWidth: '400px' }}>
                            Legal representation by Mr. Mutemwa Mutemwa SC, Mutemwa Chambers, 1st Floor Kambendekela House, Dedan Kimathi Road, Lusaka.
                        </p>

                        {/* CTA Buttons */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            <a href="/contact" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '9px',
                                padding: '14px 32px', background: RED, color: '#fff',
                                fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13px', fontWeight: 700,
                                letterSpacing: '0.07em', textTransform: 'uppercase', borderRadius: '6px',
                                textDecoration: 'none', boxShadow: `0 6px 28px rgba(233,32,38,0.45)`,
                                transition: 'all 0.25s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = RED; e.currentTarget.style.boxShadow = '0 6px 28px rgba(255,255,255,0.15)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = RED; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = `0 6px 28px rgba(233,32,38,0.45)` }}
                            >
                                Contact Us
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            </a>
                            <a href="/listings" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '9px',
                                padding: '14px 32px', background: 'transparent', color: '#fff',
                                fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13px', fontWeight: 700,
                                letterSpacing: '0.07em', textTransform: 'uppercase', borderRadius: '6px',
                                textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.35)',
                                transition: 'all 0.25s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)' }}
                            >
                                View Listings
                            </a>
                        </div>
                    </div>

                    {/* ── RIGHT — Contact cards ── */}
                    <div style={{
                        display: 'flex', flexDirection: 'column', gap: '14px',
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateX(0)' : 'translateX(48px)',
                        transition: 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s',
                    }}>
                        {CONTACT_POINTS.map((point, i) => (
                            <a
                                key={point.label}
                                href={point.href}
                                target={point.href.startsWith('https') ? '_blank' : undefined}
                                rel={point.href.startsWith('https') ? 'noopener noreferrer' : undefined}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '20px',
                                    padding: '20px 26px',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px', textDecoration: 'none',
                                    backdropFilter: 'blur(8px)',
                                    transition: 'all 0.25s ease',
                                    opacity: visible ? 1 : 0,
                                    transform: visible ? 'translateY(0)' : 'translateY(20px)',
                                    transitionDelay: `${0.3 + i * 0.09}s`,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.transform = 'translateX(6px)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateX(0)' }}
                            >
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    background: point.highlight ? RED : 'rgba(255,255,255,0.1)',
                                    border: point.highlight ? 'none' : '1px solid rgba(255,255,255,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', flexShrink: 0,
                                }}>
                                    {point.icon}
                                </div>
                                <div>
                                    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10.5px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{point.label}</div>
                                    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{point.value}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) and (min-width: 769px) {
                    .cta-container { padding: 0 32px !important; }
                    .cta-inner { gap: 48px !important; }
                    .cta-deco-text { font-size: 130px !important; }
                }
                @media (max-width: 768px) and (min-width: 481px) {
                    .cta-container { padding: 0 28px !important; }
                    .cta-inner { grid-template-columns: 1fr !important; gap: 48px !important; }
                    .cta-deco-text { font-size: 100px !important; }
                }
                @media (max-width: 480px) {
                    .cta-container { padding: 0 20px !important; }
                    .cta-inner { grid-template-columns: 1fr !important; gap: 40px !important; }
                    .cta-deco-text { font-size: 72px !important; }
                }
            `}</style>
        </section>
    )
}