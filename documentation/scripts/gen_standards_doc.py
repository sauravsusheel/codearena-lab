import os
from helpers import *

doc = nd()

# Cover
doc.add_paragraph()
for tx, sz, bo, co in [
    ("CHANAKYA UNIVERSITY", 16, True, DARK),
    ("Department of Computer Science and Applications", 12, False, GRAY)
]:
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(tx); r.font.size = Pt(sz); r.font.bold = bo; r.font.color.rgb = co

doc.add_paragraph()
for tx, sz, bo, co in [
    ("UniSphere Academic Portal", 22, True, DARK),
    ("Institutional UI Design System and Universal Database Table Standards", 13, False, BLUE),
    ("Master Guidelines for MCA Semester 3 Engineering Teams", 11, False, GRAY)
]:
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(tx); r.font.size = Pt(sz); r.font.bold = bo; r.font.color.rgb = co

doc.add_paragraph()
tb(doc, ["Document Parameter", "Specification"], [
    ["Document Title", "UniSphere UI Design & Database Standards Specification"],
    ["Applicable Scope", "All Engineering Teams (Team 01 to Team 08)"],
    ["Academic Programme", "Master of Computer Applications (MCA) -- Semester 3"],
    ["Institutional Authority", "Chanakya University Branding & Academic Guidelines"],
    ["Version", "1.0 -- Production Release"],
    ["Document Classification", "Academic Engineering Standard -- Mandatory Compliance"]
], ws=[2.4, 4.4])

doc.add_page_break()

# Section 1: Executive Architectural Direction
hd(doc, "1. Executive Architectural Direction")
bd(doc, "The UniSphere platform is a unified academic digital ecosystem designed to integrate eight core university operations: Human Resource Management, Smart Attendance, Secure AI Examinations, Coding Competency & Practice, Oral Presentation AI Evaluation, Campus RAG Bot, University Research Repository, and Academic Project/Internship Tracking.")
bd(doc, "To achieve production-grade quality, institutional cohesion, and zero friction during parallel engineering across eight separate teams of MCA students, this document mandates two core engineering standards:")
bl(doc, "Universal Database Table Design Standards: Clear delineation between isolated physical databases and strictly enforced common schema conventions, canonical primary keys, timestamp norms, and cross-service reference contracts.", px="1.")
bl(doc, "Chanakya University UI Design System: Complete visual alignment across all eight modules utilizing the official Chanakya University color palette, typography hierarchy, and shared component primitives via a centralized Tailwind CSS and Shadcn UI monorepo package.", px="2.")

# Section 2: Database Table Design Strategy
hd(doc, "2. Database Table Design Strategy: Shared vs. Domain Tables")
bd(doc, "A fundamental question in distributed academic software architecture is whether all teams use the exact same database table design. In UniSphere, the architecture enforces an isolated Database-per-Service model governed by universal schema design conventions.")

hd(doc, "2.1 The Architectural Rule", 2)
bl(doc, "Do all teams use identical business tables? No. Each module possesses its own distinct functional tables tailored to its domain requirements (for instance, ExamShield defines questions and proctoring attempts, whereas EduHRMS defines faculty tenure and leave requests).", px="Functional Tables:")
bl(doc, "Do all teams adhere to the same schema conventions, base entity formats, and data types? Yes. Every team is strictly mandated to employ the identical database design patterns, naming conventions, primary key structures, and auditing strategies.", px="Schema Conventions:")

