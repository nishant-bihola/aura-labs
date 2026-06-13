import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { Client as NotionClient } from "@notionhq/client";
import { adminAlertHTML, clientConfirmationHTML, paymentInstructionsHTML, adminPurchaseAlertHTML } from "./api/_lib/emails.js";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { CMS_DATA } from "./src/lib/cms.js";
import { client as sanityClient } from "./src/lib/sanity.js";

const prisma = new PrismaClient();
dotenv.config();

// --- CONFIGURATION ---
const PORT = parseInt(String(process.env.PORT || "3000"), 10);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const notion = process.env.NOTION_TOKEN ? new NotionClient({ 
  auth: process.env.NOTION_TOKEN 
}) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- EMAIL TEMPLATES (PREMIUM) ---

const generateBaseTemplate = (content: string, accentColor: string = "#00F0FF") => `
  <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #000000; color: #ffffff; padding: 60px 40px; border-radius: 30px; border: 1px solid #1a1a1a;">
    <div style="margin-bottom: 40px; text-align: center;">
      <span style="background: linear-gradient(90deg, ${accentColor}, #0077FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-size: 24px; letter-spacing: 2px;">AURA LABS</span>
    </div>
    ${content}
    <div style="padding-top: 40px; border-top: 1px solid #1a1a1a; color: #404040; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; text-align: center; margin-top: 40px;">
      © 2026 Aura Labs • Edmonton, Alberta • System Transmission
    </div>
  </div>
`;

const generateContactEmailHTML = (name: string, email: string, message: string, type: string, plan?: string) => `
  <h2 style="color: #ffffff; font-size: 28px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">New ${type} Submission</h2>
  <div style="background: #0a0a0a; padding: 30px; border-radius: 20px; border: 1px solid #1a1a1a; margin-bottom: 24px;">
    <p style="margin: 10px 0;"><strong>Client:</strong> ${name}</p>
    <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
    ${plan ? `<p style="margin: 10px 0;"><strong>Interested Plan:</strong> <span style="color: #00F0FF;">${plan}</span></p>` : ""}
  </div>
  <div style="padding: 20px; border-left: 2px solid #00F0FF; background: #050505;">
    <p style="color: #888; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">Message Content</p>
    <p style="font-size: 16px; line-height: 1.6; color: #ddd; margin: 0;">${message}</p>
  </div>
`;

const generateUserThankYouHTML = (name: string) => generateBaseTemplate(`
  <h2 style="color: #ffffff; font-size: 28px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">Transmission Received.</h2>
  <p style="font-size: 17px; line-height: 1.8; color: #a0a0a0; margin-bottom: 20px;">
    Greetings, ${name.split(' ')[0]}. We've successfully captured your project details.
  </p>
  <p style="font-size: 17px; line-height: 1.8; color: #a0a0a0; margin-bottom: 40px;">
    Our team is currently reviewing your vision. Expect a detailed response from one of our lead architects within <span style="color: #00F0FF;">24-48 hours</span>.
  </p>
`);

const generateBookingConfirmationHTML = (name: string, date: string, time: string) => generateBaseTemplate(`
  <h1 style="color: #ffffff; font-size: 32px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">Consultation Secured.</h1>
  <p style="font-size: 18px; line-height: 1.8; color: #a0a0a0; margin-bottom: 30px;">
    Hi ${name.split(' ')[0]}, your architectural session has been successfully added to our grid.
  </p>
  <div style="background: #0a0a0a; padding: 30px; border-radius: 20px; border: 1px solid #1a1a1a; margin-bottom: 40px; text-align: left;">
    <div style="margin-bottom: 15px;"><strong style="color: #00FF94; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Date</strong><br/><span style="font-size: 18px;">${date}</span></div>
    <div style="margin-bottom: 15px;"><strong style="color: #00FF94; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Time</strong><br/><span style="font-size: 18px;">${time} (Edmonton Time)</span></div>
    <div><strong style="color: #00FF94; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Protocol</strong><br/><span style="font-size: 18px;">Virtual Interface / Google Meet</span></div>
  </div>
  <p style="font-size: 14px; color: #404040;">
    A direct calendar invitation with the access link will be transmitted shortly.
  </p>
`, "#00FF94");

