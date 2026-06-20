import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const UPDATED = "June 2026";

function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-brand-bg text-white min-h-screen font-sans selection:bg-white selection:text-black">
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-28 md:py-36">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold text-white/40 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft size={14} /> Back to home
        </Link>

        <h1 className="font-valtero-serif italic text-4xl md:text-6xl tracking-tight leading-[0.95] mb-4">
          {title}
        </h1>
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/30 font-bold mb-14">
          Last updated · {UPDATED}
        </p>

        <div className="space-y-10 text-white/60 leading-relaxed font-light text-[15px] md:text-base">
          {children}
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 text-sm text-white/40">
          Questions? Email{" "}
          <a
            href="mailto:Nishant15bihola@gmail.com"
            className="text-white/70 underline decoration-white/20 underline-offset-4 hover:text-white"
          >
            Nishant15bihola@gmail.com
          </a>
          .
        </div>
      </div>
    </div>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-white font-serif text-xl md:text-2xl mb-3">{heading}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>
        Aura Labs ("we", "us") builds websites, web apps, AI chatbots, and AI ad content for
        businesses worldwide from Edmonton, Alberta. This policy explains what we collect, why,
        and the control you have over your information.
      </p>

      <Section heading="What we collect">
        <p>
          When you submit a contact form, book a call, start a checkout, subscribe to The Journal,
          or chat with Aura AI, we collect the details you provide — typically your name, email,
          optional phone number, and the contents of your message. We also collect basic,
          anonymized usage analytics to understand site performance.
        </p>
      </Section>

      <Section heading="How we use it">
        <p>
          We use your information solely to respond to your inquiry, deliver requested services,
          send service-related or newsletter emails you opt into, and improve the site. We never
          sell your personal information.
        </p>
      </Section>

      <Section heading="Who we share it with">
        <p>
          We rely on trusted processors to operate — including Vercel (hosting), Supabase (database),
          Google Gemini (the AI assistant), Notion (CRM), and our email provider. They process data
          only to provide their service to us.
        </p>
      </Section>

      <Section heading="Your choices">
        <p>
          You can unsubscribe from newsletters at any time via the link in any email, and you can
          request access to or deletion of your data by emailing us. Analytics respect your
          browser's "Do Not Track" and reduced-data preferences where available.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service">
      <p>
        These terms govern your use of the Aura Labs website and any services you engage us for.
        By using this site you agree to them.
      </p>

      <Section heading="Services & quotes">
        <p>
          Prices shown on the site are starting estimates in CAD. Final scope, timeline, and cost
          are confirmed in a written proposal before any work begins. Quotes are valid for 30 days.
        </p>
      </Section>

      <Section heading="Payments">
        <p>
          Project work typically begins after an agreed deposit, with the balance due on delivery
          or per the milestones in your proposal. Monthly plans renew until cancelled.
        </p>
      </Section>

      <Section heading="Intellectual property">
        <p>
          On full payment, you own the final deliverables we produce for you. We may showcase
          completed work in our portfolio unless you request otherwise in writing.
        </p>
      </Section>

      <Section heading="Liability">
        <p>
          Our services are provided "as is". To the extent permitted by law, Aura Labs is not liable
          for indirect or consequential damages. Nothing here limits rights you have under applicable
          consumer law.
        </p>
      </Section>
    </LegalLayout>
  );
}
