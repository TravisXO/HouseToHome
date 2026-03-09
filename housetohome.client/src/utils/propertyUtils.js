// ── Shared helpers for reading the Wix JSON file ─────────────────────────────
// Used by: PropertyListingPage, PropertyDetailPage, PropertyListingGrid

export function arrFirst(val, fallback = '') {
    if (Array.isArray(val)) return val[0] || fallback
    return val || fallback
}

// Mirrors AdminPage's resolveThumb exactly
export function resolveThumb(img) {
    const raw = img?.src || img?.Slug || img?.slug || ''
    if (!raw) return null
    if (raw.startsWith('https://') || raw.startsWith('http://')) return raw
    const wixMatch = raw.match(/wix:image:\/\/v1\/([^/]+)\//)
    if (wixMatch) return `https://static.wixstatic.com/media/${wixMatch[1]}`
    if (!raw.includes(':') && !raw.includes('/'))
        return `https://static.wixstatic.com/media/${raw}`
    return null
}

// Extracts a numeric price from a pricing label string like "$1,500/month", "K2.1 million"
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

// Normalises a raw Wix JSON item into the shape PropertyCard expects
export function normaliseProperty(raw) {
    const listingType = arrFirst(raw['Listing Type'], 'Rent')
    // Normalise "Buy" → "Sale" so listingType is always "Rent" | "Sale"
    const normalisedLt = listingType.toLowerCase() === 'buy' ? 'Sale' : listingType

    // Build a slug from Wix Slug field, falling back to ID
    const slug = raw.Slug?.trim() || raw.ID || ''

    const pricingLabel = raw.Pricing?.trim() || ''

    return {
        id:               raw.ID || '',
        slug,
        title:            raw.Title?.trim() || '',
        location:         raw.Location?.trim() || '',
        listingType:      normalisedLt,
        propertyStatus:   arrFirst(raw['Propety Status'], 'Residential'),
        propertyType:     arrFirst(raw['Property Type'], 'House'),
        furnishingStatus: arrFirst(raw['Furnishing Status'], ''),
        bedrooms:         raw.Bedrooms ?? null,
        bathrooms:        raw.Bathroom ?? null,
        lotSize:          raw['Lot Size']?.trim() || '',
        currency:         arrFirst(raw.Currency, '$'),
        pricingLabel,
        price:            parsePrice(pricingLabel),
        amenities:        raw.Ammenities?.trim() || '',
        addressFormatted: raw.Location?.trim() || '',
        images:           raw['Property Image'] || [],
    }
}
