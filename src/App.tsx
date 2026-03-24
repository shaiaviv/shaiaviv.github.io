import Background from './components/Background'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'

export default function App() {
  return (
    <div className="min-h-screen bg-background relative">
      <Background />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <About />
          <Projects />
          <Skills />
          <Contact />
        </main>
        <footer className="py-6 text-center font-mono text-xs text-muted border-t border-border/50">
          Designed & built by Shai Aviv
        </footer>
      </div>
    </div>
  )
}
