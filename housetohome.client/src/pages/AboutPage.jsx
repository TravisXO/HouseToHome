import AboutStory from '../components/about/AboutStory'
import AboutValues from '../components/about/AboutValues'
import AboutDivisions from '../components/about/AboutDivisions'
import AboutServices from '../components/about/AboutServices'
import AboutTeam from '../components/about/AboutTeam'
import AboutCredentials from '../components/about/AboutCredentials'
import AboutCTA from '../components/about/AboutCTA'

export default function AboutPage() {
    return (
        <main>
            <AboutStory />
            <AboutValues />
            <AboutDivisions />
            <AboutServices />
            <AboutTeam />
            <AboutCredentials />
            <AboutCTA />
        </main>
    )
}