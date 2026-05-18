import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';


export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setScrolled(latest > 50);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div 
      id="home"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowX: 'hidden' }}
    >
      {/* BACKGROUND ORBS */}
      <div style={styles.orbsContainer}>
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }} 
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          style={{...styles.orb, top: '5%', left: '10%', background: 'rgba(99, 102, 241, 0.15)'}} 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, -50, 0] }} 
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{...styles.orb, bottom: '20%', right: '5%', background: 'rgba(139, 92, 246, 0.12)'}} 
        />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }} 
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          style={{...styles.orb, top: '30%', right: '25%', background: 'rgba(6, 182, 212, 0.1)'}} 
        />
      </div>

      <div style={styles.gridOverlay} />

      <div style={styles.contentWrapper}>
        {/* SECTION B: HERO */}
        <section style={styles.heroSection}>
          <motion.div variants={fadeInUp} initial="hidden" animate="show" style={styles.heroInner}>
            <motion.div 
              animate={{ boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 20px rgba(99,102,241,0.5)', '0 0 0px rgba(99,102,241,0)'] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={styles.heroBadgeWrapper}
            >
              <Badge variant="indigo">✦ Real-Time AI Coding Platform — Now in Beta</Badge>
            </motion.div>

            <h1 style={styles.heroTitle}>
              Code Together.<br/>
              <span style={styles.heroTitleHighlight}>Ship Faster.</span><br/>
              With AI by Your Side.
            </h1>
            
            <p style={styles.heroSubtitle}>
              CollabCode AI combines real-time collaboration, intelligent AI assistance, 
              and secure exam tools — all in one powerful platform.
            </p>

            <div style={styles.heroButtons}>
              <Button size="lg" onClick={() => navigate('/register')}>Start Coding Free →</Button>
            </div>


          </motion.div>
        </section>

        {/* SECTION C: ANIMATED STATS BAR */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={styles.statsSection}
        >
          <div style={styles.statsGrid}>
            <StatBox number="500+" label="Rooms Created" />
            <StatBox number="98%" label="Uptime" />
            <StatBox number="5" label="AI Agents" />
            <StatBox number="<50ms" label="Real-Time Sync" />
          </div>
        </motion.section>

        {/* SECTION D: FEATURES GRID */}
        <section id="features" style={styles.featuresSection}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
            <h2 style={styles.sectionTitle}>Everything Your Team Needs</h2>
            <p style={styles.sectionSubtitle}>From live coding to AI assistance and exam proctoring</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            style={styles.featuresGrid}
          >
            <FeatureCard 
              icon="⚡" color="var(--accent-cyan)" title="Real-Time Collaboration" 
              desc="Multiple cursors, live code sync — like Google Docs, but for code." 
            />
            <FeatureCard 
              icon="🤖" color="var(--accent-primary)" title="Multi-Agent AI Assistant" 
              desc="Ask the AI to review, fix bugs, generate, optimize, or document your code." 
            />
            <FeatureCard 
              icon="💬" color="var(--accent-secondary)" title="Integrated Team Chat" 
              desc="Built-in messaging panel so your team stays in sync without leaving the editor." 
            />
            <FeatureCard 
              icon="🎓" color="var(--accent-amber)" title="Exam Mode with Timer" 
              desc="Teachers create rooms with countdown timers. Students code, submit, and get graded." 
            />
            <FeatureCard 
              icon="🔍" color="var(--accent-rose)" title="Plagiarism Detection" 
              desc="Automatically compare student submissions for code similarity." 
            />
            <FeatureCard 
              icon="⌨️" color="var(--accent-emerald)" title="Keystroke Analysis" 
              desc="Understand how each student approached the problem with playback." 
            />
          </motion.div>
        </section>

        {/* SECTION E: HOW IT WORKS */}
        <section style={styles.howItWorksSection}>
          <motion.h2 initial={{opacity:0}} whileInView={{opacity:1}} style={styles.sectionTitle}>Get Started in Minutes</motion.h2>
          
          <div style={styles.stepsContainer}>
            <div style={styles.connectingLine} />

            <Step number="1" icon="📝" title="Create an Account" desc="Sign up in seconds and access your dashboard." />
            <Step number="2" icon="🏠" title="Create or Join a Room" desc="Start a new session or join with a room ID." />
            <Step number="3" icon="🚀" title="Code with Your Team" desc="Collaborate instantly with AI by your side." />
          </div>
        </section>

        {/* SECTION F: AI AGENT SHOWCASE */}
        <section style={styles.aiSection}>
          <h2 style={styles.sectionTitle}>5 Specialized AI Agents</h2>
          <p style={styles.sectionSubtitle}>Powered by advanced LLMs — each agent handles a specific coding task</p>
          
          <div style={styles.aiGrid}>
            <AiCard icon="🐛" title="Bug Agent" desc="Finds and explains bugs in your code" code="> Error: undefined is not a function" border="var(--accent-rose)" />
            <AiCard icon="✨" title="Generate Agent" desc="Writes new code from your description" code="function calculateTotal() {..." border="var(--accent-cyan)" />
            <AiCard icon="📖" title="Review Agent" desc="Gives detailed code quality feedback" code="// Good use of early returns here" border="var(--accent-primary)" />
            <AiCard icon="⚡" title="Optimize Agent" desc="Makes your code faster and cleaner" code="const sum = arr.reduce((a,b)=>a+b)" border="var(--accent-emerald)" />
            <AiCard icon="📄" title="Doc Agent" desc="Writes comments and documentation" code="/**\n * Calculates total...\n */" border="var(--accent-amber)" />
          </div>
        </section>

        {/* SECTION G: FOOTER */}
        <footer id="about" style={styles.footer}>
          <div style={styles.footerGrid}>
            <div>
              <div style={styles.footerLogo}>⬡ CollabCode AI</div>
              <p style={styles.footerTagline}>The intelligent way to code together.</p>
              <div style={styles.socialIcons}>
                <span>👾</span><span>🐦</span><span>🐙</span>
              </div>
            </div>
            <div>
              <h4 style={styles.footerHeading}>Product</h4>
              <p style={styles.footerLink}>Features</p>
              <p style={styles.footerLink}>Pricing</p>
              <p style={styles.footerLink}>Changelog</p>
            </div>
            <div>
              <h4 style={styles.footerHeading}>Resources</h4>
              <p style={styles.footerLink}>Documentation</p>
              <p style={styles.footerLink}>Community</p>
              <p style={styles.footerLink}>API</p>
            </div>
            <div>
              <h4 style={styles.footerHeading}>Company</h4>
              <p style={styles.footerLink}>About</p>
              <p style={styles.footerLink}>Blog</p>
              <p style={styles.footerLink}>Careers</p>
            </div>
          </div>
          <div style={styles.footerBottom}>
            <p>© {new Date().getFullYear()} CollabCode AI. Made with ❤️ for final year project.</p>
          </div>
        </footer>
      </div>
    </motion.div>
  );
}

// Subcomponents

function StatBox({ number, label }) {
  return (
    <div style={styles.statBox}>
      <h3 style={styles.statNumber}>{number}</h3>
      <p style={styles.statLabel}>{label}</p>
    </div>
  );
}

function FeatureCard({ icon, color, title, desc }) {
  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div variants={itemVariant}>
      <GlassCard hoverEffect={true} style={{ height: '100%', borderColor: 'rgba(255,255,255,0.05)' }}>
        <div style={{...styles.featureIconWrapper, color, textShadow: `0 0 15px ${color}`}}>
          {icon}
        </div>
        <h3 style={styles.featureTitle}>{title}</h3>
        <p style={styles.featureDesc}>{desc}</p>
      </GlassCard>
    </motion.div>
  );
}

