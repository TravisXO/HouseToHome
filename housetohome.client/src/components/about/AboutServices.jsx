import { useEffect, useRef, useState } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'

const SERVICES = [
    {
        id: 'management',
        icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>),
        title: 'Property Management',
        tagline: 'Hands-Free Ownership',
        points: [
            'Act as an intermediary between Landlord and Tenants',
            'Look after the property requirements of our clients',
            'Rental collection on your behalf',
            'Maintenance services and contractor coordination',
            'Property development — renovations, landscaping, and more',
            'Regular updated reports and performance summaries',
        ],
    },
    {
        id: 'sales',
        icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>),
        title: 'Sales',
        tagline: 'Buy, Sell & Transfer',
        points: [
            'Find a willing buyer for clients who wish to sell their property',
            'Finding the right legal presentation for conveyance services',
            'Valuation surveyors and industry experts — construction firms, building material suppliers',
            'Property checks from the Ministry of Lands and/or the relevant Local Council',
            'Residential, Agricultural, and Commercial Property sales',
        ],
    },
    {
        id: 'rentals',
        icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>),
        title: 'Rentals',
        tagline: 'Find the Perfect Tenant',
        points: [
            'Find a tenant who will pay our clients who wish to rent their property',
            'Extensive advertising across all H2H platforms',
            'Credit checks and KYC verification',
            'Lease agreement drafting and management',
            'Residential, Agricultural, and Commercial Properties',
            'Both short and long lease arrangements',
        ],
    },
    {
        id: 'consultancy',
        icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>),
        title: 'Property Consultancy',
        tagline: 'Strategic Advice',
        points: [
            'Investment consultancy and portfolio planning',
            'Locating quality rental properties for clients',
            'Locating quality sales properties for development opportunities',
            'Sourcing insurance policies, security specialists, and professionals',
            'Business plan proposals for bank loans for real estate investment',
            'Property valuations and market assessments',
        ],
    },
    {
        id: 'investment',
        icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>),
        title: 'Investment Project',
        tagline: 'Build & Grow',
        points: [
            'Consultancy on building projects and development feasibility',
            'Consultancy on loan applications for buying property',
            'Finance guidance for building flats, townhouses, or houses',
            'Support for company registration of investment vehicles',
        ],
    },
]

