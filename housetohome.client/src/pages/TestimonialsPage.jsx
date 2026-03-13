import { useState, useEffect } from 'react'

const BLUE = '#0b699c'
const RED = '#e92026'
const DARK = '#0a2540'
const PASSWORD = '@housetohome.guest123!'

function StarRating({ value, onChange, readonly = false }) {
    const [hovered, setHovered] = useState(0)
    return (
        <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => !readonly && onChange(star)}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    style={{
                        background: 'none', border: 'none', cursor: readonly ? 'default' : 'pointer',
                        padding: '2px', transition: 'transform 0.15s ease',
                        transform: !readonly && hovered >= star ? 'scale(1.2)' : 'scale(1)',
                    }}
                >
                    <svg width={readonly ? 14 : 28} height={readonly ? 14 : 28} viewBox="0 0 24 24"
                        fill={(hovered || value) >= star ? RED : '#e2e8f0'}
                        stroke={(hovered || value) >= star ? RED : '#cbd5e1'}
                        strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                </button>
            ))}
        </div>
    )
}

function TestimonialCard({ t }) {
    return (
        <div style={{
            background: '#fff', borderRadius: '16px', padding: '24px',
            border: '1px solid #e8edf3',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
            <StarRating value={t.rating || 5} readonly />
            <p style={{
                fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '14px',
                color: '#4a5568', lineHeight: 1.75, margin: 0,
                fontStyle: 'italic',
            }}>"{t.review}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{
                    width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                    background: `${BLUE}14`, border: `2px solid ${BLUE}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Fraunces', serif", fontSize: '13px', fontWeight: 700, color: BLUE,
                }}>
                    {t.initials}
                </div>
                <div>
                    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, color: DARK }}>{t.name}</div>
                    <div style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {new Date(t.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Password Gate ────────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
    const [input, setInput] = useState('')
    const [error, setError] = useState(false)
    const [shaking, setShaking] = useState(false)

    function handleSubmit(e) {
        e.preventDefault()
        if (input === PASSWORD) {
            onUnlock()
        } else {
            setError(true)
            setShaking(true)
            setTimeout(() => setShaking(false), 500)
            setTimeout(() => setError(false), 3000)
            setInput('')
        }
    }

    return (
        <div style={{
            minHeight: '100vh', background: '#f7f9fc',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
        }}>
            <div style={{
                width: '100%', maxWidth: '420px',
                animation: shaking ? 'shake 0.5s ease' : 'fadeUp 0.4s ease',
            }}>
                {/* Logo mark */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 16px',
                        background: `linear-gradient(135deg, ${RED}, ${BLUE})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.7rem', fontWeight: 700, color: DARK, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                        Client Portal
                    </h1>
                    <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '14px', color: '#64748b', margin: 0 }}>
                        Enter your access code to leave a review
                    </p>
                </div>

                <div style={{
                    background: '#fff', borderRadius: '20px', padding: '32px',
                    boxShadow: '0 8px 40px rgba(10,37,64,0.08)',
                    border: error ? `1.5px solid ${RED}` : '1.5px solid #e8edf3',
                    transition: 'border-color 0.2s',
                }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block', fontFamily: "'Schibsted Grotesk', sans-serif",
                                fontSize: '11px', fontWeight: 700, color: '#94a3b8',
                                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
                            }}>Access Code</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="password"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    autoFocus
                                    placeholder="Enter your code…"
                                    style={{
                                        width: '100%', height: '48px', padding: '0 48px 0 16px',
                                        border: `1.5px solid ${error ? RED : '#e2e8f0'}`,
                                        borderRadius: '12px', fontSize: '14px',
                                        fontFamily: "'Schibsted Grotesk', sans-serif",
                                        color: DARK, background: '#f8fafc', outline: 'none',
                                        boxSizing: 'border-box', transition: 'border-color 0.2s',
                                        letterSpacing: '0.1em',
                                    }}
                                    onFocus={e => !error && (e.target.style.borderColor = BLUE)}
                                    onBlur={e => !error && (e.target.style.borderColor = '#e2e8f0')}
                                />
                                <svg style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}
                                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            {error && (
                                <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', color: RED, margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    Incorrect access code. Please try again.
                                </p>
                            )}
                        </div>
                        <button type="submit" style={{
                            width: '100%', height: '48px', background: `linear-gradient(135deg, ${BLUE}, #0e7fc2)`,
                            border: 'none', borderRadius: '12px', color: '#fff',
                            fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '14px', fontWeight: 700,
                            cursor: 'pointer', letterSpacing: '0.04em',
                            boxShadow: `0 4px 16px ${BLUE}40`,
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 24px ${BLUE}50` }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${BLUE}40` }}
                        >
                            Unlock →
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', color: '#94a3b8', marginTop: '20px' }}>
                    Access code provided by House To Home
                </p>
            </div>

            <style>{`
                @keyframes shake {
                    0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)}
                }
                @keyframes fadeUp {
                    from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)}
                }
            `}</style>
        </div>
    )
}

