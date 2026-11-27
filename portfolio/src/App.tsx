import { CvDialog } from './Cv'
import ExploreNDMU from './ExploreNDMU'
import Header from './sections/Header'
import Hero from './sections/Hero'
import Projects from './sections/Projects'
import Journey from './sections/Journey'
import Stack from './sections/Stack'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import Wayfinder from './features/Wayfinder'

export default function App() {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="mx-auto max-w-2xl px-4 sm:px-6">
        <Hero />
        <Projects />
        <ExploreNDMU />
        <Journey />
        <Stack />
        <Contact />
      </main>
      <Footer />
      <CvDialog />
      <Wayfinder />
    </>
  )
}
