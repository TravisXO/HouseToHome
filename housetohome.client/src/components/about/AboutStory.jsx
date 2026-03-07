import { useEffect, useRef, useState } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'

const MILESTONES = [
    { year: '2008', text: 'House to Home Corporation Limited incorporated on 16th July 2008 under the Companies Act, CAP388 of the laws of Zambia. Company Reg. No. 73743.' },
    { year: '2010', text: 'Expanded into Supply & Delivery and Business & Marketing services — diversifying beyond real estate to serve a broader client base.' },
    { year: '2015', text: 'Grew the real estate portfolio to include Commercial, Industrial, Agricultural and Mining properties alongside Residential.' },
    { year: 'Today', text: 'A proudly indigenous Zambian holding company with six active divisions — registered with PACRA, ZRA, ZIEA, ZPPA, NAPSA, CEEC and more.' },
]

export default function AboutStory() {
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
            className="story-section"
            style={{ background: '#fff', padding: '100px 0', overflow: 'hidden' }}
        >
            <div className="story-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px' }}>

                <div className="story-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '80px',
                    alignItems: 'stretch',
                }}>

                    {/* ── LEFT — Image panel ── */}
                    <div
                        className="story-image-panel"
                        style={{
                            position: 'relative',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            minHeight: '620px',
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateX(0)' : 'translateX(-48px)',
                            transition: 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                    >
                        <img
                            src="/src/assets/about-main.jpg"
                            alt="House to Home Zambia team"
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={e => { e.currentTarget.style.display = 'none' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(5,20,35,0.88) 0%, rgba(5,20,35,0.35) 55%, transparent 100%)` }} />
                        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(145deg, #071e2e 0%, #0b3d5c 50%, ${BLUE} 100%)`, zIndex: -1 }} />

                        {/* Established pill */}
                        <div style={{
                            position: 'absolute', top: '28px', left: '28px',
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '8px 16px',
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50px', backdropFilter: 'blur(8px)',
                        }}>
                            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: RED, flexShrink: 0 }} />
                            <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11.5px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                Est. Zambia — 16 July 2008
                            </span>
                        </div>

                        {/* Motto overlay */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, padding: '36px 40px',
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateY(0)' : 'translateY(24px)',
                            transition: 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.4s',
                        }}>
                            <div style={{ width: '36px', height: '3px', background: RED, borderRadius: '2px', marginBottom: '14px' }} />
                            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.3rem, 2vw, 1.8rem)', fontWeight: 400, fontStyle: 'italic', color: '#fff', lineHeight: 1.4, margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
                                "We make life easier."
                            </p>
                            <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11.5px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                Mission Statement — H2H Group
                            </span>
                        </div>
                    </div>

                    {/* ── RIGHT — Story content ── */}
                    <div style={{
                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateX(0)' : 'translateX(48px)',
                        transition: 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                            <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11.5px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Our Story</span>
                        </div>

                        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontWeight: 700, color: '#111', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 28px 0' }}>
                            About <span style={{ color: BLUE }}>House To Home</span>
                        </h2>

                        <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '15px', color: '#666', lineHeight: 1.85, margin: '0 0 16px 0' }}>
                            The House to Home Holdings (House to Home Corporation Limited) group, alias H2H, was established in <strong style={{ color: '#333' }}>2008</strong> with the vision to build a Holding Company with diversified business interests — initially starting in real estate before expanding into six active divisions.
                        </p>
                        <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '15px', color: '#666', lineHeight: 1.85, margin: '0 0 16px 0' }}>
                            Since its inception, H2H has established its reputation as a trustworthy, efficient, and dynamic business. Our primary objective is to provide quality products and services to a wide client base — whether individuals, SMEs, medium to large businesses, or NGOs.
                        </p>
                        <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '15px', color: '#666', lineHeight: 1.85, margin: '0 0 36px 0' }}>
                            H2H is solely owned by <strong style={{ color: '#333' }}>indigenous Zambians</strong> and registered under the Companies Act, <strong style={{ color: '#333' }}>CAP388</strong> of the laws of Zambia — Company Registration No. <strong style={{ color: '#333' }}>73743</strong>.
                        </p>

                        {/* Timeline */}
                        <div style={{ marginBottom: '40px' }}>
                            {MILESTONES.map((m, i) => (
                                <div key={m.year} style={{
                                    display: 'flex', gap: '20px',
                                    opacity: visible ? 1 : 0,
                                    transform: visible ? 'translateY(0)' : 'translateY(16px)',
                                    transition: `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${0.5 + i * 0.1}s`,
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                        <div style={{
                                            width: '56px', height: '28px',
                                            background: i === MILESTONES.length - 1 ? RED : `${BLUE}12`,
                                            borderRadius: '4px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '12px', fontWeight: 700, color: i === MILESTONES.length - 1 ? '#fff' : BLUE }}>{m.year}</span>
                                        </div>
                                        {i < MILESTONES.length - 1 && (
                                            <div style={{ width: '1px', flex: 1, minHeight: '24px', background: '#e8e8e8', margin: '4px 0' }} />
                                        )}
                                    </div>
                                    <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13.5px', color: '#777', lineHeight: 1.7, margin: '4px 0 20px 0' }}>{m.text}</p>
                                </div>
                            ))}
                        </div>

                        <div>
                            <a href="/contact"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                    padding: '13px 28px', background: BLUE, color: '#fff',
                                    fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13px', fontWeight: 700,
                                    letterSpacing: '0.07em', textTransform: 'uppercase', borderRadius: '6px',
                                    textDecoration: 'none', boxShadow: `0 4px 20px rgba(11,105,156,0.3)`, transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = RED; e.currentTarget.style.boxShadow = `0 4px 20px rgba(233,32,38,0.35)` }}
                                onMouseLeave={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.boxShadow = `0 4px 20px rgba(11,105,156,0.3)` }}
                            >
                                Get In Touch
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) and (min-width: 769px) {
                    .story-section { padding: 80px 0 !important; }
                    .story-container { padding: 0 32px !important; }
                    .story-grid { gap: 48px !important; }
                    .story-image-panel { min-height: 500px !important; }
                }
                @media (max-width: 768px) and (min-width: 481px) {
                    .story-section { padding: 70px 0 !important; }
                    .story-container { padding: 0 28px !important; }
                    .story-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
                    .story-image-panel { min-height: 380px !important; }
                }
                @media (max-width: 480px) {
                    .story-section { padding: 60px 0 !important; }
                    .story-container { padding: 0 20px !important; }
                    .story-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
                    .story-image-panel { min-height: 280px !important; }
                }
            `}</style>
        </section>
    )
}