hd(doc, "2.2 Universal Database Design Mandates", 2)
bd(doc, "All teams must incorporate the following standards into their respective PostgreSQL 16 schemas without exception:")
tb(doc, ["Standard Element", "Mandated Specification", "Rationale and Enforcement"], [
    ["Primary Key Standard", "UUID PRIMARY KEY DEFAULT gen_random_uuid()", "Eliminates auto-increment ID conflicts, prevents sequential record enumeration attacks, and supports distributed record generation."],
    ["Audit Columns", "created_at TIMESTAMPTZ DEFAULT NOW()\nupdated_at TIMESTAMPTZ DEFAULT NOW()", "Guarantees universal temporal auditing across all tables. Timezone-aware ISO-8601 timestamps are required."],
    ["Canonical Identity Reference", "user_id UUID NOT NULL", "All user references store the canonical UUID emitted by the Central Auth Gateway. Teams must not invent alternative student/staff identifier structures."],
    ["Table Prefixing", "<module_prefix>_<entity_name> (e.g., hrms_*, attend_*, exam_*, track_*)", "Ensures namespace clarity, prevents schema collision during cross-team reporting, and simplifies audit logging."],
    ["Foreign References", "Logical references only across databases. Physical constraints strictly inside isolated database.", "Cross-database joins and physical cross-database foreign keys are strictly prohibited. Inter-module data retrieval occurs exclusively via Gateway REST APIs."],
    ["Soft-Deletion Standard", "is_active BOOLEAN DEFAULT TRUE / deleted_at TIMESTAMPTZ NULL", "Preserves audit history and compliance for institutional records, grades, and payroll transactions."]
], ws=[1.6, 2.6, 2.6])

hd(doc, "2.3 Database Instance Matrix", 2)
bd(doc, "Each team maintains an isolated Docker PostgreSQL container. Configuration strings (DATABASE_URL) point exclusively to the designated port:")
tb(doc, ["Team", "Module Domain", "Database Name", "Host Port", "Schema Prefix"], [
    ["Team 01", "Human Resource Management (EduHRMS)", "hrms_db", "5432", "hrms_*"],
    ["Team 02", "Smart Attendance (SmartAttend)", "attend_db", "5433", "attend_*"],
    ["Team 03", "AI Online Examination (ExamShield)", "exam_db", "5434", "exam_*"],
    ["Team 04", "Coding Arena & Practice (CodeArena)", "code_db", "5435", "code_*"],
    ["Team 05", "Online Presentation AI (PresentAI)", "pres_db", "5436", "pres_*"],
    ["Team 06", "Campus RAG Bot (CampusBot)", "bot_db", "5437", "bot_* (with pgvector)"],
    ["Team 07", "University Hub Repository (UniHub)", "hub_db", "5438", "hub_* (with pg_trgm)"],
    ["Team 08", "Project & Internship Track (TrackIt)", "track_db", "5439", "track_*"]
], ws=[0.8, 2.4, 1.2, 0.8, 1.6])

# Section 3: Chanakya University UI Design System
hd(doc, "3. Chanakya University Institutional UI Design System")
bd(doc, "To provide end-users (students, faculty, administrators, external examiners) with a seamless, polished, and unified portal experience, all eight modules must strictly conform to the Chanakya University Institutional Design System. Discrepant color themes, arbitrary fonts, or mismatched UI controls are strictly disallowed.")

hd(doc, "3.1 Official University Color Palette", 2)
bd(doc, "Extracted from the official Chanakya University visual identity (inspired by ancient Indian heritage, wisdom, and light), the master palette consists of the following calibrated color tokens:")
tb(doc, ["Palette Token", "Hex Code", "Tailwind Class Name", "Design Role and Usage"], [
    ["Chanakya Royal Navy", "#002561", "bg-cu-navy / text-cu-navy", "Primary institutional color. Used for header bars, main sidebar, active navigation items, primary CTA buttons, and high-emphasis titles."],
    ["Chanakya Terracotta Saffron", "#DB6C29", "bg-cu-saffron / text-cu-saffron", "Primary accent color. Used for interactive highlights, active badges, milestone indicators, submit buttons, and alert notices."],
    ["Chanakya Antique Gold", "#C69930", "bg-cu-gold / text-cu-gold", "Prestige and honours accent. Used for distinction tags, top rank badges, verified institutional seals, and highlight borders."],
    ["Chanakya Dark Slate", "#212529", "bg-cu-slate / text-cu-slate", "Primary typography color. Provides high-contrast readability (WCAG AAA) across all light canvas surfaces."],
    ["Chanakya Muted Gray", "#6C757D", "bg-cu-muted / text-cu-muted", "Secondary typography, form labels, placeholder text, and inactive tab states."],
    ["Chanakya Border Mist", "#DEE2E6", "border-cu-border", "Divider lines, card boundaries, table cell borders, and form input outlines."],
    ["Chanakya Light Canvas", "#F8F9FA", "bg-cu-canvas", "Primary page background canvas, dashboard background, and subtle hover states."],
    ["Chanakya Pure White", "#FFFFFF", "bg-white", "Card surfaces, modal dialogues, input field background, and dropdown menus."]
], ws=[1.6, 1.0, 1.8, 2.4])

