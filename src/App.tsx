import Background from './components/Background'
import CursorGlow from './components/CursorGlow'
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
      <CursorGlow />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <About />
          <Projects />
          <Skills />
          <Contact />
        </main>
        <footer className="py-8 text-center font-mono text-xs text-muted/50 border-t border-border/30 tracking-widest uppercase">
          Designed &amp; built by Shai Aviv
        </footer>
      </div>
    </div>
  )
}
