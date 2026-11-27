import { CvDialog } from './Cv'
import ExploreNDMU from './ExploreNDMU'
import Header from './sections/Header'
import Hero from './sections/Hero'
import Projects from './sections/Projects'
import Stack from './sections/Stack'
import Contact from './sections/Contact'
import Footer from './sections/Footer'

export default function App() {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="mx-auto max-w-2xl px-4 sm:px-6">
        <Hero />
        <Projects />
        <ExploreNDMU />
        <Stack />
        <Contact />
      </main>
      <Footer />
      <CvDialog />
    </>
  )
}