hd(doc, "3.2 Typography Hierarchy", 2)
bd(doc, "The portal enforces a clean, dual-typeface typography standard reflecting academic authority and modern dashboard readability:")
tb(doc, ["Typography Role", "Font Family", "Fallback Fonts", "Usage Scope"], [
    ["Academic Serif (Headings)", "Merriweather", "Georgia, 'Times New Roman', serif", "Used for major section titles, modal headers, institution branding banner, report titles, and certificate headers."],
    ["Interface Sans-Serif (Body & UI)", "Inter", "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", "Used for all interface controls, buttons, form inputs, table data, navigation links, notifications, and body copy."],
    ["Monospace (Code & Logs)", "JetBrains Mono", "'Courier 10 Pitch', Consolas, monospace", "Used for CodeArena editor, sandbox logs, execution outputs, SQL queries, DDL displays, and API payload inspectors."]
], ws=[1.8, 1.6, 1.8, 1.6])

hd(doc, "3.3 UI Component Library and Layout Standard", 2)
bd(doc, "To prevent divergence, all teams consume UI components from the shared monorepo package `packages/ui` built on Tailwind CSS and Radix UI primitives (Shadcn UI pattern):")
bl(doc, "Universal Navigation Shell: A shared top navbar featuring the Chanakya University emblem, active academic year, notification center, and user profile drawer.", px="Navigation:")
bl(doc, "Three-Click Principle: Every key student/faculty workflow must be accessible within three clicks from the module dashboard.", px="Ergonomics:")
bl(doc, "Responsive Grid: Standard 12-column responsive layout with standardized gutters (padding-4 on mobile, padding-6 on desktop).", px="Layout:")
bl(doc, "Accessibility Compliance: All components must meet WCAG 2.1 AA contrast standards using the #002561 and #DB6C29 tokens against light canvas backgrounds.", px="Accessibility:")

# Section 4: Implementation and Enforcement in Monorepo
hd(doc, "4. Implementation Architecture in Turborepo")
bd(doc, "The monorepo structure guarantees that all teams inherit the unified database and UI design standards through shared internal packages:")
cb(doc, """unisphere-monorepo/
├── packages/
│   ├── ui/                    # Shared Chanakya University UI Component Library
│   │   ├── src/components/    # Button, Card, Table, Modal, Input, Badge, Sidebar
│   │   ├── tailwind.config.js # Mandated Chanakya University color & font presets
│   │   └── index.ts
│   ├── auth/                  # Unified JWT parsing & RBAC role verification
│   └── database-standards/   # Common Prisma base definitions, UUID helpers, audit models
├── apps/
│   ├── gateway/               # Central API Gateway (Port 4000)
│   ├── team01-hrms/           # Port 4001 -> hrms_db (5432)
│   ├── team02-attendance/     # Port 4002 -> attend_db (5433)
│   ├── team03-exams/          # Port 4003 -> exam_db (5434)
│   ├── team04-codearena/      # Port 4004 -> code_db (5435)
│   ├── team05-presentai/      # Port 4005 -> pres_db (5436)
│   ├── team06-campusbot/      # Port 4006 -> bot_db (5437)
│   ├── team07-unihub/         # Port 4007 -> hub_db (5438)
│   └── team08-trackit/        # Port 4008 -> track_db (5439)""")

hd(doc, "5. Conclusion and Governance")
bd(doc, "By enforcing identical database design conventions across isolated database instances and an identical Chanakya University visual design system across all frontend applications, the UniSphere portal ensures zero technical integration conflicts, clean parallel development, and a world-class institutional user experience upon final deployment.")

# Save document
out_path = os.path.join(BASE, "docs", "CHANAKYA_PORTAL_UI_AND_DATABASE_DESIGN_STANDARDS.docx")
doc.save(out_path)
print("Saved standards document to:", out_path)
