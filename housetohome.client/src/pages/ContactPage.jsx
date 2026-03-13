import { useState } from 'react'
import { Link } from 'react-router-dom'

const BLUE = '#0b699c'
const RED = '#e92026'
const DARK = '#0a2540'

const CONTACT_ITEMS = [
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
        ),
        label: 'Phone',
        value: '+260 965 127 888',
        value2: '+260 966 574 377',
        href: 'tel:+260965127888',
        sublabel: 'Mon – Fri, 8am – 5pm CAT',
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
            </svg>
        ),
        label: 'Email',
        value: 'info@housetohome.co.zm',
        href: 'mailto:info@housetohome.co.zm',
        sublabel: 'We reply within 24 hours',
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
        ),
        label: 'Office',
        value: 'Lusaka, Zambia',
        href: 'https://maps.google.com/?q=Lusaka,Zambia',
        sublabel: 'Visit us by appointment',
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        label: 'WhatsApp',
        value: 'Chat with us',
        href: 'https://wa.me/260',
        sublabel: 'Quick responses guaranteed',
    },
]

const ENQUIRY_TYPES = [
    'General Enquiry',
    'Property for Rent',
    'Property for Sale',
    'Property Valuation',
    'Investment Opportunity',
    'Property Management',
    'Other',
]

