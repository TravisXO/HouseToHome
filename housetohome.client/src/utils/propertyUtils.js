// ── Shared helpers for reading property data ──────────────────────────────
// Handles both:
//   • Legacy Wix JSON (from all-properties.json) — PascalCase fields, arrays
//   • New camelCase JSON (from Rent.json / Buy.json) — flat, { publicId, secureUrl }

// Returns the first element of an array field, or the scalar value itself
export function arrFirst(val, fallback = '') {
    if (Array.isArray(val)) return val[0] ?? fallback
    return val ?? fallback
}

// ── Image URL resolution ──────────────────────────────────────────────────
// Handles: Cloudinary secure_url, plain HTTPS, legacy Wix URIs/slugs

export function resolveThumb(img, w = 600) {
    const raw = typeof img === 'string'
        ? img
        : (img?.secureUrl || img?.src || img?.Slug || img?.slug || '')

    if (!raw) return null

    // Cloudinary — apply responsive + auto-format transforms
    if (raw.includes('res.cloudinary.com'))
        return raw.replace('/upload/', `/upload/c_scale,w_${w},f_auto,q_auto/`)

    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw

    // Legacy Wix URI:  wix:image://v1/<hash>/...
    const wixMatch = raw.match(/wix:image:\/\/v1\/([^/]+)\//)
    if (wixMatch) return `https://static.wixstatic.com/media/${wixMatch[1]}`

    // Plain Wix media hash (no protocol, no slashes)
    if (!raw.includes(':') && !raw.includes('/'))
        return `https://static.wixstatic.com/media/${raw}`

    return null
}

// ── Price parsing ─────────────────────────────────────────────────────────
// Extracts a numeric price from strings like "$1,500/month", "K2.1 million"
export function parsePrice(label) {
    if (!label) return null
    const millionMatch = label.match(/([\d,.]+)\s*million/i)
    if (millionMatch) {
        const n = parseFloat(millionMatch[1].replace(/,/g, ''))
        return isNaN(n) ? null : n * 1_000_000
    }
    const numMatch = label.match(/[\d,]+(\.\d+)?/)
    if (numMatch) {
        const n = parseFloat(numMatch[0].replace(/,/g, ''))
        return isNaN(n) ? null : n
    }
    return null
}

// ── Property normalisation ────────────────────────────────────────────────
// Converts any raw JSON item (Wix or camelCase) into the shape PropertyCard expects.
// Output shape is always camelCase and consistent.
export function normaliseProperty(raw) {
    // Detect format: Wix uses "ID" + "Title" (PascalCase) with array fields
    const isWix = raw.ID !== undefined && raw.Title !== undefined

    if (isWix) return normaliseWix(raw)
    return normaliseCamel(raw)
}

function normaliseWix(raw) {
    const listingType = arrFirst(raw['Listing Type'], 'Rent')
    // Wix exports "Buy" — normalise to "Sale"
    const normalisedLt = listingType.toLowerCase() === 'buy' ? 'Sale' : listingType

    const slug = raw.Slug?.trim() || raw.ID || ''
    const pricingLabel = raw.Pricing?.trim() || ''

    return {
        id: raw.ID || '',
        slug,
        title: raw.Title?.trim() || '',
        description: '',
        location: raw.Location?.trim() || '',
        listingType: normalisedLt,
        propertyStatus: arrFirst(raw['Propety Status'], 'Residential'),  // Wix typo
        propertyType: arrFirst(raw['Property Type'], 'House'),
        furnishingStatus: arrFirst(raw['Furnishing Status'], ''),
        bedrooms: raw.Bedrooms ?? null,
        bathrooms: raw.Bathroom ?? null,     // Wix uses "Bathroom" (singular)
        lotSize: raw['Lot Size']?.trim() || '',
        currency: arrFirst(raw.Currency, '$'),
        pricingLabel,
        price: parsePrice(pricingLabel),
        amenities: raw.Ammenities?.trim() || '',  // Wix typo
        addressFormatted: raw.Location?.trim() || '',
        // Wix images — array of objects with a "src" wix:image URI
        images: resolveWixImages(raw['Property Image'] || []),
        videos: [],
        _source: raw._source || 'legacy',
    }
}

function normaliseCamel(raw) {
    const pricingLabel = raw.pricingLabel?.trim() || ''

    return {
        id: raw.id || '',
        slug: raw.slug || '',
        title: raw.title?.trim() || '',
        description: raw.description?.trim() || '',
        location: raw.location?.trim() || '',
        listingType: raw.listingType || 'Rent',
        propertyStatus: raw.propertyStatus || 'Residential',
        propertyType: raw.propertyType || 'House',
        furnishingStatus: raw.furnishingStatus || '',
        bedrooms: raw.bedrooms ?? null,
        bathrooms: raw.bathrooms ?? null,
        lotSize: raw.lotSize?.trim() || '',
        currency: raw.currency || '$',
        pricingLabel,
        price: raw.price ?? parsePrice(pricingLabel),
        amenities: raw.amenities?.trim() || '',
        addressFormatted: raw.location?.trim() || '',
        // New format — images/videos are [{ publicId, secureUrl, alt }]
        images: (raw.images || []).map(img => ({
            publicId: img.publicId || '',
            secureUrl: img.secureUrl || '',
            alt: img.alt || '',
            // Expose src for resolveThumb compatibility
            src: img.secureUrl || '',
        })),
        videos: (raw.videos || []).map(v => ({
            publicId: v.publicId || '',
            secureUrl: v.secureUrl || '',
        })),
        _source: raw._source || 'managed',
    }
}

// Converts legacy Wix image array into a shape resolveThumb can handle
function resolveWixImages(arr) {
    return arr.map(img => {
        if (typeof img === 'string') return { src: img, alt: '' }
        return {
            publicId: '',
            secureUrl: '',
            src: img.src || img.Slug || img.slug || '',
            alt: img.alt || '',
        }
    })
}