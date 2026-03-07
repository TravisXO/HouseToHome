import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

// ── Always-eager: Hero is above the fold, load it immediately ──
import Hero from './components/home/Hero'

// ── Lazy: below-fold home sections ──
const AboutSection = lazy(() => import('./components/home/AboutSection'))
const PropertyListingGrid = lazy(() => import('./components/home/PropertyListingGrid'))
const InvestmentBanner = lazy(() => import('./components/home/InvestmentBanner'))
const ServiceSection = lazy(() => import('./components/home/ServiceSection'))
const TestimonialSlider = lazy(() => import('./components/home/TestimonialSlider'))
const BlogPreviewSection = lazy(() => import('./components/home/BlogPreviewSections'))
const PartnersSection = lazy(() => import('./components/home/PartnerSections'))

// ── Lazy: route-level pages ──
const AboutPage = lazy(() => import('./pages/AboutPage'))
const PropertyListingPage = lazy(() => import('./pages/PropertyListingPage'))
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'))

// Minimal spinner shown while a lazy chunk downloads (~200ms on first visit)
function PageSkeleton() {
    return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '3px solid #e8e8e8', borderTopColor: '#0b699c',
                animation: 'spin 0.7s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

function HomePage() {
    return (
        <main>
            <Hero />
            <Suspense fallback={null}>
                <AboutSection />
                <PropertyListingGrid />
                <InvestmentBanner />
                <ServiceSection />
                <TestimonialSlider />
                <BlogPreviewSection />
                <PartnersSection />
            </Suspense>
        </main>
    )
}

function App() {
    return (
        <BrowserRouter>
            <Header />
            <Suspense fallback={<PageSkeleton />}>
                <Routes>
                    {/* Home */}
                    <Route path="/" element={<HomePage />} />

                    {/* About */}
                    <Route path="/about" element={<AboutPage />} />

                    {/* Rent */}
                    <Route path="/residential-rent" element={<PropertyListingPage />} />
                    <Route path="/commercial-rent" element={<PropertyListingPage />} />

                    {/* Buy */}
                    <Route path="/residential-sale" element={<PropertyListingPage />} />
                    <Route path="/land-sale" element={<PropertyListingPage />} />
                    <Route path="/commercial-sale" element={<PropertyListingPage />} />
                    <Route path="/investments" element={<PropertyListingPage />} />

                    {/* Property Detail */}
                    <Route path="/properties/:slug" element={<PropertyDetailPage />} />
                </Routes>
            </Suspense>
            <Footer />
        </BrowserRouter>
    )
}

export default App