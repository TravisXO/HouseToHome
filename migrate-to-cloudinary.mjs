/**
 * migrate-to-cloudinary.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time script: reads all-properties.json, uploads every Wix image to
 * Cloudinary, then writes a clean all-properties-cloudinary.json with the
 * new Cloudinary URLs — ready to drop in as your new all-properties.json.
 *
 * SETUP
 *   1. Place this file anywhere convenient (e.g. project root or a /scripts folder)
 *   2. npm init -y  (if no package.json nearby)
 *   3. npm i cloudinary
 *   4. Set your API secret below (or via env var CLOUDINARY_API_SECRET)
 *   5. node migrate-to-cloudinary.mjs
 *
 * SAFE TO RE-RUN — skips images already uploaded (checks by public_id).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { v2 as cloudinary } from 'cloudinary'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'

// ── Config ────────────────────────────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = 'dls9meup8'
const CLOUDINARY_API_KEY    = '536744655354969'
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? 'APS8ZmA7tS57BMEEK9tzt_cDNFc'

// Cloudinary folder all property images go into
const CLOUDINARY_FOLDER = 'housetohome/properties'

// Path to your source JSON — adjust if this script lives somewhere other than project root
const __dir = dirname(fileURLToPath(import.meta.url))
const INPUT_JSON = resolve(__dir, 'housetohome.client/src/data/all-properties.json')
const OUTPUT_JSON = resolve(__dir, 'housetohome.client/src/data/all-properties-cloudinary.json')

// How many images to upload in parallel (keep low to avoid rate limits)
const CONCURRENCY = 3

// Progress log file — so you can resume if something crashes
const PROGRESS_LOG = resolve(__dir, 'migration-progress.json')

// ── Wix CDN URL builder ───────────────────────────────────────────────────────
// Wix stores images by their slug. The public CDN URL looks like:
//   https://static.wixstatic.com/media/<slug>
// We request full quality (no transformations) so Cloudinary gets the original.
function wixUrl(slug) {
    // Some slugs already look like full URLs — return as-is
    if (slug.startsWith('http')) return slug
    return `https://static.wixstatic.com/media/${slug}`
}

// ── Cloudinary public_id for a given slug ─────────────────────────────────────
// Strip file extension from slug to use as a clean Cloudinary public_id.
// e.g.  a610ee_bc6ca6b992ea4cb98ee833a5f18140a7~mv2.jpg
//    →  housetohome/properties/a610ee_bc6ca6b992ea4cb98ee833a5f18140a7~mv2
function slugToPublicId(slug) {
    const base = slug.replace(/\.[^.]+$/, '') // remove extension
    return `${CLOUDINARY_FOLDER}/${base}`
}

// ── Upload a single image (idempotent) ────────────────────────────────────────
async function uploadImage(slug, progress) {
    const publicId = slugToPublicId(slug)

    // Already uploaded in a previous run?
    if (progress[slug]) {
        return progress[slug]
    }

    const sourceUrl = wixUrl(slug)

    try {
        const result = await cloudinary.uploader.upload(sourceUrl, {
            public_id: publicId,
            overwrite: false,          // don't re-upload if already there
            resource_type: 'image',
            fetch_format: 'auto',      // Cloudinary will serve webp/avif to browsers that support it
            quality: 'auto',
        })

        const cloudUrl = result.secure_url
        progress[slug] = cloudUrl      // cache so re-runs skip this
        return cloudUrl

    } catch (err) {
        // If Cloudinary says "already exists" with overwrite:false, fetch the existing URL
        if (err?.http_code === 400 && err?.message?.includes('already exists')) {
            const existing = cloudinary.url(publicId, { secure: true, fetch_format: 'auto', quality: 'auto' })
            progress[slug] = existing
            return existing
        }
        console.error(`  ✗ Failed to upload slug "${slug}":`, err?.message ?? err)
        return null   // keep original slug so data isn't lost
    }
}

// ── Batch with concurrency limit ──────────────────────────────────────────────
async function uploadBatch(slugs, progress, label) {
    const results = {}
    let done = 0

    async function worker(queue) {
        while (queue.length > 0) {
            const slug = queue.shift()
            const url = await uploadImage(slug, progress)
            results[slug] = url
            done++
            process.stdout.write(`\r  ${label}: ${done}/${slugs.length} images`)
        }
    }

    const queue = [...slugs]
    const workers = Array.from({ length: CONCURRENCY }, () => worker(queue))
    await Promise.all(workers)
    console.log()  // newline after progress
    return results
}

// ── Load / save progress log ──────────────────────────────────────────────────
function loadProgress() {
    if (existsSync(PROGRESS_LOG)) {
        try { return JSON.parse(readFileSync(PROGRESS_LOG, 'utf8')) } catch {}
    }
    return {}
}

function saveProgress(progress) {
    writeFileSync(PROGRESS_LOG, JSON.stringify(progress, null, 2))
}

// ── Confirm prompt ────────────────────────────────────────────────────────────
function confirm(question) {
    return new Promise(resolve => {
        const rl = createInterface({ input: process.stdin, output: process.stdout })
        rl.question(question, answer => {
            rl.close()
            resolve(answer.trim().toLowerCase() === 'y')
        })
    })
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    console.log('╔══════════════════════════════════════════════════════╗')
    console.log('║   HouseToHome — Wix → Cloudinary Image Migration    ║')
    console.log('╚══════════════════════════════════════════════════════╝\n')

    // Validate input file
    if (!existsSync(INPUT_JSON)) {
        console.error(`✗ Input file not found: ${INPUT_JSON}`)
        console.error('  Adjust INPUT_JSON path at the top of this script.')
        process.exit(1)
    }

    // Configure Cloudinary
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key:    CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure:     true,
    })

    // Load data
    const properties = JSON.parse(readFileSync(INPUT_JSON, 'utf8'))
    console.log(`✓ Loaded ${properties.length} properties from ${INPUT_JSON}`)

    // Collect all unique slugs
    const allSlugs = new Set()
    for (const prop of properties) {
        for (const img of (prop['Property Image'] ?? [])) {
            const slug = img.slug ?? img.Slug
            if (slug) allSlugs.add(slug)
        }
        // Also handle Placeholder field slugs (wix:image://v1/<slug>/...)
        if (prop.Placeholder) {
            const match = prop.Placeholder.match(/wix:image:\/\/v1\/([^/]+)\//)
            if (match) allSlugs.add(match[1])
        }
    }

    const slugList = [...allSlugs]
    console.log(`✓ Found ${slugList.length} unique images across all properties\n`)

    // Load previous progress
    const progress = loadProgress()
    const alreadyDone = Object.keys(progress).length
    if (alreadyDone > 0) {
        console.log(`  ℹ Resuming — ${alreadyDone} images already uploaded from a previous run.\n`)
    }

    const remaining = slugList.filter(s => !progress[s])
    if (remaining.length === 0) {
        console.log('  ✓ All images already uploaded. Rebuilding JSON...\n')
    } else {
        console.log(`  About to upload ${remaining.length} images to Cloudinary`)
        console.log(`  Folder: ${CLOUDINARY_FOLDER}\n`)
        const ok = await confirm('  Continue? (y/n): ')
        if (!ok) { console.log('Aborted.'); process.exit(0) }
        console.log()

        // Upload in batches
        await uploadBatch(remaining, progress, 'Uploading')
        saveProgress(progress)
        console.log(`\n  ✓ Progress saved to ${PROGRESS_LOG}`)
    }

    // ── Rewrite JSON ──────────────────────────────────────────────────────────
    console.log('\n  Rewriting JSON with Cloudinary URLs...')

    let imageCount = 0
    let failCount  = 0

    const newProperties = properties.map((prop, propIdx) => {
        const newProp = { ...prop }

        // Rewrite Property Image array
        newProp['Property Image'] = (prop['Property Image'] ?? []).map(img => {
            const slug = img.slug ?? img.Slug
            if (!slug) return img

            const cloudUrl = progress[slug]
            if (!cloudUrl) { failCount++; return img }  // keep original if upload failed

            imageCount++
            return {
                // Keep all original metadata, just replace URL fields
                ...img,
                slug:      cloudUrl,   // ← now a full Cloudinary HTTPS URL
                Slug:      cloudUrl,
                src:       cloudUrl,
                // Clear Wix-specific fields to keep JSON clean
                _wixSlug:  slug,       // preserve original in case you need it
            }
        })

        // Rewrite Placeholder field
        if (prop.Placeholder) {
            const match = prop.Placeholder.match(/wix:image:\/\/v1\/([^/]+)\//)
            if (match && progress[match[1]]) {
                newProp.Placeholder = progress[match[1]]
            }
        }

        // Generate a clean ID if missing
        if (!newProp.ID) {
            newProp.ID = `prop-${String(propIdx + 1).padStart(3, '0')}`
        }

        return newProp
    })

    writeFileSync(OUTPUT_JSON, JSON.stringify(newProperties, null, 2))

    console.log(`\n╔══════════════════════════════════════════════════════╗`)
    console.log(`║                  Migration Complete                  ║`)
    console.log(`╚══════════════════════════════════════════════════════╝`)
    console.log(`  ✓ ${imageCount} images rewritten with Cloudinary URLs`)
    if (failCount > 0) {
        console.log(`  ⚠ ${failCount} images failed — original Wix URLs kept as fallback`)
    }
    console.log(`  ✓ Output: ${OUTPUT_JSON}\n`)
    console.log(`  Next steps:`)
    console.log(`  1. Check the output JSON looks correct`)
    console.log(`  2. Rename it to all-properties.json (back up the old one first!)`)
    console.log(`  3. Delete all-current-properties.json if it exists`)
    console.log(`  4. Restart your backend — it will auto-reseed from the new file`)
    console.log(`  5. Delete migration-progress.json once you're happy\n`)
}

main().catch(err => {
    console.error('\n✗ Migration failed:', err)
    process.exit(1)
})
