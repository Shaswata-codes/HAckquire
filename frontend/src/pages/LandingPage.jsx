import { Link } from 'react-router-dom';
import { Sparkles, Zap, ArrowRight, CheckCircle, CreditCard, Bell, Star } from 'lucide-react';

/* ---------------------------------------------------------
   Design tokens — shared visual language with Dashboard.jsx
--------------------------------------------------------- */
const T = {
  bg: '#0A0E17',
  surface: 'rgba(255, 255, 255, 0.03)',
  surfaceHover: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderSoft: 'rgba(255, 255, 255, 0.04)',
  text: '#F8FAFC',
  textDim: '#94A3B8',
  textFaint: '#64748B',
  indigo: '#6366F1',
  indigoSoft: '#818CF8',
  cyan: '#22D3EE',
  emerald: '#10B981',
  amber: '#FBBF24',
};

const gradientText = {
  backgroundImage: `linear-gradient(135deg, ${T.indigoSoft} 0%, ${T.cyan} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
};

const glassCard = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: '24px',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
};

const features = [
  { icon: Sparkles, title: 'AI Invoice Generator', desc: 'Describe your work in plain language and get an itemized, professional invoice instantly.' },
  { icon: CreditCard, title: 'UPI Reconciliation', desc: 'Match incoming payments to open invoices automatically and flag unresolved transactions.' },
  { icon: Bell, title: 'Smart Reminders', desc: 'Automate overdue alerts and dispatch WhatsApp or SMS payment reminders in one tap.' },
];

const stats = [
  { value: '10,000+', label: 'Invoices Generated' },
  { value: '₹2.4Cr+', label: 'Revenue Tracked' },
  { value: '5,000+', label: 'Happy Freelancers' },
  { value: '< 30s', label: 'Invoice Creation Time' },
];

const testimonials = [
  { name: 'Rajesh K.', role: 'Electrician, Noida', text: 'I just speak what work I did and boom — professional invoice ready in seconds!', rating: 5 },
  { name: 'Priya S.', role: 'Home Tutor, Delhi', text: 'Finally an app that understands informal work. The AI parsing is remarkably smart.', rating: 5 },
  { name: 'Suresh P.', role: 'AC Technician, Mumbai', text: 'My clients take my billing seriously now with clean PDF invoices. Highly recommended!', rating: 5 },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, overflowX: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Scoped CSS styling */}
      <style>{`
        .lp-nav-link { 
          transition: color 180ms ease; 
          text-decoration: none; 
        }
        .lp-nav-link:hover { 
          color: ${T.text} !important; 
        }

        .lp-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, ${T.indigo}, #4F46E5);
          color: #fff;
          font-weight: 600;
          text-decoration: none;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 25px -5px ${T.indigo}66, inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lp-btn-primary:hover { 
          transform: translateY(-2px); 
          filter: brightness(1.1); 
          box-shadow: 0 16px 32px -4px ${T.indigo}88; 
        }
        .lp-btn-primary:active { 
          transform: translateY(0); 
        }

        .lp-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          color: ${T.text};
          font-weight: 600;
          text-decoration: none;
          border-radius: 14px;
          border: 1px solid ${T.border};
          transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lp-btn-secondary:hover { 
          background: ${T.surfaceHover}; 
          border-color: rgba(255, 255, 255, 0.2); 
          transform: translateY(-2px); 
        }
        .lp-btn-secondary:active { 
          transform: translateY(0); 
        }

        .lp-glow { 
          animation: lpPulseGlow 3.5s ease-in-out infinite; 
        }
        @keyframes lpPulseGlow {
          0%, 100% { box-shadow: 0 8px 30px -4px ${T.indigo}88; }
          50% { box-shadow: 0 12px 40px -2px ${T.cyan}99; }
        }

        .lp-fade-up { 
          animation: lpFadeUp 800ms cubic-bezier(0.16, 1, 0.3, 1) both; 
        }
        @keyframes lpFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .lp-feature-card, .lp-testimonial-card {
          transition: transform 250ms ease, border-color 250ms ease, box-shadow 250ms ease;
        }
        .lp-feature-card:hover, .lp-testimonial-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.16);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
        }

        a:focus-visible, button:focus-visible {
          outline: 2px solid ${T.cyan};
          outline-offset: 3px;
          border-radius: 10px;
        }
      `}</style>

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-center"
        style={{ background: 'rgba(10, 14, 23, 0.75)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${T.borderSoft}` }}
      >
        <div className="w-full max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${T.indigo}, ${T.cyan})`,
                boxShadow: `0 4px 16px ${T.indigo}40`,
              }}
            >
              <Zap size={18} color="#fff" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', ...gradientText }}>Hackquire</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="lp-nav-link" style={{ color: T.textDim, fontSize: 14, fontWeight: 500 }}>
              Login
            </Link>
            <Link to="/register" className="lp-btn-primary" style={{ fontSize: 14, padding: '10px 20px' }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="flex flex-col items-center justify-center text-center relative"
        style={{
          paddingTop: '160px',
          paddingBottom: '100px',
          paddingInline: '24px',
          background: `radial-gradient(ellipse 90% 60% at 50% 0%, ${T.indigo}22, transparent)`,
        }}
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div
            className="lp-fade-up inline-flex items-center gap-2"
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              marginBottom: 32,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.01em',
              background: 'rgba(99, 102, 241, 0.1)',
              border: `1px solid rgba(99, 102, 241, 0.25)`,
              color: T.indigoSoft,
            }}
          >
            <Sparkles size={14} />
            Powered by Google Gemini AI
          </div>

          <h1
            className="lp-fade-up"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.25rem)',
              fontWeight: 900,
              marginBottom: 24,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              animationDelay: '80ms',
            }}
          >
            Turn your work into an <br />
            <span style={gradientText}>invoice in seconds.</span>
          </h1>

          <p
            className="lp-fade-up"
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
              color: T.textDim,
              marginBottom: 44,
              maxWidth: 640,
              lineHeight: 1.6,
              animationDelay: '140ms',
            }}
          >
            AI-powered invoicing built for independent workers, technicians, tutors, and freelancers across India.
          </p>

          <div className="lp-fade-up flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mb-20" style={{ animationDelay: '200ms' }}>
            <Link to="/register" className="lp-btn-primary lp-glow flex-1" style={{ fontSize: 16, padding: '16px 28px', borderRadius: 16 }}>
              <Sparkles size={18} />
              Create Invoice
              <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="lp-btn-secondary flex-1" style={{ fontSize: 16, padding: '16px 28px', borderRadius: 16 }}>
              Sign In
            </Link>
          </div>

          {/* Demo Invoice Preview */}
          <div className="lp-fade-up w-full max-w-xl text-left" style={{ ...glassCard, padding: 28, animationDelay: '260ms' }}>
            <div className="flex items-start gap-3.5 mb-5">
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `linear-gradient(135deg, ${T.indigo}, ${T.cyan})`,
                }}
              >
                <Sparkles size={16} color="#fff" />
              </div>
              <div
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 12, fontSize: 14, color: '#E2E8F0', fontStyle: 'italic',
                  background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${T.borderSoft}`,
                }}
              >
                "Repaired Rahul's AC for ₹2500 and replaced the filter for ₹600. Payment due in 7 days."
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.emerald, fontSize: 13, fontWeight: 500, marginBottom: 16, paddingLeft: 4 }}>
              <CheckCircle size={15} />
              AI extracted 2 items • Client: Rahul • Due in 7 days
            </div>

            <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.borderSoft}`, background: 'rgba(0, 0, 0, 0.25)' }}>
              <div
                style={{
                  padding: '12px 18px', display: 'flex', justifyContent: 'space-between', fontSize: 12,
                  background: `${T.indigo}15`, color: T.indigoSoft, borderBottom: `1px solid ${T.borderSoft}`,
                }}
              >
                <span style={{ fontWeight: 700, letterSpacing: '0.02em' }}>INVOICE #INV-001</span>
                <span>Due: {new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-IN')}</span>
              </div>
              <div style={{ padding: '18px', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: T.textDim }}>
                  <span>AC Repair & Servicing × 1</span>
                  <span style={{ color: T.text, fontWeight: 500 }}>₹2,500</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: T.textDim }}>
                  <span>AC Filter Replacement × 1</span>
                  <span style={{ color: T.text, fontWeight: 500 }}>₹600</span>
                </div>
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: T.text, paddingTop: 12,
                    borderTop: `1px solid ${T.borderSoft}`,
                  }}
                >
                  <span>Total Amount</span>
                  <span style={{ color: T.cyan, fontSize: 16 }}>₹3,100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '64px 24px', borderBlock: `1px solid ${T.borderSoft}`, background: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i} className="lp-stat lp-fade-up flex flex-col items-center" style={{ animationDelay: `${i * 60}ms` }}>
              <div style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4, ...gradientText }}>
                {s.value}
              </div>
              <div style={{ fontSize: 14, color: T.textDim, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '100px 24px' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
              Everything you need to <br />
              <span style={gradientText}>get paid faster</span>
            </h2>
            <p style={{ color: T.textDim, fontSize: 17, lineHeight: 1.6 }}>
              No accounting background needed. Speak or write your daily work, and we handle the itemization and follow-ups.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="lp-feature-card lp-fade-up flex flex-col items-start" style={{ ...glassCard, padding: 32, animationDelay: `${i * 80}ms` }}>
                <div
                  style={{
                    width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                    background: `linear-gradient(135deg, ${T.indigo}25, ${T.cyan}25)`, border: `1px solid ${T.indigo}40`,
                  }}
                >
                  <Icon size={24} style={{ color: T.indigoSoft }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.01em' }}>{title}</h3>
                <p style={{ color: T.textDim, fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '100px 24px', borderTop: `1px solid ${T.borderSoft}`, background: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Loved by <span style={gradientText}>independent workers</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="lp-testimonial-card lp-fade-up flex flex-col justify-between" style={{ ...glassCard, padding: 32, animationDelay: `${i * 80}ms` }}>
                <div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} size={16} style={{ color: T.amber, fill: T.amber }} />
                    ))}
                  </div>
                  <p style={{ color: '#E2E8F0', fontSize: 15, lineHeight: 1.6, marginBottom: 24, fontStyle: 'italic' }}>
                    "{t.text}"
                  </p>
                </div>
                <div style={{ borderTop: `1px solid ${T.borderSoft}`, paddingTop: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: T.textFaint, marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '100px 24px' }}>
        <div className="lp-fade-up max-w-4xl mx-auto text-center flex flex-col items-center" style={{ ...glassCard, padding: '64px 32px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Ready to get <span style={gradientText}>paid on time?</span>
          </h2>
          <p style={{ color: T.textDim, fontSize: 17, maxWidth: 540, marginBottom: 36, lineHeight: 1.6 }}>
            Join thousands of service professionals and freelancers streamlining their billing pipeline today.
          </p>
          <Link to="/register" className="lp-btn-primary lp-glow" style={{ fontSize: 16, padding: '16px 36px', borderRadius: 16 }}>
            <Sparkles size={18} />
            Start Free — No Credit Card Needed
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '48px 24px', textAlign: 'center', color: T.textFaint, fontSize: 14, borderTop: `1px solid ${T.borderSoft}` }}>
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} style={{ color: T.indigo }} />
            <span style={{ fontWeight: 700, fontSize: 16, ...gradientText }}>Hackquire</span>
          </div>
          <p style={{ color: T.textDim }}>AI-Powered Invoicing for Independent Workers • Built for Hackathon 2026</p>
        </div>
      </footer>
    </div>
  );
}