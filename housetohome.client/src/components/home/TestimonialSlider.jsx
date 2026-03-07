import { useState, useEffect, useRef, useCallback } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'

const TESTIMONIALS = [
    {
        id: 1,
        name: 'Chisanga Mwangulukulu',
        review: 'The services rendered here are top tier. From helping me find exactly what I\'m looking for to matching my preferences to my budget, the team was well prepared to assist me. I\'m forever grateful!',
        initials: 'CM',
    },
    {
        id: 2,
        name: 'Taonga Luma',
        review: 'I can\'t recommend House to Home highly enough! They have been fundamental in helping me find the perfect apartment to rent in Lusaka, making the entire process smooth and stress-free. Their team is professional, knowledgeable, and truly dedicated to understanding my needs. Beyond rentals, House to Home has also been an incredible partner in my property development journey.',
        initials: 'TL',
    },
    {
        id: 3,
        name: 'Tinkhe Banda',
        review: 'I\'ve had the pleasure of working with the exceptional team at House to Home Properties, and I can confidently attest to their professionalism, expertise, and genuine care for their clients. They took the time to understand my needs and delivered exceptional results, finding me the perfect property.',
        initials: 'TB',
    },
    {
        id: 4,
        name: 'lenius situnyama',
        review: 'I am pleased to express our sincere appreciation for the exceptional estate agency services provided by House to Home. Their professionalism, efficiency, and dedication to excellence have significantly contributed to the seamless management of our properties. House to Home has demonstrated a deep understanding of the real estate market, ensuring that our properties are well-positioned and occupied by reliable tenants.',
        initials: 'LS',
    },
    {
        id: 5,
        name: 'Alice Banda',
        review: 'We have worked with House to Home for a number of years now and they have always been very professional & knowledgeable about the real estate market. They have consistently found us the right clients for our properties.',
        initials: 'AB',
    },
    {
        id: 6,
        name: 'J Lakhwani',
        review: 'Rusa and James have helped us find both our homes and recently facilitated the purchase of our house. Communication is always smooth and they are extremely professional. Highly recommend them if you are dealing with any property matters!',
        initials: 'JL',
    },
    {
        id: 7,
        name: 'Sophia McKenzie',
        review: 'Very professional. Rusa Thornicroft made my purchase experience very smooth and stress free. Very professional and understands the needs of a client.',
        initials: 'SM',
    },
    {
        id: 8,
        name: 'Jacqui',
        review: 'Have worked with Rusa and team on a number of occasions and they have always been professional, available and pleasant. Highly recommend.',
        initials: 'JQ',
    },
    {
        id: 9,
        name: 'Osanna Peters',
        review: 'Reliable, Honest and very Reputable.',
        initials: 'OP',
    },
    {
        id: 10,
        name: 'Sydney Watae',
        review: 'Responsive, reliable and efficient.',
        initials: 'SW',
    },
    {
        id: 11,
        name: 'Delver Limited',
        review: 'We have had a pleasant and professional experience.',
        initials: 'DL',
    },
    {
        id: 12,
        name: 'Jordan Smith',
        review: 'Very Professional and prompt communication. Highly recommend and will definitely call again.',
        initials: 'JS',
    },
    {
        id: 13,
        name: 'Alison Stein',
        review: 'Very professional and patient agents. Highly recommend to family and friends.',
        initials: 'AS',
    },
    {
        id: 14,
        name: 'Dumisani Dlamini',
        review: 'Working with James was a total bliss.',
        initials: 'DD',
    },
]

const CARDS_VISIBLE = 3
const INTERVAL_MS = 5000

const QuoteIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
        <path d="M9.333 21.333c-3.68 0-6.666-2.987-6.666-6.666 0-3.68 2.987-6.667 6.666-6.667.294 0 .587.02.874.058C8.64 6.352 6.827 5.333 4.667 5.333H2.667V2.667h2c4.226 0 8 3.093 8 9.333v9.333H9.333zm16 0c-3.68 0-6.666-2.987-6.666-6.666 0-3.68 2.987-6.667 6.666-6.667.294 0 .587.02.874.058C24.64 6.352 22.827 5.333 20.667 5.333h-2V2.667h2c4.226 0 8 3.093 8 9.333v9.333H25.333z" />
    </svg>
)

const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={RED}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
)