// ── Submission Form ───────────────────────────────────────────────────────────
function SubmitForm({ onSubmit }) {
    const [name, setName] = useState('')
    const [review, setReview] = useState('')
    const [rating, setRating] = useState(5)
    const [submitted, setSubmitted] = useState(false)
    const [errors, setErrors] = useState({})

    function getInitials(n) {
        return n.trim().split(/\s+/).map(w => w[0]?.toUpperCase() || '').join('').slice(0, 2) || '?'
    }

    function validate() {
        const e = {}
        if (!name.trim()) e.name = 'Please enter your name'
        if (!review.trim() || review.trim().length < 20) e.review = 'Review must be at least 20 characters'
        if (rating === 0) e.rating = 'Please select a star rating'
        return e
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }

        const payload = {
            name: name.trim(),
            initials: getInitials(name),
            review: review.trim(),
            rating,
        }

        try {
            const res = await fetch('/api/testimonials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error('Failed to save')
            const saved = { ...payload, id: Date.now(), date: new Date().toISOString() }
            onSubmit(saved)
            setSubmitted(true)
        } catch {
            setErrors(p => ({ ...p, review: 'Could not save your review. Please try again.' }))
        }
    }

    if (submitted) {
        return (
            <div style={{
                background: '#fff', borderRadius: '20px', padding: '48px 32px',
                textAlign: 'center', border: '1.5px solid #e8edf3',
                boxShadow: '0 8px 40px rgba(10,37,64,0.06)',
                animation: 'fadeUp 0.4s ease',
            }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 20px',
                    background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.4rem', fontWeight: 700, color: DARK, margin: '0 0 10px' }}>
                    Thank you, {name.split(' ')[0]}!
                </h3>
                <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '14px', color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>
                    Your review has been added to our testimonials.<br />We appreciate your feedback!
                </p>
                <button onClick={() => { setSubmitted(false); setName(''); setReview(''); setRating(5) }}
                    style={{
                        padding: '10px 24px', borderRadius: '10px', border: `1.5px solid ${BLUE}`,
                        background: 'transparent', color: BLUE,
                        fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13px', fontWeight: 700,
                        cursor: 'pointer',
                    }}>
                    Submit Another
                </button>
            </div>
        )
    }

    const inputStyle = {
        width: '100%', padding: '12px 14px', borderRadius: '12px',
        border: '1.5px solid #e2e8f0', fontSize: '14px',
        fontFamily: "'Schibsted Grotesk', sans-serif",
        color: DARK, background: '#f8fafc', outline: 'none',
        boxSizing: 'border-box', transition: 'border-color 0.2s',
    }

    return (
        <div style={{
            background: '#fff', borderRadius: '20px', padding: '36px 32px',
            border: '1.5px solid #e8edf3',
            boxShadow: '0 8px 40px rgba(10,37,64,0.06)',
            animation: 'fadeUp 0.4s ease',
        }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.4rem', fontWeight: 700, color: DARK, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                Share Your Experience
            </h2>
            <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '13px', color: '#64748b', margin: '0 0 28px' }}>
                Your review will appear on the homepage testimonials slider.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Name */}
                <div>
                    <label style={{ display: 'block', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                        Your Name *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
                        placeholder="e.g. Jane Mwansa"
                        style={{ ...inputStyle, borderColor: errors.name ? RED : '#e2e8f0' }}
                        onFocus={e => !errors.name && (e.target.style.borderColor = BLUE)}
                        onBlur={e => !errors.name && (e.target.style.borderColor = '#e2e8f0')}
                    />
                    {errors.name && <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', color: RED, margin: '5px 0 0' }}>{errors.name}</p>}
                </div>

                {/* Star rating */}
                <div>
                    <label style={{ display: 'block', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                        Star Rating *
                    </label>
                    <StarRating value={rating} onChange={r => { setRating(r); setErrors(p => ({ ...p, rating: '' })) }} />
                    {errors.rating && <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', color: RED, margin: '5px 0 0' }}>{errors.rating}</p>}
                </div>

                {/* Review */}
                <div>
                    <label style={{ display: 'block', fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                        Your Review *
                    </label>
                    <textarea
                        value={review}
                        onChange={e => { setReview(e.target.value); setErrors(p => ({ ...p, review: '' })) }}
                        placeholder="Tell us about your experience with House To Home…"
                        rows={5}
                        style={{
                            ...inputStyle,
                            resize: 'vertical', lineHeight: 1.6, minHeight: '120px',
                            borderColor: errors.review ? RED : '#e2e8f0',
                        }}
                        onFocus={e => !errors.review && (e.target.style.borderColor = BLUE)}
                        onBlur={e => !errors.review && (e.target.style.borderColor = '#e2e8f0')}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        {errors.review
                            ? <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', color: RED, margin: 0 }}>{errors.review}</p>
                            : <span />
                        }
                        <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11px', color: review.length < 20 ? '#94a3b8' : '#16a34a' }}>
                            {review.length} / 20 min
                        </span>
                    </div>
                </div>

                <button type="submit" style={{
                    height: '50px', background: `linear-gradient(135deg, ${BLUE}, #0e7fc2)`,
                    border: 'none', borderRadius: '12px', color: '#fff',
                    fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '14px', fontWeight: 700,
                    cursor: 'pointer', letterSpacing: '0.04em',
                    boxShadow: `0 4px 16px ${BLUE}40`,
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 24px ${BLUE}50` }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${BLUE}40` }}
                >
                    Submit Review →
                </button>
            </form>
        </div>
    )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function TestimonialsPage() {
    const [unlocked, setUnlocked] = useState(false)
    const [submitted, setSubmitted] = useState([])

    useEffect(() => {
        fetch('/api/testimonials')
            .then(r => r.ok ? r.json() : [])
            .then(data => setSubmitted(data))
            .catch(() => { })
    }, [])

    function handleNewSubmission(entry) {
        setSubmitted(prev => [...prev, entry])
    }

    if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />

    return (
        <div style={{ minHeight: '100vh', background: '#f7f9fc', padding: '48px 20px 80px' }}>
            <style>{`
                @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
            `}</style>

            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '56px', animation: 'fadeUp 0.5s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ width: '28px', height: '2px', background: RED, borderRadius: '2px' }} />
                        <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                            Client Reviews
                        </span>
                        <div style={{ width: '28px', height: '2px', background: RED, borderRadius: '2px' }} />
                    </div>
                    <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: DARK, margin: '0 0 14px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                        Share Your <span style={{ color: BLUE }}>Experience</span>
                    </h1>
                    <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '15px', color: '#64748b', margin: '0 auto', maxWidth: '460px', lineHeight: 1.7 }}>
                        Your feedback helps us improve and lets others know what to expect.
                    </p>
                </div>

                {/* Two-column layout */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: submitted.length > 0 ? '1fr 1fr' : '1fr',
                    gap: '32px',
                    alignItems: 'start',
                    maxWidth: submitted.length > 0 ? '1100px' : '560px',
                    margin: '0 auto',
                }}>
                    {/* Form */}
                    <SubmitForm onSubmit={handleNewSubmission} />

                    {/* Previous submissions this session */}
                    {submitted.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeUp 0.4s ease 0.1s both' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.1rem', fontWeight: 700, color: DARK, margin: 0 }}>
                                    Submitted Reviews
                                </h3>
                                <span style={{
                                    background: `${BLUE}14`, color: BLUE,
                                    fontFamily: "'Schibsted Grotesk', sans-serif",
                                    fontSize: '11px', fontWeight: 700,
                                    borderRadius: '999px', padding: '2px 9px',
                                }}>
                                    {submitted.length}
                                </span>
                            </div>
                            {[...submitted].reverse().map(t => (
                                <TestimonialCard key={t.id} t={t} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    div[style*="grid-template-columns: 1fr 1fr"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    )
}