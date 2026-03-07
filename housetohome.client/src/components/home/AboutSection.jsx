import { useEffect, useRef, useState } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'

const STATS = [
    { value: '300+', label: 'Properties Listed' },
    { value: '12+', label: 'Years of Experience' },
    { value: '1,000+', label: 'Happy Clients' },
    { value: '95%', label: 'Client Satisfaction' },
]

export default function AboutSection() {
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
            className="about-section"
            style={{
                background: '#f9f9f9',
                padding: '100px 0',
                overflow: 'hidden',
            }}
        >
            <div className="about-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px' }}>

                <div className="about-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '80px',
                    alignItems: 'center',
                }}>

                    {/* ── LEFT — Image collage ── */}
                    <div
                        className="about-image-col"
                        style={{
                            position: 'relative',
                            height: '540px',
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateX(0)' : 'translateX(-48px)',
                            transition: 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                    >
                        {/* Main large image */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '75%',
                            height: '80%',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
                            background: `linear-gradient(135deg, ${BLUE} 0%, #0a4f78 100%)`,
                        }}>
                            <img
                                src="/assets/about-main.jpg"
                                alt="House to Home Zambia team"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                onError={e => { e.currentTarget.style.display = 'none' }}
                            />
                            {/* Overlay tint */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: `linear-gradient(135deg, ${BLUE}22 0%, transparent 60%)`,
                            }} />
                        </div>

                        {/* Smaller accent image */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '52%',
                            height: '55%',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                            border: '4px solid #0b699c',
                            background: `transparent`,
                        }}>
                            <img
                                src="/assets/logo.png"
                                alt="House to Home team"
                                style={{ width: '100%', height: '100%', objectFit: 'fit', display: 'block' }}
                                onError={e => { e.currentTarget.style.display = 'none' }}
                            />
                        </div>

                        {/* Red accent block */}
                        <div className="about-accent-block" style={{
                            position: 'absolute',
                            top: '-20px',
                            left: '-20px',
                            width: '80px',
                            height: '80px',
                            background: RED,
                            borderRadius: '8px',
                            zIndex: 0,
                            opacity: 0.85,
                        }} />

                        {/* Experience badge */}
                        <div style={{
                            position: 'absolute',
                            top: '32px',
                            right: '16px',
                            background: '#fff',
                            borderRadius: '12px',
                            padding: '18px 22px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            textAlign: 'center',
                            zIndex: 2,
                        }}>
                            <div style={{
                                fontFamily: "'Fraunces', serif",
                                fontSize: '32px',
                                fontWeight: 700,
                                color: BLUE,
                                lineHeight: 1,
                            }}>12+</div>
                            <div style={{
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#888',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                marginTop: '4px',
                            }}>Years in Business</div>
                        </div>
                    </div>

                    {/* ── RIGHT — Content ── */}
                    <div
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateX(0)' : 'translateX(48px)',
                            transition: 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s',
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
                            }}>About Us</span>
                        </div>

                        {/* Heading */}
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                            fontWeight: 700,
                            color: '#111',
                            lineHeight: 1.15,
                            letterSpacing: '-0.02em',
                            margin: '0 0 24px 0',
                        }}>
                            Own Your{' '}
                            <span style={{ position: 'relative', display: 'inline-block', color: BLUE }}>
                                Dreams
                                <span style={{
                                    position: 'absolute', bottom: '-2px', left: 0, right: 0,
                                    height: '3px', background: RED, borderRadius: '2px',
                                }} />
                            </span>
                        </h2>

                        {/* Body */}
                        <p style={{
                            fontFamily: "'Schibsted Grotesk', sans-serif",
                            fontSize: '15px',
                            color: '#555',
                            lineHeight: 1.85,
                            margin: '0 0 36px 0',
                        }}>
                            Since its inception, The H2H group has established its reputation in various fields of business as a trustworthy, efficient, and dynamic business. The company prides itself on the level of personalized service it offers all its clients. Our primary objective is to provide quality products and services to a wide client base, including individuals, SMEs, medium to large businesses, NGOs, and more.
                        </p>
                        <p style={{
                            fontFamily: "'Schibsted Grotesk', sans-serif",
                            fontSize: '15px',
                            color: '#555',
                            lineHeight: 1.85,
                            margin: '0 0 40px 0',
                        }}>
                            We aspire to be recognized as suppliers of quality goods and services. We believe that Zambia, like the rest of the world, is changing, and with that change, clients will require flexible methods, unconventional modern low-risk solutions, and development assistance, as well as professional services achieved through a unique approach to clients' development problems.
                        </p>

                        {/* Stats row */}
                        <div className="about-stats" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '0',
                            borderTop: '1px solid #e8e8e8',
                            paddingTop: '32px',
                        }}>
                            {STATS.map((stat, i) => (
                                <div
                                    key={stat.label}
                                    className={`about-stat-item about-stat-item-${i}`}
                                    style={{
                                        textAlign: 'center',
                                        borderRight: i < STATS.length - 1 ? '1px solid #e8e8e8' : 'none',
                                        padding: '0 16px',
                                        opacity: visible ? 1 : 0,
                                        transform: visible ? 'translateY(0)' : 'translateY(20px)',
                                        transition: `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${0.4 + i * 0.1}s`,
                                    }}
                                >
                                    <div style={{
                                        fontFamily: "'Fraunces', serif",
                                        fontSize: '28px',
                                        fontWeight: 700,
                                        color: BLUE,
                                        lineHeight: 1,
                                        marginBottom: '6px',
                                    }}>{stat.value}</div>
                                    <div style={{
                                        fontFamily: "'Schibsted Grotesk', sans-serif",
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: '#999',
                                        letterSpacing: '0.06em',
                                        textTransform: 'uppercase',
                                    }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div style={{ marginTop: '36px' }}>
                            <a
                                href="/about"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '13px 28px',
                                    background: BLUE,
                                    color: '#fff',
                                    fontFamily: "'Schibsted Grotesk', sans-serif",
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    letterSpacing: '0.07em',
                                    textTransform: 'uppercase',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    boxShadow: `0 4px 20px rgba(11,105,156,0.3)`,
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = RED; e.currentTarget.style.boxShadow = `0 4px 20px rgba(233,32,38,0.35)` }}
                                onMouseLeave={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.boxShadow = `0 4px 20px rgba(11,105,156,0.3)` }}
                            >
                                Learn More About Us
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Responsive styles */}
            <style>{`

                /* ── 1024px – 769px (tablet landscape) ── */
                @media (max-width: 1024px) and (min-width: 769px) {
                    .about-section { padding: 80px 0 !important; }
                    .about-container { padding: 0 32px !important; }
                    .about-grid { gap: 48px !important; }
                    .about-image-col { height: 460px !important; }
                }

                /* ── 768px – 480px (tablet portrait) ── */
                @media (max-width: 768px) and (min-width: 481px) {
                    .about-section { padding: 70px 0 !important; }
                    .about-container { padding: 0 28px !important; }
                    .about-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
                    .about-image-col { height: 380px !important; }
                    .about-accent-block { width: 60px !important; height: 60px !important; top: -14px !important; left: -14px !important; }
                    .about-stats { grid-template-columns: repeat(2, 1fr) !important; gap: 24px 0 !important; }
                    .about-stat-item { border-right: none !important; border-bottom: 1px solid #e8e8e8; padding-bottom: 20px !important; }
                    .about-stat-item-1, .about-stat-item-3 { border-left: 1px solid #e8e8e8; }
                    .about-stat-item-2, .about-stat-item-3 { border-bottom: none !important; padding-bottom: 0 !important; }
                }

                /* ── 480px – 0px (mobile) ── */
                @media (max-width: 480px) {
                    .about-section { padding: 60px 0 !important; }
                    .about-container { padding: 0 20px !important; }
                    .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
                    .about-image-col { height: 300px !important; }
                    .about-accent-block { width: 48px !important; height: 48px !important; top: -12px !important; left: -12px !important; }
                    .about-stats { grid-template-columns: repeat(2, 1fr) !important; gap: 20px 0 !important; }
                    .about-stat-item { border-right: none !important; border-bottom: 1px solid #e8e8e8; padding-bottom: 16px !important; }
                    .about-stat-item-1, .about-stat-item-3 { border-left: 1px solid #e8e8e8; }
                    .about-stat-item-2, .about-stat-item-3 { border-bottom: none !important; padding-bottom: 0 !important; }
                }

            `}</style>
        </section>
    )
}