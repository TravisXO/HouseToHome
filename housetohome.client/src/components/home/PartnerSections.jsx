import { useEffect, useRef, useState } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'

const PARTNERS = [
    {
        name: 'Malisa & Partners',
        logo: '/public/assets/malisa_&_partners.png',
        href: 'https://www.malisaandpartners.law/',
        description: 'Legal Partners',
    },
]

export default function PartnersSection() {
    const [visible, setVisible] = useState(false)
    const sectionRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true) },
            { threshold: 0.2 }
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    return (
        <section
            ref={sectionRef}
            style={{
                background: '#f9f9f9',
                padding: '80px 0',
                borderTop: '1px solid #efefef',
                overflow: 'hidden',
            }}
        >
            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px' }}>

                {/* ── Header ── */}
                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: '56px',
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(20px)',
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
                        }}>Our Partners</span>
                        <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                    </div>
                    <h2 style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
                        fontWeight: 700,
                        color: '#111',
                        margin: 0,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                    }}>
                        We are proud to{' '}
                        <span style={{ color: BLUE }}>partner with</span>
                    </h2>
                </div>

                {/* ── Partner Logos ── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '32px',
                }}>
                    {PARTNERS.map((partner, i) => (
                        <a
                            key={partner.name}
                            href={partner.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '36px 52px',
                                background: '#fff',
                                borderRadius: '14px',
                                border: '1px solid #efefef',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                                opacity: visible ? 1 : 0,
                                transform: visible ? 'translateY(0)' : 'translateY(24px)',
                                transitionDelay: `${i * 0.12 + 0.2}s`,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-6px)'
                                e.currentTarget.style.boxShadow = `0 16px 48px rgba(11,105,156,0.12)`
                                e.currentTarget.style.borderColor = `${BLUE}30`
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'
                                e.currentTarget.style.borderColor = '#efefef'
                            }}
                        >
                            <img
                                src={partner.logo}
                                alt={partner.name}
                                style={{
                                    height: '72px',
                                    width: 'auto',
                                    maxWidth: '240px',
                                    objectFit: 'contain',
                                    display: 'block',
                                    filter: 'grayscale(20%)',
                                    transition: 'filter 0.3s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.filter = 'grayscale(0%)'}
                                onMouseLeave={e => e.currentTarget.style.filter = 'grayscale(20%)'}
                                onError={e => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.nextSibling.style.display = 'flex'
                                }}
                            />
                            {/* Fallback if image fails */}
                            <div style={{
                                display: 'none',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '72px',
                                fontFamily: "'Fraunces', serif",
                                fontSize: '22px',
                                fontWeight: 700,
                                color: BLUE,
                                letterSpacing: '-0.02em',
                            }}>
                                {partner.name}
                            </div>
                            <div style={{
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '11.5px',
                                fontWeight: 600,
                                color: '#bbb',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                            }}>
                                {partner.description}
                            </div>
                        </a>
                    ))}
                </div>

                {/* ── Become a partner CTA ── */}
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '56px',
                        opacity: visible ? 1 : 0,
                        transition: 'opacity 0.7s ease 0.5s',
                    }}
                >
                    <p style={{
                        fontFamily: "'Schibsted Grotesk', sans-serif",
                        fontSize: '14.5px',
                        color: '#aaa',
                        margin: '0 0 16px 0',
                    }}>
                        Interested in partnering with us?
                    </p>
                    <a
                        href="/contact"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '11px 24px',
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
                        Get In Touch
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    )
}