export default function ContactPage() {
    const [form, setForm] = useState({
        name: '', email: '', phone: '', enquiryType: '', message: '',
    })
    const [errors, setErrors] = useState({})
    const [status, setStatus] = useState(null) // null | 'sending' | 'sent'

    function set(field, val) {
        setForm(p => ({ ...p, [field]: val }))
        setErrors(p => ({ ...p, [field]: '' }))
    }

    function validate() {
        const e = {}
        if (!form.name.trim()) e.name = 'Name is required'
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
        if (!form.message.trim() || form.message.trim().length < 10) e.message = 'Please write at least 10 characters'
        return e
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setStatus('sending')
        // SendGrid integration goes here
        await new Promise(r => setTimeout(r, 1200))
        setStatus('sent')
    }

    const inputStyle = (field) => ({
        width: '100%', height: '48px', padding: '0 16px',
        border: `1.5px solid ${errors[field] ? RED : '#e2e8f0'}`,
        borderRadius: '12px', fontSize: '14px',
        fontFamily: "'Schibsted Grotesk', sans-serif",
        color: DARK, background: '#f8fafc', outline: 'none',
        boxSizing: 'border-box', transition: 'border-color 0.2s',
    })

    return (
        <div style={{ minHeight: '100vh', background: '#f7f9fc', fontFamily: "'Schibsted Grotesk', sans-serif" }}>

            {/* ── Hero ── */}
            <div style={{
                background: `linear-gradient(135deg, #072f4a 0%, ${BLUE} 60%, #0e7fc2 100%)`,
                position: 'relative', overflow: 'hidden', padding: '72px 24px 80px',
            }}>
                {/* Decorative circles */}
                {[
                    { top: '-60px', right: '-60px', size: '340px', opacity: 0.04 },
                    { bottom: '-80px', left: '20%', size: '260px', opacity: 0.03 },
                    { top: '30px', left: '5%', size: '120px', opacity: 0.04 },
                ].map((c, i) => (
                    <div key={i} style={{
                        position: 'absolute', borderRadius: '50%',
                        width: c.size, height: c.size,
                        background: `rgba(255,255,255,${c.opacity})`,
                        top: c.top, bottom: c.bottom, left: c.left, right: c.right,
                        pointerEvents: 'none',
                    }} />
                ))}

                <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
                    {/* Breadcrumb */}
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '28px' }}>
                        <Link to="/" style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                        >Home</Link>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>›</span>
                        <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>Contact</span>
                    </nav>

                    {/* Eyebrow */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ width: '28px', height: '2px', background: RED, borderRadius: '2px' }} />
                        <span style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                            Get In Touch
                        </span>
                    </div>

                    <h1 style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 700, color: '#fff', margin: '0 0 16px',
                        letterSpacing: '-0.02em', lineHeight: 1.1,
                    }}>
                        We'd Love to<br />
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Hear From You</span>
                    </h1>

                    <p style={{
                        fontFamily: "'Schibsted Grotesk', sans-serif",
                        fontSize: '15px', color: 'rgba(255,255,255,0.65)',
                        margin: 0, maxWidth: '420px', lineHeight: 1.7,
                    }}>
                        Whether you're looking to rent, buy, or invest — our team is ready to help you find exactly what you need.
                    </p>
                </div>
            </div>

            {/* ── Contact info cards ── */}
            <div style={{ maxWidth: '1100px', margin: '-36px auto 0', padding: '0 24px', position: 'relative', zIndex: 2 }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                }}>
                    {CONTACT_ITEMS.map((item, i) => (
                        <a key={i} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
                            rel="noreferrer"
                            style={{
                                background: '#fff', borderRadius: '16px', padding: '24px 20px',
                                border: '1.5px solid #e8edf3',
                                boxShadow: '0 4px 20px rgba(10,37,64,0.06)',
                                textDecoration: 'none',
                                display: 'flex', flexDirection: 'column', gap: '12px',
                                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                                animation: `fadeUp 0.5s ease ${i * 0.08}s both`,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)'
                                e.currentTarget.style.boxShadow = `0 12px 40px rgba(11,105,156,0.12)`
                                e.currentTarget.style.borderColor = `${BLUE}40`
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(10,37,64,0.06)'
                                e.currentTarget.style.borderColor = '#e8edf3'
                            }}
                        >
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '12px',
                                background: `${BLUE}10`, color: BLUE,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                {item.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                                    {item.label}
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: DARK, marginBottom: '3px' }}>
                                    {item.value}
                                </div>
                                {item.value2 && (
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: DARK, marginBottom: '3px' }}>
                                        {item.value2}
                                    </div>
                                )}
                                <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                                    {item.sublabel}
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* ── Main content: form + sidebar ── */}
            <div style={{ maxWidth: '1100px', margin: '48px auto 80px', padding: '0 24px' }}>
                <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>

                    {/* ── Form ── */}
                    <div style={{
                        background: '#fff', borderRadius: '20px', padding: '40px 36px',
                        border: '1.5px solid #e8edf3',
                        boxShadow: '0 8px 40px rgba(10,37,64,0.06)',
                        animation: 'fadeUp 0.5s ease 0.2s both',
                    }}>
                        {status === 'sent' ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{
                                    width: '68px', height: '68px', borderRadius: '50%',
                                    background: '#dcfce7', margin: '0 auto 20px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.6rem', fontWeight: 700, color: DARK, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                                    Message Received!
                                </h3>
                                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7, margin: '0 0 28px', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
                                    Thank you for reaching out. A member of our team will get back to you within 24 hours.
                                </p>
                                <button onClick={() => { setStatus(null); setForm({ name: '', email: '', phone: '', enquiryType: '', message: '' }) }}
                                    style={{
                                        padding: '11px 28px', borderRadius: '10px',
                                        border: `1.5px solid ${BLUE}`, background: 'transparent',
                                        color: BLUE, fontFamily: "'Schibsted Grotesk', sans-serif",
                                        fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                                    }}>
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '32px' }}>
                                    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', fontWeight: 700, color: DARK, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                                        Send Us a Message
                                    </h2>
                                    <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                                        Fill in the form and we'll be in touch shortly.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                    {/* Name + Email row */}
                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <Field label="Full Name *" error={errors.name}>
                                            <input
                                                type="text" placeholder="Jane Mwansa"
                                                value={form.name} onChange={e => set('name', e.target.value)}
                                                style={inputStyle('name')}
                                                onFocus={e => !errors.name && (e.target.style.borderColor = BLUE)}
                                                onBlur={e => !errors.name && (e.target.style.borderColor = '#e2e8f0')}
                                            />
                                        </Field>
                                        <Field label="Email Address *" error={errors.email}>
                                            <input
                                                type="email" placeholder="jane@example.com"
                                                value={form.email} onChange={e => set('email', e.target.value)}
                                                style={inputStyle('email')}
                                                onFocus={e => !errors.email && (e.target.style.borderColor = BLUE)}
                                                onBlur={e => !errors.email && (e.target.style.borderColor = '#e2e8f0')}
                                            />
                                        </Field>
                                    </div>

                                    {/* Phone + Enquiry type row */}
                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <Field label="Phone Number">
                                            <input
                                                type="tel" placeholder="+260 XXX XXX XXX"
                                                value={form.phone} onChange={e => set('phone', e.target.value)}
                                                style={inputStyle('phone')}
                                                onFocus={e => (e.target.style.borderColor = BLUE)}
                                                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                                            />
                                        </Field>
                                        <Field label="Enquiry Type">
                                            <select
                                                value={form.enquiryType} onChange={e => set('enquiryType', e.target.value)}
                                                style={{ ...inputStyle('enquiryType'), cursor: 'pointer' }}
                                                onFocus={e => (e.target.style.borderColor = BLUE)}
                                                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                                            >
                                                <option value="">Select type…</option>
                                                {ENQUIRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </Field>
                                    </div>

                                    {/* Message */}
                                    <Field label="Message *" error={errors.message}>
                                        <textarea
                                            placeholder="Tell us how we can help you…"
                                            value={form.message} onChange={e => set('message', e.target.value)}
                                            rows={5}
                                            style={{
                                                ...inputStyle('message'),
                                                height: 'auto', padding: '14px 16px',
                                                resize: 'vertical', lineHeight: 1.65, minHeight: '130px',
                                            }}
                                            onFocus={e => !errors.message && (e.target.style.borderColor = BLUE)}
                                            onBlur={e => !errors.message && (e.target.style.borderColor = '#e2e8f0')}
                                        />
                                    </Field>

                                    {/* Submit */}
                                    <button type="submit" disabled={status === 'sending'} style={{
                                        height: '52px',
                                        background: status === 'sending' ? '#94a3b8' : `linear-gradient(135deg, ${BLUE}, #0e7fc2)`,
                                        border: 'none', borderRadius: '12px', color: '#fff',
                                        fontFamily: "'Schibsted Grotesk', sans-serif",
                                        fontSize: '14px', fontWeight: 700, cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                                        letterSpacing: '0.04em',
                                        boxShadow: status === 'sending' ? 'none' : `0 4px 20px ${BLUE}40`,
                                        transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    }}
                                        onMouseEnter={e => { if (status !== 'sending') { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${BLUE}50` } }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 20px ${BLUE}40` }}
                                    >
                                        {status === 'sending' ? (
                                            <>
                                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
                                                Sending…
                                            </>
                                        ) : (
                                            <>
                                                Send Message
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeUp 0.5s ease 0.35s both' }}>

                        {/* Quick links */}
                        <div style={{
                            background: `linear-gradient(145deg, ${DARK} 0%, #0e3a6e 100%)`,
                            borderRadius: '16px', padding: '28px 24px',
                            boxShadow: `0 8px 32px rgba(10,37,64,0.2)`,
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
                            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 18px' }}>
                                Looking for a Property?
                            </h3>
                            {[
                                { label: 'Residential for Rent', to: '/residential-rent' },
                                { label: 'Residential for Sale', to: '/residential-sale' },
                                { label: 'Commercial Properties', to: '/commercial-rent' },
                                { label: 'Land for Sale', to: '/land-sale' },
                                { label: 'Investment Properties', to: '/investments' },
                            ].map((link, i) => (
                                <Link key={i} to={link.to} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 0',
                                    borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                                    textDecoration: 'none',
                                    color: 'rgba(255,255,255,0.7)',
                                    fontSize: '13px', fontWeight: 500,
                                    transition: 'color 0.2s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                                >
                                    {link.label}
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </Link>
                            ))}
                        </div>

                        {/* Social */}
                        <div style={{
                            background: '#fff', borderRadius: '16px', padding: '24px',
                            border: '1.5px solid #e8edf3',
                            boxShadow: '0 4px 20px rgba(10,37,64,0.05)',
                        }}>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>Follow us on social media</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <a href="#" target="_blank" rel="noreferrer" title="Facebook"
                                    style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#1877F215', color: '#1877F2', border: '1.5px solid #1877F230', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#1877F2'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#1877F2' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#1877F215'; e.currentTarget.style.color = '#1877F2'; e.currentTarget.style.borderColor = '#1877F230' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                                </a>
                                <a href="https://wa.me/260965127888" target="_blank" rel="noreferrer" title="WhatsApp"
                                    style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#25D36615', color: '#25D366', border: '1.5px solid #25D36630', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#25D366'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#25D366' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#25D36615'; e.currentTarget.style.color = '#25D366'; e.currentTarget.style.borderColor = '#25D36630' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                @keyframes spin { to { transform: rotate(360deg) } }
                @media (max-width: 900px) {
                    .contact-grid { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 600px) {
                    .form-row { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    )
}

function Field({ label, error, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {label}
            </label>
            {children}
            {error && (
                <p style={{ fontFamily: "'Schibsted Grotesk', sans-serif", fontSize: '12px', color: RED, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {error}
                </p>
            )}
        </div>
    )
}