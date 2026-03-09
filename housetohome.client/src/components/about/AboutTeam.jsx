import { useEffect, useRef, useState } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'

const TEAM = [
    {
        name: 'Ruslana Thornicroft',
        role: 'Managing Director',
        ziea: 'ZIEA No. 884',
        phone: '+260 965 127 888',
        email: 'ruslana@housetohomezambia.com',
        image: '/public/assets/team-ruslana.jpg',
        initials: 'RT',
        featured: true,
    },
    {
        name: 'James Banda',
        role: 'Head of Operations & Marketing',
        ziea: 'ZIEA No. 894',
        phone: '+260 966 574 377',
        email: 'james@housetohomezambia.com',
        image: '/public/assets/team-james.jpg',
        initials: 'JB',
    },
    {
        name: 'Raphael Bwalya',
        role: 'Shareholder & Agent',
        ziea: 'ZIEA No. 111',
        phone: '+260 979 818 280',
        email: 'raphael@housetohomezambia.com',
        image: '/public/assets/team-raphael.jpg',
        initials: 'RB',
    },
]

const PhoneIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
)

const MailIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
)

export default function AboutTeam() {
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
            className="team-section"
            style={{ background: '#fff', padding: '100px 0', overflow: 'hidden' }}
        >
            <div className="team-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px' }}>

                {/* Header */}
                <div style={{
                    textAlign: 'center', marginBottom: '64px',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(24px)',
                    transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                        <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11.5px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase' }}>The People Behind H2H</span>
                        <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                    </div>
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700, color: '#111', margin: '0 0 16px 0', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                        Meet Our <span style={{ color: BLUE }}>Team</span>
                    </h2>
                    <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '15.5px', color: '#888', maxWidth: '440px', margin: '0 auto', lineHeight: 1.7 }}>
                        Licensed, experienced, and dedicated to finding the right property for every client.
                    </p>
                </div>

                {/* Cards */}
                <div className="team-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '32px',
                    alignItems: 'start',
                }}>
                    {TEAM.map((member, i) => (
                        <div
                            key={member.name}
                            style={{
                                background: '#fff',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                border: member.featured ? 'none' : '1px solid #efefef',
                                boxShadow: member.featured
                                    ? `0 24px 64px rgba(11,105,156,0.18)`
                                    : '0 4px 24px rgba(0,0,0,0.07)',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                opacity: visible ? 1 : 0,
                                transform: visible
                                    ? (member.featured ? 'translateY(-10px)' : 'translateY(0)')
                                    : 'translateY(40px)',
                                transitionDelay: `${i * 0.12}s`,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = member.featured ? 'translateY(-16px)' : 'translateY(-6px)'
                                e.currentTarget.style.boxShadow = member.featured
                                    ? `0 32px 80px rgba(11,105,156,0.28)`
                                    : '0 16px 48px rgba(0,0,0,0.12)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = member.featured ? 'translateY(-10px)' : 'translateY(0)'
                                e.currentTarget.style.boxShadow = member.featured
                                    ? `0 24px 64px rgba(11,105,156,0.18)`
                                    : '0 4px 24px rgba(0,0,0,0.07)'
                            }}
                        >
                            {/* ── Photo panel
                                paddingBottom: 125% = 4:5 portrait ratio
                                Gives plenty of height for full head-to-shoulder shots
                                without cropping faces on high-res images            ── */}
                            <div style={{
                                position: 'relative',
                                width: '100%',
                                paddingBottom: '125%',
                                overflow: 'hidden',
                                background: member.featured
                                    ? `linear-gradient(145deg, ${BLUE} 0%, #0a4f78 100%)`
                                    : `linear-gradient(145deg, #eef5fb 0%, #d4e8f4 100%)`,
                            }}>
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        /* face anchor — sits at top so nothing is cut off */
                                        objectPosition: 'top center',
                                        display: 'block',
                                        transition: 'transform 0.7s ease',
                                    }}
                                    onError={e => { e.currentTarget.style.display = 'none' }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                />

                                {/* Initials fallback (sits behind image) */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 0,
                                }}>
                                    <span style={{
                                        fontFamily: "'Fraunces', serif",
                                        fontSize: '96px', fontWeight: 700,
                                        color: member.featured ? 'rgba(255,255,255,0.1)' : `${BLUE}15`,
                                        userSelect: 'none',
                                    }}>{member.initials}</span>
                                </div>

                                {/* Top accent bar */}
                                {member.featured && (
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0,
                                        height: '4px',
                                        background: `linear-gradient(to right, ${RED}, transparent)`,
                                        zIndex: 3,
                                    }} />
                                )}

                                {/* Bottom gradient fade */}
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                    height: '100px',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
                                    zIndex: 2,
                                    pointerEvents: 'none',
                                }} />

                                {/* ZIEA badge */}
                                <div style={{
                                    position: 'absolute', bottom: '18px', left: '18px',
                                    padding: '6px 16px',
                                    background: member.featured ? RED : 'rgba(11,105,156,0.9)',
                                    backdropFilter: 'blur(8px)',
                                    borderRadius: '50px',
                                    fontFamily: "'Schibsted Grotesk', sans-serif",
                                    fontSize: '10.5px', fontWeight: 700,
                                    color: '#fff', letterSpacing: '0.07em', textTransform: 'uppercase',
                                    zIndex: 3,
                                }}>
                                    {member.ziea}
                                </div>
                            </div>

                            {/* Info block */}
                            <div style={{ padding: '26px 28px 30px' }}>
                                <h3 style={{
                                    fontFamily: "'Fraunces', serif",
                                    fontSize: '22px', fontWeight: 700,
                                    color: '#111', margin: '0 0 4px 0',
                                    letterSpacing: '-0.01em',
                                }}>{member.name}</h3>

                                <div style={{
                                    fontFamily: "'Schibsted Grotesk', sans-serif",
                                    fontSize: '11px', fontWeight: 700,
                                    color: member.featured ? RED : BLUE,
                                    letterSpacing: '0.1em', textTransform: 'uppercase',
                                    marginBottom: '20px',
                                }}>{member.role}</div>

                                <div style={{ height: '1px', background: '#f0f0f0', marginBottom: '18px' }} />

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <a
                                        href={`tel:${member.phone.replace(/\s/g, '')}`}
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13.5px', color: '#555', textDecoration: 'none', transition: 'color 0.2s ease' }}
                                        onMouseEnter={e => e.currentTarget.style.color = BLUE}
                                        onMouseLeave={e => e.currentTarget.style.color = '#555'}
                                    >
                                        <span style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${BLUE}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BLUE, flexShrink: 0 }}>
                                            <PhoneIcon />
                                        </span>
                                        {member.phone}
                                    </a>
                                    <a
                                        href={`mailto:${member.email}`}
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13px', color: '#555', textDecoration: 'none', transition: 'color 0.2s ease', wordBreak: 'break-all' }}
                                        onMouseEnter={e => e.currentTarget.style.color = BLUE}
                                        onMouseLeave={e => e.currentTarget.style.color = '#555'}
                                    >
                                        <span style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${BLUE}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BLUE, flexShrink: 0 }}>
                                            <MailIcon />
                                        </span>
                                        {member.email}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`

                /* ── 1024px – 769px (tablet landscape) ── */
                @media (max-width: 1024px) and (min-width: 769px) {
                    .team-section { padding: 80px 0 !important; }
                    .team-container { padding: 0 32px !important; }
                    .team-grid { gap: 24px !important; }
                }

                /* ── 768px – 480px (tablet portrait) ── */
                @media (max-width: 768px) and (min-width: 481px) {
                    .team-section { padding: 70px 0 !important; }
                    .team-container { padding: 0 28px !important; }
                    .team-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }
                }

                /* ── 480px – 0px (mobile) ── */
                @media (max-width: 480px) {
                    .team-section { padding: 60px 0 !important; }
                    .team-container { padding: 0 20px !important; }
                    .team-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
                }

            `}</style>
        </section>
    )
}