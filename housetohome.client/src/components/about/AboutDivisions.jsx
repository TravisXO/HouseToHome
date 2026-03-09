import { useEffect, useRef, useState } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'

const DIVISIONS = [
    {
        number: '01',
        title: 'Real Estate',
        description: 'Focuses on the sales and rentals of both Commercial and Residential properties. Portfolio includes Commercial, Residential, Industrial, Agricultural and Mining.',
    },
    {
        number: '02',
        title: 'Agro & Live',
        description: 'Comprehensive agricultural and livestock services for sustainable growth. Innovative technologies and personalized support to empower farmers and ranchers.',
    },
    {
        number: '03',
        title: 'Procurement',
        description: 'Sourcing and supplying top-of-the-line agricultural equipment and goods. Expert guidance on crop cultivation, livestock management, and sustainable farming.',
    },
    {
        number: '04',
        title: 'Finance Consultancy',
        description: 'A wide-ranging network of financial industry contacts. We arrange financial products, business plans for market growth, microloans, leasing and more.',
    },
    {
        number: '05',
        title: 'Construction',
        description: 'Complete service from securing land, designing and building construction investment projects, through to rental and management of the completed project.',
    },
    {
        number: '06',
        title: 'Business Consultancy',
        description: 'Business consultants, marketing experts and legal advisers on our team. We aid in product research, market analysis, sales and marketing implementation.',
    },
]

export default function AboutDivisions() {
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
            className="divisions-section"
            style={{ background: '#fff', padding: '100px 0', overflow: 'hidden' }}
        >
            <div className="divisions-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px' }}>

                <div className="divisions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>

                    {/* ── LEFT — Content ── */}
                    <div style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateX(0)' : 'translateX(-48px)',
                        transition: 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                            <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11.5px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Diversified Business Interests</span>
                        </div>

                        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontWeight: 700, color: '#111', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 20px 0' }}>
                            Our <span style={{ position: 'relative', display: 'inline-block', color: BLUE }}>
                                Six Divisions
                                <span style={{ position: 'absolute', bottom: '-2px', left: 0, right: 0, height: '3px', background: RED, borderRadius: '2px' }} />
                            </span>
                        </h2>

                        <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '15px', color: '#666', lineHeight: 1.85, margin: '0 0 40px 0' }}>
                            Initially starting in the real estate industry, the House to Home Group has diversified its interests since its 2008 inception into six active divisions — each designed to meet the evolving needs of clients across Zambia and beyond.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {DIVISIONS.map((div, i) => (
                                <div key={div.number} style={{
                                    display: 'flex', gap: '20px', alignItems: 'flex-start',
                                    padding: '18px 0',
                                    borderBottom: i < DIVISIONS.length - 1 ? '1px solid #f0f0f0' : 'none',
                                    opacity: visible ? 1 : 0,
                                    transform: visible ? 'translateX(0)' : 'translateX(-20px)',
                                    transition: `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${0.3 + i * 0.07}s`,
                                }}>
                                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: '13px', fontWeight: 700, color: RED, letterSpacing: '0.04em', flexShrink: 0, marginTop: '2px', minWidth: '28px' }}>{div.number}</div>
                                    <div>
                                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '4px', letterSpacing: '-0.01em' }}>{div.title}</div>
                                        <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13.5px', color: '#777', lineHeight: 1.65 }}>{div.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT — Image ── */}
                    <div className="divisions-image-wrap" style={{
                        position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '680px',
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateX(0)' : 'translateX(48px)',
                        transition: 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s',
                    }}>
                        <img
                            src="/public/assets/divisions-landscape.jpg"
                            alt="H2H Divisions"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={e => { e.currentTarget.style.display = 'none' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(145deg, #071e2e 0%, #0b3d5c 50%, ${BLUE} 100%)`, zIndex: -1 }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,20,35,0.75) 0%, transparent 50%)' }} />

                        {/* Floating stats card */}
                        <div style={{
                            position: 'absolute', bottom: '32px', left: '32px', right: '32px',
                            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '12px', padding: '20px 24px', backdropFilter: 'blur(12px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                        }}>
                            {[
                                { value: '6', label: 'Active Divisions' },
                                { value: '2008', label: 'Year Founded' },
                                { value: '100%', label: 'Zambian Owned' },
                            ].map(stat => (
                                <div key={stat.label} style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: '26px', fontWeight: 700, color: '#fff', lineHeight: 1, marginBottom: '4px' }}>{stat.value}</div>
                                    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10.5px', fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Top-right badge */}
                        <div style={{
                            position: 'absolute', top: '28px', right: '28px',
                            padding: '7px 16px', background: RED, borderRadius: '50px',
                            fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10.5px', fontWeight: 700,
                            color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>H2H Holdings</div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) and (min-width: 769px) {
                    .divisions-section { padding: 80px 0 !important; }
                    .divisions-container { padding: 0 32px !important; }
                    .divisions-grid { gap: 48px !important; }
                    .divisions-image-wrap { height: 500px !important; }
                }
                @media (max-width: 768px) and (min-width: 481px) {
                    .divisions-section { padding: 70px 0 !important; }
                    .divisions-container { padding: 0 28px !important; }
                    .divisions-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
                    .divisions-image-wrap { height: 380px !important; }
                }
                @media (max-width: 480px) {
                    .divisions-section { padding: 60px 0 !important; }
                    .divisions-container { padding: 0 20px !important; }
                    .divisions-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
                    .divisions-image-wrap { height: 300px !important; }
                }
            `}</style>
        </section>
    )
}