export default function AboutServices() {
    const [visible, setVisible] = useState(false)
    const [openId, setOpenId] = useState('management')
    const sectionRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true) },
            { threshold: 0.1 }
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    const activeService = SERVICES.find(s => s.id === openId)

    return (
        <section
            ref={sectionRef}
            className="services-about-section"
            style={{ background: '#f9f9f9', padding: '100px 0', overflow: 'hidden' }}
        >
            <div className="services-about-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px' }}>

                {/* Header */}
                <div style={{
                    textAlign: 'center', marginBottom: '64px',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(24px)',
                    transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                        <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11.5px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Real Estate Services</span>
                        <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                    </div>
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700, color: '#111', margin: '0 0 16px 0', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                        How We <span style={{ color: BLUE }}>Help You</span>
                    </h2>
                    <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '15.5px', color: '#888', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
                        Five pillars of real estate expertise — covering every aspect of property in Zambia.
                    </p>
                </div>

                {/* Accordion + Detail */}
                <div className="services-about-body" style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start',
                    opacity: visible ? 1 : 0,
                    transition: 'opacity 0.7s ease 0.2s',
                }}>
                    {/* Left — Accordion */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {SERVICES.map((service, i) => {
                            const isOpen = openId === service.id
                            return (
                                <div key={service.id} style={{
                                    background: '#fff', borderRadius: '12px',
                                    border: isOpen ? `1.5px solid ${BLUE}` : '1.5px solid #efefef',
                                    overflow: 'hidden',
                                    boxShadow: isOpen ? `0 8px 32px rgba(11,105,156,0.10)` : 'none',
                                    transition: 'all 0.25s ease',
                                    opacity: visible ? 1 : 0,
                                    transform: visible ? 'translateY(0)' : 'translateY(20px)',
                                    transitionDelay: `${0.25 + i * 0.07}s`,
                                }}>
                                    <button
                                        onClick={() => setOpenId(isOpen ? null : service.id)}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                    >
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '10px',
                                            background: isOpen ? BLUE : `${BLUE}10`,
                                            border: isOpen ? 'none' : `1px solid ${BLUE}20`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: isOpen ? '#fff' : BLUE, flexShrink: 0, transition: 'all 0.25s ease',
                                        }}>{service.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10.5px', fontWeight: 700, color: isOpen ? RED : '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px', transition: 'color 0.25s ease' }}>{service.tagline}</div>
                                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: 600, color: isOpen ? BLUE : '#111', letterSpacing: '-0.01em', transition: 'color 0.25s ease' }}>{service.title}</div>
                                        </div>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isOpen ? BLUE : '#ccc'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }}>
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>
                                    {isOpen && (
                                        <div className="services-inline-points" style={{ padding: '0 24px 20px 84px' }}>
                                            {service.points.map((point, j) => (
                                                <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: j < service.points.length - 1 ? '10px' : '0' }}>
                                                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: RED, flexShrink: 0, marginTop: '7px' }} />
                                                    <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13.5px', color: '#666', lineHeight: 1.65 }}>{point}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Right — Detail panel */}
                    <div className="services-detail-panel" style={{
                        background: `linear-gradient(145deg, ${BLUE} 0%, #0a4f78 100%)`,
                        borderRadius: '16px', padding: '44px 40px',
                        position: 'sticky', top: '120px',
                        boxShadow: `0 24px 64px rgba(11,105,156,0.25)`, overflow: 'hidden',
                    }}>
                        <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(to right, ${RED}, transparent)` }} />

                        {activeService && (
                            <>
                                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '24px' }}>{activeService.icon}</div>
                                <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10.5px', fontWeight: 700, color: RED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>{activeService.tagline}</div>
                                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '26px', fontWeight: 700, color: '#fff', margin: '0 0 16px 0', lineHeight: 1.2, letterSpacing: '-0.01em' }}>{activeService.title}</h3>
                                <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.25)', borderRadius: '2px', marginBottom: '24px' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {activeService.points.map((point, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            </div>
                                            <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13.5px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.65 }}>{point}</span>
                                        </div>
                                    ))}
                                </div>
                                <a href="/contact" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '32px',
                                    padding: '12px 24px', background: RED, color: '#fff',
                                    fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12.5px', fontWeight: 700,
                                    letterSpacing: '0.07em', textTransform: 'uppercase', borderRadius: '6px',
                                    textDecoration: 'none', boxShadow: `0 4px 20px rgba(233,32,38,0.4)`, transition: 'all 0.2s ease',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = RED; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.15)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = RED; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = `0 4px 20px rgba(233,32,38,0.4)` }}
                                >
                                    Enquire About This Service
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) and (min-width: 769px) {
                    .services-about-section { padding: 80px 0 !important; }
                    .services-about-container { padding: 0 32px !important; }
                    .services-about-body { gap: 28px !important; }
                }
                @media (max-width: 768px) and (min-width: 481px) {
                    .services-about-section { padding: 70px 0 !important; }
                    .services-about-container { padding: 0 28px !important; }
                    .services-about-body { grid-template-columns: 1fr !important; }
                    .services-detail-panel { display: none !important; }
                    .services-inline-points { display: block !important; }
                }
                @media (max-width: 480px) {
                    .services-about-section { padding: 60px 0 !important; }
                    .services-about-container { padding: 0 20px !important; }
                    .services-about-body { grid-template-columns: 1fr !important; }
                    .services-detail-panel { display: none !important; }
                    .services-inline-points { display: block !important; padding-left: 24px !important; }
                }
            `}</style>
        </section>
    )
}