import { useEffect, useRef, useState } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'

const VALUES = [
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
        ),
        title: 'Expert Guidance',
        description: 'We provide our clients with the necessary information to make sound choices on all aspects surrounding their needs — from costs and insurance to market strategy and legal compliance.',
        accent: BLUE,
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: 'Integrity & Transparency',
        description: 'As a business built on trust, H2H prides itself on the level of personalized service it offers all its clients — operating with transparency and accountability in every engagement.',
        accent: RED,
        featured: true,
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        title: 'Client-Centered Service',
        description: 'Our primary objective is to provide quality products and services to a wide client base — whether individuals, SMEs, medium to large businesses, NGOs, or government institutions.',
        accent: BLUE,
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
        title: 'Community & Collaboration',
        description: 'Solely owned by indigenous Zambians, H2H is invested in the communities we serve. We believe Zambia is changing and we provide flexible, modern, low-risk solutions for that change.',
        accent: BLUE,
    },
]

export default function AboutValues() {
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
            className="values-section"
            style={{ background: '#f9f9f9', padding: '100px 0', overflow: 'hidden' }}
        >
            <div className="values-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px' }}>

                {/* Header */}
                <div style={{
                    textAlign: 'center', marginBottom: '64px',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(24px)',
                    transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                        <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11.5px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase' }}>What We Stand For</span>
                        <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                    </div>
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700, color: '#111', margin: '0 0 16px 0', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                        Our <span style={{ color: BLUE }}>Core Values</span>
                    </h2>
                    <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '15.5px', color: '#888', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
                        The principles that have guided every client relationship since H2H was founded in 2008.
                    </p>
                </div>

                {/* Cards */}
                <div className="values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', alignItems: 'stretch' }}>
                    {VALUES.map((value, i) => (
                        <div
                            key={value.title}
                            style={{
                                position: 'relative',
                                background: value.featured ? `linear-gradient(145deg, ${BLUE} 0%, #0a4f78 100%)` : '#fff',
                                borderRadius: '16px', padding: '36px 30px',
                                boxShadow: value.featured ? `0 24px 64px rgba(11,105,156,0.25)` : '0 4px 24px rgba(0,0,0,0.07)',
                                border: value.featured ? 'none' : '1px solid #efefef',
                                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                opacity: visible ? 1 : 0,
                                transform: visible ? (value.featured ? 'translateY(-8px)' : 'translateY(0)') : 'translateY(40px)',
                                transitionDelay: `${i * 0.1}s`,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = value.featured ? 'translateY(-14px)' : 'translateY(-6px)'; e.currentTarget.style.boxShadow = value.featured ? `0 32px 80px rgba(11,105,156,0.35)` : '0 16px 48px rgba(0,0,0,0.12)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = value.featured ? 'translateY(-8px)' : 'translateY(0)'; e.currentTarget.style.boxShadow = value.featured ? `0 24px 64px rgba(11,105,156,0.25)` : '0 4px 24px rgba(0,0,0,0.07)' }}
                        >
                            {value.featured && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(to right, ${RED}, transparent)` }} />}
                            {value.featured && <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />}

                            <div style={{
                                width: '64px', height: '64px', borderRadius: '14px',
                                background: value.featured ? 'rgba(255,255,255,0.12)' : `${value.accent}12`,
                                border: value.featured ? '1px solid rgba(255,255,255,0.2)' : `1px solid ${value.accent}20`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: value.featured ? '#fff' : value.accent, marginBottom: '24px', flexShrink: 0,
                            }}>{value.icon}</div>

                            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 700, color: value.featured ? '#fff' : '#111', margin: '0 0 12px 0', lineHeight: 1.2, letterSpacing: '-0.01em' }}>{value.title}</h3>
                            <div style={{ width: '36px', height: '2px', background: value.featured ? 'rgba(255,255,255,0.3)' : `${value.accent}40`, borderRadius: '2px', marginBottom: '16px' }} />
                            <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '14px', color: value.featured ? 'rgba(255,255,255,0.75)' : '#666', lineHeight: 1.75, margin: 0, flex: 1 }}>{value.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) and (min-width: 769px) {
                    .values-section { padding: 80px 0 !important; }
                    .values-container { padding: 0 32px !important; }
                    .values-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 768px) and (min-width: 481px) {
                    .values-section { padding: 70px 0 !important; }
                    .values-container { padding: 0 28px !important; }
                    .values-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }
                }
                @media (max-width: 480px) {
                    .values-section { padding: 60px 0 !important; }
                    .values-container { padding: 0 20px !important; }
                    .values-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
                }
            `}</style>
        </section>
    )
}