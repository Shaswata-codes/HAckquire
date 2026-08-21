import { Link } from 'react-router-dom';
import { Sparkles, Zap, ArrowRight, CheckCircle, FileText, CreditCard, Bell, Star } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'AI Invoice Generator', desc: 'Describe your work in plain language and get a professional invoice instantly.' },
  { icon: CreditCard, title: 'UPI Reconciliation', desc: 'Match payments to invoices automatically and resolve unmatched transactions.' },
  { icon: Bell, title: 'Smart Reminders', desc: 'Get notified about overdue invoices and send WhatsApp/SMS reminders in one tap.' },
];

const stats = [
  { value: '10,000+', label: 'Invoices Generated' },
  { value: '₹2.4Cr+', label: 'Revenue Tracked' },
  { value: '5,000+', label: 'Happy Freelancers' },
  { value: '< 30s', label: 'Invoice Creation Time' },
];

const testimonials = [
  { name: 'Rajesh K.', role: 'Electrician, Noida', text: 'I just say what work I did and boom — professional invoice ready!', rating: 5 },
  { name: 'Priya S.', role: 'Home Tutor, Delhi', text: 'Finally an app that understands my needs. The AI is unbelievably smart.', rating: 5 },
  { name: 'Suresh P.', role: 'AC Technician, Mumbai', text: 'My clients are impressed with the professional invoices. Highly recommended!', rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0f0f1a' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ background: 'rgba(15,15,26,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Hackquire</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Login</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-bg pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>
            <Sparkles size={14} />
            Powered by Google Gemini AI
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Turn your work into an<br />
            <span className="gradient-text">invoice in seconds.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            AI-powered invoicing built for independent workers.<br />
            Electricians, tutors, tailors, freelancers — we've got you covered.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/register" className="btn-primary text-base py-4 px-8 rounded-xl glow-primary animate-pulse-glow">
              <Sparkles size={20} />
              Create Invoice with AI
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base py-4 px-8 rounded-xl">
              Sign In
            </Link>
          </div>

          {/* Demo invoice preview */}
          <div className="max-w-2xl mx-auto glass-card p-6 text-left animate-fade-in-up">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="flex-1 p-3 rounded-lg text-sm text-gray-300 italic"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                "Repaired Rahul's AC for ₹2500 and replaced the filter for ₹600. Payment due in 7 days."
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-400 text-sm mb-3">
              <CheckCircle size={14} />
              AI extracted 2 items • Client: Rahul • Due in 7 days
            </div>
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="px-4 py-2 flex justify-between text-xs" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                <span className="font-semibold">INVOICE INV-001</span>
                <span>Due: {new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="p-4 text-sm space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>AC Repair & Servicing × 1</span><span>₹2,500</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>AC Filter Replacement × 1</span><span>₹600</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <span>Total</span><span className="text-indigo-400">₹3,100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black gradient-text mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Everything you need to<br /><span className="gradient-text">get paid faster</span></h2>
            <p className="text-gray-400 text-lg">No accounting expertise required. Just do your work, we'll handle the paperwork.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="glass-card p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <Icon size={22} className="text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Loved by <span className="gradient-text">independent workers</span></h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm mb-4 italic">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center glass-card p-12">
          <h2 className="text-4xl font-black mb-4">Ready to get <span className="gradient-text">paid faster?</span></h2>
          <p className="text-gray-400 mb-8">Join thousands of independent workers who trust Hackquire for their invoicing needs.</p>
          <Link to="/register" className="btn-primary text-base py-4 px-8">
            <Sparkles size={20} />
            Start Free — No credit card needed
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-gray-600 text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap size={14} className="text-indigo-500" />
          <span className="gradient-text font-semibold">Hackquire</span>
        </div>
        <p>AI-Powered Invoicing for Independent Workers • Built with ❤️ for Hackathon 2026</p>
      </footer>
    </div>
  );
}
