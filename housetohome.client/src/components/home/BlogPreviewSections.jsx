import { useEffect, useRef, useState } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'
const DARK = '#0a2540'

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
        title: "A First-Time Buyer's Guide to Purchasing Property in Zambia",
        excerpt: "Navigating your first property purchase can feel overwhelming. Here's everything you need to know about buying a home in Zambia — from financing to title deeds.",
        date: 'February 18, 2025',
        readTime: '6 min read',
        category: 'Buying',
        image: null,
        href: '/blog/first-time-buyer-guide-zambia',
    },
    {
        id: 3,
        title: "Why Lusaka Is One of Africa's Most Promising Real Estate Markets",
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

// Gradient per card index — preserved from original
const CARD_GRADIENTS = [
    `linear-gradient(145deg, ${BLUE} 0%, #0a4f78 100%)`,
    `linear-gradient(145deg, #1a5c35 0%, #2d7a4f 100%)`,
    `linear-gradient(145deg, #8b1a1d 0%, ${RED} 100%)`,
]

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

const ArrowIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
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
            style={{ background: '#f7f9fc', padding: '80px 0 100px', overflow: 'hidden' }}
        >
            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 48px' }}>

                {/* ── Header ── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '20px',
                    marginBottom: '48px',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(24px)',
                    transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                }}>
                    {/* Left: eyebrow + title */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <div style={{ width: '28px', height: '2px', background: RED, borderRadius: '2px' }} />
                            <span style={{
                                fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '11px',
                                fontWeight: 700,
                                color: RED,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                            }}>
                                Our Blog
                            </span>
                        </div>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                            fontWeight: 700,
                            color: DARK,
                            margin: 0,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.15,
                        }}>
                            House To Home —{' '}
                            <span style={{ color: BLUE }}>Blog</span>
                        </h2>
                    </div>

                    {/* Right: CTA */}
                    <a
                        href="/blog"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '11px 22px',
                            borderRadius: '999px',
                            border: `1.5px solid ${BLUE}`,
                            color: BLUE,
                            fontFamily: "'Schibsted Grotesk', sans-serif",
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = BLUE }}
                    >
                        View All Posts
                        <ArrowIcon />
                    </a>
                </div>

                {/* ── Cards grid ── */}
                <div className="blog-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '24px',
                }}>
                    {BLOG_POSTS.map((post, i) => (
                        <BlogCard
                            key={post.id}
                            post={post}
                            index={i}
                            gradient={CARD_GRADIENTS[i]}
                            visible={visible}
                        />
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

// ── Blog Card ─────────────────────────────────────────────────────────────
function BlogCard({ post, index, gradient, visible }) {
    const [hovered, setHovered] = useState(false)
    const catColor = CATEGORY_COLORS[post.category] || BLUE

    return (
        <a
            href={post.href}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                background: '#fff',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.055)',
                boxShadow: hovered
                    ? '0 20px 56px rgba(11,105,156,0.13), 0 4px 16px rgba(0,0,0,0.06)'
                    : '0 2px 16px rgba(0,0,0,0.055)',
                transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                transform: hovered
                    ? 'translateY(-5px)'
                    : visible ? 'translateY(0)' : 'translateY(36px)',
                opacity: visible ? 1 : 0,
                transitionDelay: `${index * 0.12}s`,
            }}
        >
            {/* ── Image / Placeholder ── */}
            <div style={{
                height: '200px',
                background: gradient,
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
            }}>
                {/* Dot texture */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }} />

                {/* Large decorative letter */}
                <div style={{
                    position: 'absolute',
                    bottom: '-20px', right: '-8px',
                    fontFamily: "'Fraunces', serif",
                    fontSize: '130px',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.07)',
                    lineHeight: 1,
                    userSelect: 'none',
                }}>
                    {post.category[0]}
                </div>

                {/* Thumbnail coming soon */}
                <div style={{
                    position: 'absolute',
                    top: '14px', right: '14px',
                    padding: '4px 12px',
                    background: 'rgba(0,0,0,0.28)',
                    backdropFilter: 'blur(6px)',
                    borderRadius: '999px',
                    fontFamily: "'Schibsted Grotesk', sans-serif",
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.65)',
                    letterSpacing: '0.05em',
                }}>
                    Thumbnail coming soon
                </div>

                {/* Category pill */}
                <div style={{
                    position: 'absolute',
                    bottom: '14px', left: '14px',
                    padding: '5px 14px',
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '999px',
                    fontFamily: "'Schibsted Grotesk', sans-serif",
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                }}>
                    {post.category}
                </div>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: '24px 22px 26px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>

                {/* Meta pills row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '3px 10px', borderRadius: '999px',
                        background: '#f1f5f9', border: '1px solid #e2e8f0',
                        fontFamily: "'Schibsted Grotesk', sans-serif",
                        fontSize: '11px', fontWeight: 600, color: '#64748b',
                    }}>
                        <CalendarIcon /> {post.date}
                    </span>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '3px 10px', borderRadius: '999px',
                        background: '#f1f5f9', border: '1px solid #e2e8f0',
                        fontFamily: "'Schibsted Grotesk', sans-serif",
                        fontSize: '11px', fontWeight: 600, color: '#64748b',
                    }}>
                        <ClockIcon /> {post.readTime}
                    </span>
                </div>

                {/* Title */}
                <h3 style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: '18px',
                    fontWeight: 700,
                    color: DARK,
                    margin: 0,
                    lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                    wordBreak: 'break-word',
                }}>
                    {post.title}
                </h3>

                {/* Excerpt */}
                <p style={{
                    fontFamily: "'Schibsted Grotesk', sans-serif",
                    fontSize: '14px',
                    color: '#64748b',
                    lineHeight: 1.75,
                    margin: 0,
                    flex: 1,
                }}>
                    {post.excerpt}
                </p>

                {/* Read more */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    paddingTop: '16px',
                    borderTop: '1px solid #f1f5f9',
                    color: catColor,
                    fontFamily: "'Schibsted Grotesk', sans-serif",
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                }}>
                    Read Article
                    <ArrowIcon />
                </div>
            </div>
        </a>
    )
}