// --- SERVER LOGIC ---

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health Check
  app.get("/api/health", (req, res) => res.status(200).json({ status: "online", version: "1.0.0" }));

  // API Route for Contact Form
  app.post("/api/contact", async (req, res) => {
    const { name, email, message, type, plan } = req.body;
    const inquiryType = type || "Contact";
    
    try {
      // 1. Store in Supabase
      if (supabase) {
        await supabase.from("contact_submissions").insert([{ 
          first_name: name.split(' ')[0], 
          last_name: name.split(' ').slice(1).join(' '), 
          email, 
          message, 
          type: inquiryType,
          plan: plan
        }]);
      }

      // 2. Respond immediately
      res.status(200).json({ success: true });

      // 3. Background Tasks (Emails & Notion)
      (async () => {
        try {
          const tasks = [];

          // Admin Notification
          if (resend) {
            tasks.push(resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL || "Aura Labs <onboarding@resend.dev>",
              to: process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com",
              replyTo: email,
              subject: `NEW ${inquiryType.toUpperCase()} SUBMISSION: ${name}`,
              html: generateBaseTemplate(generateContactEmailHTML(name, email, message, inquiryType, plan)),
            }));

            // User Thank You / Newsletter Welcome
            if (inquiryType === "Newsletter") {
              tasks.push(resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || "Aura Labs <onboarding@resend.dev>",
                to: email,
                subject: "Welcome to The Journal | Aura Labs",
                html: generateBaseTemplate(`
                  <h1 style="color: #ffffff; font-size: 32px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">Welcome to the Inner Circle</h1>
                  <p style="font-size: 18px; line-height: 1.8; color: #a0a0a0; margin-bottom: 40px;">
                    Your subscription to <span style="color: #00F0FF;">The Journal</span> is confirmed. You'll receive our deep dives into the future of digital residency.
                  </p>
                `)
              }));
            } else {
              tasks.push(resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || "Aura Labs <onboarding@resend.dev>",
                to: email,
                subject: "Transmission Received | Aura Labs",
                html: generateUserThankYouHTML(name)
              }));
            }
          } else {
            console.warn("Resend not configured, skipping emails");
          }

          // Notion Sync
          if (notion && process.env.NOTION_DATABASE_ID) {
            tasks.push(notion.pages.create({
              parent: { database_id: process.env.NOTION_DATABASE_ID },
              properties: {
                Name: { title: [{ text: { content: name } }] },
                Email: { email: email },
                Message: { rich_text: [{ text: { content: message } }] },
                Type: { select: { name: inquiryType } },
                ...(plan && { Plan: { select: { name: plan } } }),
                Date: { date: { start: new Date().toISOString() } }
              }
            }));
          }

          await Promise.allSettled(tasks);
        } catch (err) {
          console.error("Background tasks failed:", err);
        }
      })();
    } catch (error) {
      console.error("Contact API Error:", error);
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route for Booking
  app.post("/api/book", async (req, res) => {
    const { name, email, date, time } = req.body;
    
    try {
      if (supabase) {
        await supabase.from("bookings").insert([{ name, email, date, time }]);
      }
      res.status(200).json({ success: true });

      (async () => {
        try {
          if (resend) {
            await Promise.allSettled([
              resend.emails.send({
              from: "Aura Labs <onboarding@resend.dev>",
              to: process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com",
              replyTo: email,
              subject: `NEW CALL BOOKED: ${name} on ${date}`,
              html: generateBaseTemplate(`
                <h2 style="color: #ffffff; font-size: 28px; margin-bottom: 24px; font-weight: 700; letter-spacing: -1px;">New Consultation Secured</h2>
                <div style="background: #0a0a0a; padding: 30px; border-radius: 20px; border: 1px solid #1a1a1a;">
                  <p><strong>Client:</strong> ${name}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Scheduled:</strong> ${date} at ${time}</p>
                </div>
              `, "#00FF94"),
            }),
            resend.emails.send({
              from: "Aura Labs <onboarding@resend.dev>",
              to: email,
              subject: "Consultation Confirmed | Aura Labs",
              html: generateBookingConfirmationHTML(name, date, time),
            })
            ]);
          } else {
            console.warn("Resend not configured, skipping booking emails");
          }
        } catch (err) {
          console.error("Booking email tasks failed:", err);
        }
      })();
    } catch (error) {
      console.error("Booking API Error:", error);
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route for Checkout Intent
  app.post("/api/checkout", async (req, res) => {
    const { name, email, plan, projectDetails } = req.body;
    
    try {
      if (supabase) {
        await supabase.from("contact_submissions").insert([{ 
          first_name: name.split(' ')[0], 
          last_name: name.split(' ').slice(1).join(' '), 
          email, 
          message: projectDetails, 
          type: "Checkout Intent",
          plan: plan
        }]);
      }
      res.status(200).json({ success: true });

      (async () => {
        try {
          if (resend) {
            await Promise.allSettled([
              resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || "Aura Labs <onboarding@resend.dev>",
                to: process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com",
                replyTo: email,
                subject: `💰 CHECKOUT INTENT: ${name} for ${plan}`,
                html: adminPurchaseAlertHTML(name, email, plan, projectDetails),
              }),
              resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || "Aura Labs <onboarding@resend.dev>",
                to: email,
                subject: "Payment Instructions | Aura Labs",
                html: paymentInstructionsHTML(name, plan),
              })
            ]);
          } else {
            console.warn("Resend not configured, skipping checkout emails");
          }
        } catch (err) {
          console.error("Checkout email tasks failed:", err);
        }
      })();
    } catch (error) {
      console.error("Checkout API Error:", error);
      if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route for AI Chatbot
  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array required" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ reply: "My AI neural link is currently offline (API Key missing). Please contact us directly at contact@aura-labs.com." });
    }

    const SYSTEM_INSTRUCTION = `
You are Aura AI, an elite digital architect and highly intelligent technical sales engineer for Aura Labs.
Our mission: ${CMS_DATA.company.mission}

Your core programming is based on the "Superpowers" methodology:
1. Systematic over ad-hoc: Do not just spit out prices immediately. Ask sharp, consultative questions to tease out the user's actual business requirements and problems first.
2. Socratic Brainstorming: Refine their rough ideas through intelligent questioning. Guide them to realize they need scalable architecture.
3. Project Scoping: Break down their needs into clear, digestible phases (e.g., Design, Development, Launch).
4. Evidence over claims: Provide structured, logical solutions before declaring success.

--- KNOWLEDGE BASE START ---
{{SERVICES_CONTEXT}}

{{PLANS_CONTEXT}}
--- KNOWLEDGE BASE END ---

${CMS_DATA.instructions_for_ai}

Tone: Professional, highly analytical, consultative, and empathetic. Speak like a senior technical founder who values architecture, clean code, and ROI. Do not be overly robotic; be human but brilliant.

CRITICAL INSTRUCTION: Once you have successfully teased out their requirements and convinced them to proceed with a project, you MUST ask for their name and email so a human architect can review the project spec and follow up. When they provide their name and email, you MUST respond ONLY with the exact following string:
[CAPTURE_LEAD: {"name": "<user_name>", "email": "<user_email>"}]
Do not add any other text or pleasantries to that specific response. Just output the JSON block.
`;

    // 0. Fetch Live Context from Sanity (Advanced RAG)
    let liveServices = CMS_DATA.services;
    let livePlans = CMS_DATA.pricing_plans;
    
    try {
      const fetchedServices = await sanityClient.fetch(`*[_type == "service"]`);
      const fetchedPlans = await sanityClient.fetch(`*[_type == "pricingPlan"]`);
      
      // Only override if Sanity has data
      if (fetchedServices.length > 0) liveServices = fetchedServices;
      if (fetchedPlans.length > 0) livePlans = fetchedPlans;
    } catch (sanityError) {
      console.error("Sanity RAG Fetch Error:", sanityError);
    }

    const DYNAMIC_SYSTEM_INSTRUCTION = SYSTEM_INSTRUCTION
      .replace("{{SERVICES_CONTEXT}}", JSON.stringify(liveServices, null, 2))
      .replace("{{PLANS_CONTEXT}}", JSON.stringify(livePlans, null, 2));

    try {
      const contents = messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const GRACEFUL_FALLBACK =
        "I'm getting a lot of requests right now, so let me keep this simple. " +
        "Aura Labs builds high-performance websites, web apps, AI chatbots, and AI ad content — projects start at $1,500. " +
        "Tell me what you're building and I'll point you to the right fit, or email **contact@aura-labs.com** and a human architect will jump in.";

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: DYNAMIC_SYSTEM_INSTRUCTION }] },
          contents: contents,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 800,
            thinkingConfig: { thinkingBudget: 0 },
          }
        })
      });

      if (!response.ok) {
        console.error("Gemini API error (dev):", response.status, await response.text().catch(() => ""));
        return res.status(200).json({ reply: GRACEFUL_FALLBACK });
      }

      const data = await response.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || GRACEFUL_FALLBACK;

      if (replyText.includes("[CAPTURE_LEAD:")) {
        try {
          const jsonStr = replyText.match(/\[CAPTURE_LEAD:\s*(.*?)\s*\]/)?.[1];
          if (jsonStr) {
            const leadData = JSON.parse(jsonStr);
            
            try {
              await prisma.lead.create({
                data: {
                  name: leadData.name,
                  email: leadData.email,
                  plan: "AI Chat Lead",
                  details: "Captured via Advanced RAG AI Chatbot",
                  addons: null
                }
              });
              await prisma.chatSession.create({
                data: {
                  email: leadData.email,
                  history: JSON.stringify(messages)
                }
              });
            } catch (dbError) {
              console.error("Prisma Error:", dbError);
            }

            if (resend) {
              await Promise.allSettled([
                resend.emails.send({
                  from: process.env.RESEND_FROM_EMAIL || "Aura Labs <onboarding@resend.dev>",
                  to: process.env.ADMIN_EMAIL || "nishant15bihola@gmail.com",
                  replyTo: leadData.email,
                  subject: `🤖 NEW AI LEAD: ${leadData.name}`,
                  html: adminAlertHTML(leadData.name, leadData.email, "Captured via AI Chatbot", "AI Chat Lead"),
                }),
                resend.emails.send({
                  from: process.env.RESEND_FROM_EMAIL || "Aura Labs <onboarding@resend.dev>",
                  to: leadData.email,
                  subject: "Strategy Session | Aura Labs",
                  html: clientConfirmationHTML(leadData.name, "Consultation"),
                })
              ]);
            }

            return res.status(200).json({ reply: `Perfect, ${leadData.name}. I've successfully transmitted your details to our team and sent a confirmation to ${leadData.email}. One of our lead architects will reach out shortly!` });
          }
        } catch (e) {
          console.error("Failed to parse lead capture:", e);
        }
      }

      return res.status(200).json({ reply: replyText });
    } catch (error) {
      console.error("Chat API Error:", error);
      return res.status(500).json({ reply: "I'm having trouble connecting to my systems right now. Please email us directly." });
    }
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n>> AURA LABS FULL-STACK ENGINE ONLINE`);
    console.log(`>> Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`>> Address: http://localhost:${PORT}\n`);
  });
}

startServer();
