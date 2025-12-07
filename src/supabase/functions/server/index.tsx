import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

const app = new Hono();
const BASE_PATH = "/make-server-afc202d5";

// In-memory mock data store (replacing Supabase)
interface EmailData {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  category: string;
  purpose: string;
  date: string;
  link: string;
  correctness: 'correct' | 'wrong' | null;
}

const mockStore = new Map<string, EmailData>();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get(`${BASE_PATH}/health`, (c) => {
  return c.json({ status: "ok" });
});

// --- MailSense API ---

const CATEGORIES = [
  "ภาครัฐ",
  "การสมัครงาน", 
  "สวัสดิการ",
  "บริษัทในเครือ",
  "อื่นๆ"
];

const SENDERS = [
  "กรมสรรพากร",
  "JobDB", 
  "HR Department",
  "ประกันสังคม",
  "Lazada Affiliate",
  "LinkedIN Alerts",
  "App Store",
  "Shopee Marketing"
];

const SUBJECTS = [
  "แจ้งเตือนการยื่นภาษี",
  "New job opportunities matching your profile",
  "ประกาศวันหยุดบริษัทประจำปี",
  "เงินสมทบประกันสังคมเดือนล่าสุด",
  "Commission Report for Oct 2024",
  "ใบแจ้งหนี้อิเล็กทรอนิกส์",
  "ยืนยันคำสั่งซื้อ #22341",
  "Flash Sale เริ่มต้นเที่ยงคืนนี้"
];

const PURPOSES = [
  "Tax Payment Reminder",
  "Job Recruitment",
  "Company Announcement",
  "Social Security Update",
  "Affiliate Earnings",
  "Invoice / Billing",
  "Order Confirmation",
  "Marketing / Promotion"
];

// 1. Get all emails
app.get(`${BASE_PATH}/emails`, async (c) => {
  try {
    // Get all emails from mock store
    const emails: any[] = [];
    for (const [key, value] of mockStore.entries()) {
      if (key.startsWith("email:")) {
        emails.push(value);
      }
    }
    // Sort by date descending
    emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return c.json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    return c.json({ error: "Failed to fetch emails" }, 500);
  }
});

// 2. Simulate Fetch Mail (Generate random emails)
app.post(`${BASE_PATH}/fetch-mail`, async (c) => {
  try {
    const newEmails = [];
    // Generate 3-5 random emails
    const count = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < count; i++) {
      const id = crypto.randomUUID();
      const senderIdx = Math.floor(Math.random() * SENDERS.length);
      const categoryIdx = Math.floor(Math.random() * CATEGORIES.length);
      
      // Try to match context loosely or just random
      const sender = SENDERS[senderIdx];
      const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
      const category = CATEGORIES[categoryIdx];
      const purpose = PURPOSES[Math.floor(Math.random() * PURPOSES.length)];
      
      const email = {
        id,
        sender,
        subject,
        preview: "รายละเอียดเพิ่มเติมกรุณาคลิกที่ลิงก์...",
        category,
        purpose,
        date: new Date().toISOString(),
        link: "#",
        correctness: null // 'correct' | 'wrong' | null
      };

      // Save to mock store
      mockStore.set(`email:${id}`, email);
      newEmails.push(email);
    }

    return c.json({ message: "Emails fetched", data: newEmails });
  } catch (error) {
    console.error("Error generating emails:", error);
    return c.json({ error: "Failed to generate emails" }, 500);
  }
});

// 3. Update Correctness
app.patch(`${BASE_PATH}/email/:id/correctness`, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { correctness } = body; // 'correct' or 'wrong'

  if (!['correct', 'wrong'].includes(correctness)) {
    return c.json({ error: "Invalid status" }, 400);
  }

  try {
    const key = `email:${id}`;
    const email = mockStore.get(key);
    
    if (!email) {
      return c.json({ error: "Email not found" }, 404);
    }

    const updatedEmail = { ...email, correctness };
    mockStore.set(key, updatedEmail);

    return c.json({ message: "Updated", data: updatedEmail });
  } catch (error) {
    console.error("Error updating email:", error);
    return c.json({ error: "Failed to update email" }, 500);
  }
});

// 4. Clear all emails (Optional for reset)
app.delete(`${BASE_PATH}/reset`, async (c) => {
  try {
    // Clear all email entries from mock store
    const keysToDelete: string[] = [];
    for (const key of mockStore.keys()) {
      if (key.startsWith("email:")) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => mockStore.delete(key));
    return c.json({ message: "All emails cleared", count: keysToDelete.length });
  } catch (error) {
    return c.json({ error: "Error" }, 500);
  }
});

Deno.serve(app.fetch);