function Step({ number, icon, title, desc }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={styles.stepBox}
    >
      <div style={styles.stepCircle}>
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{number}</span>
      </div>
      <div style={styles.stepIcon}>{icon}</div>
      <h3 style={styles.stepTitle}>{title}</h3>
      <p style={styles.stepDesc}>{desc}</p>
    </motion.div>
  );
}

function AiCard({ icon, title, desc, code, border }) {
  return (
    <GlassCard hoverEffect={true} style={{ borderLeft: `4px solid ${border}`, minWidth: '280px', flex: '1 1 300px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>{desc}</p>
      <div style={{ background: 'var(--bg-base)', padding: '12px', borderRadius: '8px', fontFamily: 'var(--font-code)', fontSize: '12px', color: 'var(--accent-cyan)' }}>
        {code}
      </div>
    </GlassCard>
  );
}

// Styles

const styles = {
  orbsContainer: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none'
  },
  orb: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    filter: 'blur(100px)',
    opacity: 0.6
  },
  gridOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1,
    pointerEvents: 'none',
    backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
    backgroundSize: '40px 40px'
  },
  contentWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  heroSection: {
    padding: '160px 20px 100px',
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
  },
  heroInner: {
    maxWidth: '900px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  heroBadgeWrapper: {
    marginBottom: 'var(--space-6)',
    borderRadius: 'var(--radius-full)',
  },
  heroTitle: {
    fontSize: 'clamp(40px, 6vw, 72px)',
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: 'var(--space-6)',
    color: 'var(--text-primary)'
  },
  heroTitleHighlight: {
    background: 'var(--gradient-hero)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: 'var(--text-secondary)',
    maxWidth: '600px',
    marginBottom: 'var(--space-8)',
    lineHeight: 1.6
  },
  heroButtons: {
    display: 'flex',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-12)',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  socialProof: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  avatarGroup: {
    display: 'flex'
  },
  proofAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid var(--bg-base)',
    marginLeft: '-10px',
    backgroundSize: 'cover'
  },
  proofText: {
    fontSize: '14px',
    color: 'var(--text-muted)'
  },
  statsSection: {
    padding: '40px 20px',
    borderTop: '1px solid var(--bg-border)',
    borderBottom: '1px solid var(--bg-border)',
    background: 'rgba(22, 27, 39, 0.4)',
    backdropFilter: 'blur(10px)'
  },
  statsGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '40px'
  },
  statBox: {
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '40px',
    fontFamily: 'var(--font-display)',
    background: 'var(--gradient-brand)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '4px'
  },
  statLabel: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  featuresSection: {
    padding: '120px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: '36px',
    fontFamily: 'var(--font-display)',
    marginBottom: 'var(--space-2)'
  },
  sectionSubtitle: {
    color: 'var(--text-secondary)',
    marginBottom: 'var(--space-12)',
    fontSize: '18px'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'var(--space-6)',
    textAlign: 'left'
  },
  featureIconWrapper: {
    fontSize: '32px',
    marginBottom: 'var(--space-4)'
  },
  featureTitle: {
    fontSize: '20px',
    marginBottom: 'var(--space-2)',
    color: 'var(--text-primary)'
  },
  featureDesc: {
    color: 'var(--text-secondary)',
    fontSize: '15px'
  },
  howItWorksSection: {
    padding: '100px 20px',
    background: 'rgba(13, 17, 23, 0.6)',
    textAlign: 'center'
  },
  stepsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'var(--space-12)',
    maxWidth: '1000px',
    margin: '60px auto 0',
    position: 'relative',
    flexWrap: 'wrap'
  },
  connectingLine: {
    position: 'absolute',
    top: '30px',
    left: '15%',
    right: '15%',
    height: '2px',
    background: 'dashed 1px var(--bg-border)',
    zIndex: 0,
    '@media (max-width: 768px)': { display: 'none' } // simplistic
  },
  stepBox: {
    flex: '1 1 250px',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'var(--space-4)'
  },
  stepCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--gradient-brand)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    marginBottom: '16px'
  },
  stepIcon: {
    fontSize: '48px',
    marginBottom: '20px'
  },
  stepTitle: {
    fontSize: '20px',
    marginBottom: '10px'
  },
  stepDesc: {
    color: 'var(--text-secondary)',
    fontSize: '15px'
  },
  aiSection: {
    padding: '120px 20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  aiGrid: {
    display: 'flex',
    gap: 'var(--space-6)',
    overflowX: 'auto',
    padding: '20px 0',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },
  footer: {
    background: '#03050a',
    borderTop: '1px solid var(--bg-border)',
    padding: '80px 20px 40px'
  },
  footerGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    marginBottom: '60px'
  },
  footerLogo: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    color: 'white',
    marginBottom: '16px',
    fontWeight: 'bold'
  },
  footerTagline: {
    color: 'var(--text-secondary)',
    marginBottom: '24px',
    maxWidth: '250px'
  },
  socialIcons: {
    display: 'flex',
    gap: '16px',
    fontSize: '20px'
  },
  footerHeading: {
    color: 'white',
    marginBottom: '20px',
    fontSize: '16px'
  },
  footerLink: {
    color: 'var(--text-secondary)',
    marginBottom: '12px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  footerBottom: {
    maxWidth: '1200px',
    margin: '0 auto',
    borderTop: '1px solid var(--bg-border)',
    paddingTop: '30px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '14px'
  }
};