import { useEffect, useRef, useState } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'

const BLOG_POSTS = [
    {
        id: 1,
        title: 'Top 5 Neighbourhoods to Rent in Lusaka Right Now',
        excerpt: 'From the leafy streets of Kabulonga to the vibrant energy of Rhodespark, we break down the best areas to rent in Lusaka for 2025.',
        date: 'March 1, 2025',
        readTime: '4 min read',
        category: 'Renting',
        image: null,
        href: '/blog/top-neighbourhoods-lusaka',
    },
    {
        id: 2,
        title: 'A First-Time Buyer\'s Guide to Purchasing Property in Zambia',
        excerpt: 'Navigating your first property purchase can feel overwhelming. Here\'s everything you need to know about buying a home in Zambia — from financing to title deeds.',
        date: 'February 18, 2025',
        readTime: '6 min read',
        category: 'Buying',
        image: null,
        href: '/blog/first-time-buyer-guide-zambia',
    },
    {
        id: 3,
        title: 'Why Lusaka Is One of Africa\'s Most Promising Real Estate Markets',
        excerpt: 'Growing infrastructure, a rising middle class, and strong rental demand make Lusaka a compelling destination for local and international property investors.',
        date: 'February 5, 2025',
        readTime: '5 min read',
        category: 'Investment',
        image: null,
        href: '/blog/lusaka-real-estate-market',
    },
]

const CATEGORY_COLORS = {
    Renting: BLUE,
    Buying: '#2d7a4f',
    Investment: RED,
}

const CalendarIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
)

const ClockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
)

export default function BlogPreviewSection() {
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
            style={{ background: '#fff', padding: '100px 0', overflow: 'hidden' }}
        >
            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px' }}>

                {/* ── Header ── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    marginBottom: '56px',
                    flexWrap: 'wrap',
                    gap: '16px',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(24px)',
                    transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <div style={{ width: '32px', height: '2px', background: RED, borderRadius: '2px' }} />
                            <span style={{
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '11.5px',
                                fontWeight: 700,
                                color: RED,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                            }}>Our Blog</span>
                        </div>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                            fontWeight: 700,
                            color: '#111',
                            margin: 0,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.15,
                        }}>
                            House To Home —{' '}
                            <span style={{ color: BLUE }}>Blog</span>
                        </h2>
                    </div>

                    <a
                        href="/blog"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '11px 22px',
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
                        View All Posts
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                    </a>
                </div>

                {/* ── Cards ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '28px',
                }}>
                    {BLOG_POSTS.map((post, i) => (
                        <a
                            key={post.id}
                            href={post.href}
                            style={{
                                textDecoration: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                background: '#fff',
                                borderRadius: '14px',
                                overflow: 'hidden',
                                border: '1px solid #efefef',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                opacity: visible ? 1 : 0,
                                transform: visible ? 'translateY(0)' : 'translateY(36px)',
                                transitionDelay: `${i * 0.12}s`,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 16px 48px rgba(11,105,156,0.12)` }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)' }}
                        >
                            {/* Thumbnail placeholder */}
                            <div style={{
                                height: '210px',
                                background: i === 0
                                    ? `linear-gradient(135deg, ${BLUE} 0%, #0a4f78 100%)`
                                    : i === 1
                                        ? `linear-gradient(135deg, #1a5c35 0%, #2d7a4f 100%)`
                                        : `linear-gradient(135deg, #8b1a1d 0%, ${RED} 100%)`,
                                position: 'relative',
                                overflow: 'hidden',
                                flexShrink: 0,
                            }}>
                                {/* Decorative pattern */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
                                    backgroundSize: '24px 24px',
                                }} />
                                {/* Large letter decoration */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-20px', right: '-10px',
                                    fontFamily: "'Fraunces', serif",
                                    fontSize: '140px',
                                    fontWeight: 700,
                                    color: 'rgba(255,255,255,0.07)',
                                    lineHeight: 1,
                                    userSelect: 'none',
                                }}>
                                    {post.category[0]}
                                </div>
                                {/* Coming soon label */}
                                <div style={{
                                    position: 'absolute',
                                    top: '16px', right: '16px',
                                    padding: '5px 12px',
                                    background: 'rgba(0,0,0,0.3)',
                                    backdropFilter: 'blur(6px)',
                                    borderRadius: '50px',
                                    fontFamily: "'Schibsted Grotesk', sans-serif",
                                    fontSize: '10.5px',
                                    fontWeight: 600,
                                    color: 'rgba(255,255,255,0.7)',
                                    letterSpacing: '0.06em',
                                }}>
                                    Thumbnail coming soon
                                </div>
                                {/* Category badge */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '16px', left: '16px',
                                    padding: '5px 14px',
                                    background: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(6px)',
                                    border: '1px solid rgba(255,255,255,0.25)',
                                    borderRadius: '50px',
                                    fontFamily: "'Schibsted Grotesk', sans-serif",
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#fff',
                                    letterSpacing: '0.07em',
                                    textTransform: 'uppercase',
                                }}>
                                    {post.category}
                                </div>
                            </div>

                            {/* Body */}
                            <div style={{ padding: '26px 24px 28px', display: 'flex', flexDirection: 'column', flex: 1 }}>

                                {/* Meta row */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    marginBottom: '14px',
                                    color: '#aaa',
                                    fontFamily: "'Schibsted Grotesk', sans-serif",
                                    fontSize: '12px',
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <CalendarIcon />
                                        {post.date}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <ClockIcon />
                                        {post.readTime}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 style={{
                                    fontFamily: "'Fraunces', serif",
                                    fontSize: '19px',
                                    fontWeight: 700,
                                    color: '#111',
                                    margin: '0 0 12px 0',
                                    lineHeight: 1.3,
                                    letterSpacing: '-0.01em',
                                }}>
                                    {post.title}
                                </h3>

                                {/* Excerpt */}
                                <p style={{
                                    fontFamily: "'Schibsted Grotesk', sans-serif",
                                    fontSize: '14px',
                                    color: '#777',
                                    lineHeight: 1.75,
                                    margin: '0 0 24px 0',
                                    flex: 1,
                                }}>
                                    {post.excerpt}
                                </p>

                                {/* Read more */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: BLUE,
                                    fontFamily: "'Schibsted Grotesk', sans-serif",
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    letterSpacing: '0.03em',
                                    borderTop: '1px solid #f0f0f0',
                                    paddingTop: '18px',
                                }}>
                                    Read Article
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .blog-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 640px) {
                    .blog-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    )
}