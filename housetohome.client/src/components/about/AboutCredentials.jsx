import { useEffect, useRef, useState } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'

const CREDENTIALS = [
    {
        id: 'incorporation',
        label: 'Certificate of Incorporation',
        meta: 'Reg. No. 73743 · Serial No. 331745',
        description: 'House to Home Corporation Limited incorporated as a private company limited by shares on 16th July 2008, under the Republic of Zambia Companies Act.',
        image: '/public/assets/credential-registration.jpg',
        accent: BLUE,
        authority: 'PACRA — Republic of Zambia',
    },
    {
        id: 'tpin',
        label: 'Taxpayer Identification',
        meta: 'TPIN: 2480141804 · Identity No. 73743',
        description: 'Registered with the Zambia Revenue Authority. TPIN jurisdiction: ISMTO Lusaka Province. Address: Plot No. 32 Leopards Lane, Kabulonga.',
        image: '/public/assets/credential-tax.jpg',
        accent: BLUE,
        authority: 'ZRA — Zambia Revenue Authority',
    },
    {
        id: 'ziea',
        label: 'ZIEA Corporate Practicing Certificate',
        meta: 'Membership No. 61 · Cert. 6165/2024',
        description: 'House to Home duly admitted as a Corporate Member of the Zambia Institute of Estate Agents pursuant to the Estate Agents Act (Act No. 21 of 2000), valid 1 Jan – 31 Dec 2024.',
        image: '/public/assets/credential-ziea.jpg',
        accent: RED,
        authority: 'ZIEA — Zambia Institute of Estate Agents',
    },
    {
        id: 'zppa',
        label: 'ZPPA Supplier Registration',
        meta: 'ZPPA Reg. No. 76124 · Valid 08/06/2024',
        description: 'Registered on the ZPPA e-Tendering Platform as a Local Company supplier. Approved to supply goods and services to public institutions across 15+ categories including real estate, construction, and land services.',
        image: '/public/assets/credential-zppa.jpg',
        accent: BLUE,
        authority: 'ZPPA — Zambia Public Procurement Authority',
    },
]

const DocumentIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
)

export default function AboutCredentials() {
    const [visible, setVisible] = useState(false)
    const sectionRef = useRef(null)
    const scrollRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true) },
            { threshold: 0.1 }
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    const scroll = (dir) => {
        if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' })
    }

    return (
        <section
            ref={sectionRef}
            className="credentials-section"
            style={{ background: '#f9f9f9', padding: '100px 0', overflow: 'hidden' }}
        >
            <div className="credentials-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px' }}>

                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    marginBottom: '56px', flexWrap: 'wrap', gap: '16px',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(24px)',
                    transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                            <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11.5px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Verified & Accredited</span>
                        </div>
                        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                            Our <span style={{ color: BLUE }}>Credentials</span>
                        </h2>
                    </div>

                    {/* Scroll arrows */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[-1, 1].map(dir => (
                            <button key={dir} onClick={() => scroll(dir)} style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                border: `1.5px solid ${BLUE}30`, background: '#fff', color: BLUE,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = BLUE }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = BLUE; e.currentTarget.style.borderColor = `${BLUE}30` }}
                                aria-label={dir === -1 ? 'Scroll left' : 'Scroll right'}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    {dir === -1 ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable row */}
                <div ref={scrollRef} style={{
                    display: 'flex', gap: '24px',
                    overflowX: 'auto', scrollSnapType: 'x mandatory',
                    paddingBottom: '12px', scrollbarWidth: 'none', msOverflowStyle: 'none',
                    opacity: visible ? 1 : 0,
                    transition: 'opacity 0.7s ease 0.2s',
                }}>
                    {CREDENTIALS.map((cred, i) => (
                        <div key={cred.id} style={{
                            flex: '0 0 360px', scrollSnapAlign: 'start',
                            background: '#fff', borderRadius: '14px', overflow: 'hidden',
                            border: '1px solid #efefef', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateY(0)' : 'translateY(32px)',
                            transitionDelay: `${0.2 + i * 0.1}s`,
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 16px 48px rgba(11,105,156,0.12)` }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)' }}
                        >
                            {/* Image */}
                            <div style={{
                                position: 'relative', height: '220px',
                                background: `linear-gradient(145deg, ${cred.accent}10 0%, ${cred.accent}20 100%)`,
                                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <img src={cred.image} alt={cred.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.display = 'none' }} />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: -1, color: `${cred.accent}25` }}><DocumentIcon /></div>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: cred.accent }} />
                                <div style={{
                                    position: 'absolute', top: '16px', right: '16px',
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: cred.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: "'Fraunces', serif", fontSize: '13px', fontWeight: 700, color: '#fff',
                                }}>{String(i + 1).padStart(2, '0')}</div>
                            </div>

                            {/* Body */}
                            <div style={{ padding: '22px 24px 26px' }}>
                                <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10.5px', fontWeight: 700, color: cred.accent, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '8px' }}>{cred.authority}</div>
                                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', fontWeight: 700, color: '#111', margin: '0 0 6px 0', lineHeight: 1.3, letterSpacing: '-0.01em' }}>{cred.label}</h3>
                                <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11.5px', fontWeight: 600, color: '#aaa', letterSpacing: '0.04em', marginBottom: '12px' }}>{cred.meta}</div>
                                <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13.5px', color: '#777', lineHeight: 1.65, margin: 0 }}>{cred.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Also registered with section */}
                <div style={{
                    marginTop: '56px', padding: '32px 40px',
                    background: `${BLUE}07`, border: `1px solid ${BLUE}15`, borderRadius: '14px',
                    opacity: visible ? 1 : 0,
                    transition: 'opacity 0.7s ease 0.5s',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ width: '24px', height: '2px', background: RED, borderRadius: '2px' }} />
                        <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Also Registered With</span>
                    </div>
                    <div className="memberships-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {['PACRA', 'ZRA', 'ZIEA', 'ZPPA', 'ZCSMBA', 'NAPSA', 'Workers Compensation Board', 'Zambia Development Agency (ZDA)', 'CEEC', 'EU Zambia Business Club'].map(org => (
                            <span key={org} style={{
                                padding: '6px 14px',
                                background: '#fff', border: `1px solid ${BLUE}20`,
                                borderRadius: '50px',
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '12.5px', fontWeight: 600, color: BLUE,
                                letterSpacing: '0.02em',
                            }}>{org}</span>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) and (min-width: 769px) {
                    .credentials-section { padding: 80px 0 !important; }
                    .credentials-container { padding: 0 32px !important; }
                }
                @media (max-width: 768px) and (min-width: 481px) {
                    .credentials-section { padding: 70px 0 !important; }
                    .credentials-container { padding: 0 28px !important; }
                }
                @media (max-width: 480px) {
                    .credentials-section { padding: 60px 0 !important; }
                    .credentials-container { padding: 0 20px !important; }
                    .memberships-grid { gap: 8px !important; }
                }
            `}</style>
        </section>
    )
}