function TestimonialCard({ testimonial, isCenter }) {
    return (
        <div
            style={{
                background: isCenter
                    ? `linear-gradient(145deg, ${BLUE} 0%, #0a4f78 100%)`
                    : '#fff',
                borderRadius: '16px',
                padding: '36px 32px',
                boxShadow: isCenter
                    ? `0 24px 64px rgba(11,105,156,0.25)`
                    : '0 4px 20px rgba(0,0,0,0.07)',
                border: isCenter ? 'none' : '1px solid #efefef',
                flex: '0 0 calc(33.333% - 16px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                transform: isCenter ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Red top accent on center card */}
            {isCenter && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: '3px',
                    background: `linear-gradient(to right, ${RED}, transparent)`,
                }} />
            )}

            {/* Quote icon */}
            <div style={{ color: isCenter ? 'rgba(255,255,255,0.15)' : `${BLUE}18` }}>
                <QuoteIcon />
            </div>

            {/* Stars */}
            <div style={{ display: 'flex', gap: '3px' }}>
                {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
            </div>

            {/* Review text */}
            <p style={{
                fontFamily: "'Schibsted Grotesk', sans-serif",
                fontSize: '14.5px',
                color: isCenter ? 'rgba(255,255,255,0.85)' : '#555',
                lineHeight: 1.8,
                margin: 0,
                flex: 1,
                display: '-webkit-box',
                WebkitLineClamp: 6,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
            }}>
                "{testimonial.review}"
            </p>

            {/* Reviewer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: isCenter ? '1px solid rgba(255,255,255,0.15)' : '1px solid #f0f0f0' }}>
                {/* Avatar */}
                <div style={{
                    width: '44px', height: '44px',
                    borderRadius: '50%',
                    background: isCenter ? 'rgba(255,255,255,0.15)' : `${BLUE}15`,
                    border: isCenter ? '2px solid rgba(255,255,255,0.25)' : `2px solid ${BLUE}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Fraunces', serif",
                    fontSize: '15px',
                    fontWeight: 700,
                    color: isCenter ? '#fff' : BLUE,
                    flexShrink: 0,
                }}>
                    {testimonial.initials}
                </div>
                <div>
                    <div style={{
                        fontFamily: "'Schibsted Grotesk', sans-serif",
                        fontSize: '14px',
                        fontWeight: 700,
                        color: isCenter ? '#fff' : '#111',
                        marginBottom: '2px',
                    }}>{testimonial.name}</div>
                    <div style={{
                        fontFamily: "'Schibsted Grotesk', sans-serif",
                        fontSize: '11.5px',
                        color: isCenter ? RED : '#aaa',
                        fontWeight: 500,
                    }}>Verified Client</div>
                </div>
            </div>
        </div>
    )
}

export default function TestimonialsSlider() {
    const [activeIndex, setActiveIndex] = useState(1)
    const [isPaused, setIsPaused] = useState(false)
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

    const goTo = useCallback((index) => {
        setActiveIndex(((index % TESTIMONIALS.length) + TESTIMONIALS.length) % TESTIMONIALS.length)
    }, [])

    useEffect(() => {
        if (isPaused) return
        const timer = setInterval(() => goTo(activeIndex + 1), INTERVAL_MS)
        return () => clearInterval(timer)
    }, [activeIndex, isPaused, goTo])

    // Get 3 consecutive testimonials centred on activeIndex
    const getVisible = () => {
        const n = TESTIMONIALS.length
        return [
            TESTIMONIALS[(activeIndex - 1 + n) % n],
            TESTIMONIALS[activeIndex],
            TESTIMONIALS[(activeIndex + 1) % n],
        ]
    }

    const visibleCards = getVisible()

    return (
        <section
            ref={sectionRef}
            className="testimonials-section"
            style={{ background: '#f9f9f9', padding: '100px 0', overflow: 'hidden' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="testimonials-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px' }}>

                {/* ── Header ── */}
                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: '64px',
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(24px)',
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
                        }}>Testimonials</span>
                        <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                    </div>
                    <h2 style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                        fontWeight: 700,
                        color: '#111',
                        margin: '0 0 16px 0',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.15,
                    }}>
                        What Our{' '}
                        <span style={{ color: BLUE }}>Clients Say</span>
                    </h2>
                    <p style={{
                        fontFamily: "'Schibsted Grotesk', sans-serif",
                        fontSize: '15.5px',
                        color: '#888',
                        maxWidth: '440px',
                        margin: '0 auto',
                        lineHeight: 1.7,
                    }}>
                        Hundreds of families and investors across Zambia trust House to Home.
                    </p>
                </div>

                {/* ── Cards ── */}
                <div
                    className="testimonials-cards"
                    style={{
                        display: 'flex',
                        gap: '24px',
                        alignItems: 'stretch',
                        opacity: visible ? 1 : 0,
                        transition: 'opacity 0.5s ease 0.2s',
                    }}
                >
                    {visibleCards.map((t, i) => (
                        <TestimonialCard
                            key={`${t.id}-${i}`}
                            testimonial={t}
                            isCenter={i === 1}
                        />
                    ))}
                </div>

                {/* ── Controls ── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    marginTop: '48px',
                }}>
                    {/* Prev */}
                    <button
                        onClick={() => goTo(activeIndex - 1)}
                        style={{
                            width: '42px', height: '42px',
                            borderRadius: '50%',
                            border: `1.5px solid ${BLUE}30`,
                            background: '#fff',
                            color: BLUE,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = BLUE }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = BLUE; e.currentTarget.style.borderColor = `${BLUE}30` }}
                        aria-label="Previous testimonial"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>

                    {/* Dot indicators */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {TESTIMONIALS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                style={{
                                    width: i === activeIndex ? '24px' : '7px',
                                    height: '7px',
                                    borderRadius: '50px',
                                    background: i === activeIndex ? BLUE : `${BLUE}25`,
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    transition: 'all 0.3s ease',
                                }}
                                aria-label={`Go to testimonial ${i + 1}`}
                            />
                        ))}
                    </div>

                    {/* Next */}
                    <button
                        onClick={() => goTo(activeIndex + 1)}
                        style={{
                            width: '42px', height: '42px',
                            borderRadius: '50%',
                            border: `1.5px solid ${BLUE}30`,
                            background: '#fff',
                            color: BLUE,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = BLUE }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = BLUE; e.currentTarget.style.borderColor = `${BLUE}30` }}
                        aria-label="Next testimonial"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>

                {/* Progress bar */}
                {!isPaused && (
                    <div style={{ marginTop: '16px', height: '2px', background: `${BLUE}12`, borderRadius: '2px', overflow: 'hidden', maxWidth: '200px', margin: '16px auto 0' }}>
                        <div
                            key={activeIndex}
                            style={{
                                height: '100%',
                                background: BLUE,
                                borderRadius: '2px',
                                animation: `tsProgress ${INTERVAL_MS}ms linear forwards`,
                            }}
                        />
                    </div>
                )}
            </div>

            <style>{`
                @keyframes tsProgress {
                    from { width: 0%; }
                    to { width: 100%; }
                }

                /* ── 1024px – 769px (tablet landscape) ── */
                @media (max-width: 1024px) and (min-width: 769px) {
                    .testimonials-section { padding: 80px 0 !important; }
                    .testimonials-container { padding: 0 32px !important; }
                    .testimonials-cards > :first-child,
                    .testimonials-cards > :last-child {
                        display: none !important;
                    }
                    .testimonials-cards > :nth-child(2) {
                        flex: 0 0 100% !important;
                        max-width: 560px;
                        margin: 0 auto;
                        transform: translateY(0) scale(1) !important;
                    }
                }

                /* ── 768px – 480px (tablet portrait) ── */
                @media (max-width: 768px) and (min-width: 481px) {
                    .testimonials-section { padding: 70px 0 !important; }
                    .testimonials-container { padding: 0 28px !important; }
                    .testimonials-cards > :first-child,
                    .testimonials-cards > :last-child {
                        display: none !important;
                    }
                    .testimonials-cards > :nth-child(2) {
                        flex: 0 0 100% !important;
                        max-width: 520px;
                        margin: 0 auto;
                        transform: translateY(0) scale(1) !important;
                    }
                }

                /* ── 480px – 0px (mobile) ── */
                @media (max-width: 480px) {
                    .testimonials-section { padding: 60px 0 !important; }
                    .testimonials-container { padding: 0 20px !important; }
                    .testimonials-cards > :first-child,
                    .testimonials-cards > :last-child {
                        display: none !important;
                    }
                    .testimonials-cards > :nth-child(2) {
                        flex: 0 0 100% !important;
                        transform: translateY(0) scale(1) !important;
                    }
                }

            `}</style>
        </section>
    )
}