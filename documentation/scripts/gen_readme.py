from helpers import *
doc=nd()
doc.add_paragraph()
for tx,sz,bo,co in [("CHANAKYA UNIVERSITY",16,True,DARK),("Department of Computer Science and Applications",12,False,GRAY)]:
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run(tx)
    r.font.size=Pt(sz); r.font.bold=bo; r.font.color.rgb=co
doc.add_paragraph()
for tx,sz,bo,co in [("UniSphere Academic Portal",22,True,DARK),("Master Project Index and Team Directory",13,False,BLUE)]:
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run(tx)
    r.font.size=Pt(sz); r.font.bold=bo; r.font.color.rgb=co
doc.add_paragraph()
tb(doc,["Team","Module Name","Folder","Port","Database","DB Port"],[
    ["Team 01","EduHRMS -- Human Resource Management","team01_HRMS","4001","hrms_db","5432"],
    ["Team 02","SmartAttend -- Student Attendance","team02_SmartAttendance","4002","attend_db","5433"],
    ["Team 03","ExamShield -- Online Examination","team03_OnlineExams","4003","exam_db","5434"],
    ["Team 04","CodeArena -- Coding Practice","team04_CodeArena","4004","code_db","5435"],
    ["Team 05","PresentAI -- Online Presentation Evaluation","team05_PresentationAI","4005","pres_db","5436"],
    ["Team 06","CampusBot -- AI Campus Assistant","team06_CampusAIBot","4006","bot_db","5437"],
    ["Team 07","UniHub -- Research and Project Repository","team07_UniHub","4007","hub_db","5438"],
    ["Team 08","TrackIt -- Project and Internship Track","team08_ProjectInternshipTrack","4008","track_db","5439"],
],ws=[0.8,2.8,1.9,0.7,1.0,0.8])
hd(doc,"Database Isolation Strategy")
bd(doc,"Each team maintains its own isolated PostgreSQL database instance. The schema design is coordinated but instances are physically separate to prevent deployment conflicts during parallel development. Teams reference data from other modules exclusively through internal REST API calls via the Central API Gateway.")
tb(doc,["Rule","Description"],[
    ["No shared database servers","Each team's Docker Compose file specifies a unique PostgreSQL container name and host port."],
    ["No direct cross-DB queries","Cross-module data access is only permitted via internal HTTP API calls using the INTERNAL_GATEWAY_TOKEN."],
    ["Schema coordination","Teams must communicate any changes to their public API contract at least one sprint in advance."],
    ["Environment isolation","DATABASE_URL in each team's .env file points exclusively to their own database instance."],
    ["Integration testing","End-to-end tests run only in the shared staging environment, never against individual development databases."],
],ws=[2.0,5.0])
hd(doc,"Technology Stack Reference")
tb(doc,["Layer","Technology","Version"],[
    ["Frontend Framework","Next.js (App Router)","14.x"],
    ["UI Component Library","Shadcn UI and Radix Primitives","Latest"],
    ["Backend Framework","Express.js (Node.js)","4.x and Node 20 LTS"],
    ["ORM","Prisma","5.x"],
    ["Primary Database","PostgreSQL","16"],
    ["Cache and Queues","Redis and BullMQ","Redis 7 and BullMQ 5"],
    ["Container Runtime","Docker and Docker Compose","25.x"],
    ["Monorepo Manager","Turborepo and pnpm","Latest"],
    ["AI and LLM","Google Gemini API","gemini-1.5-pro"],
    ["Code Execution","Judge0 CE and gVisor","Latest"],
    ["Authentication","JWT (RS256) via packages/auth","Internal"],
    ["Object Storage","MinIO (S3-compatible)","Latest"],
    ["Source Control","Git, GitHub, and Gitea CE","Latest"],
    ["Language","TypeScript","5.x"],
],ws=[2.0,3.0,2.0])
hd(doc,"Integration Architecture")
bd(doc,"The Central API Gateway (port 4000) routes all incoming requests to the appropriate module service based on URL path prefix. Inter-module communication uses an INTERNAL_GATEWAY_TOKEN shared secret. No module may connect directly to another module's database. All public-facing APIs are served exclusively through the Gateway.")
tb(doc,["Module Dependency","Direction","Purpose"],[
    ["TrackIt to HRMS","Inbound","Fetch faculty domain expertise for guide assignment"],
    ["TrackIt to PresentAI","Inbound","Create viva presentation session for final evaluation"],
    ["TrackIt to UniHub","Inbound","Auto-create repository entry on project completion"],
    ["CampusBot to Attendance","Inbound","Fetch student attendance percentage on query"],
    ["CampusBot to Exams","Inbound","Fetch upcoming exam schedule on query"],
    ["CampusBot to TrackIt","Inbound","Fetch project deadlines and internship status on query"],
],ws=[2.0,1.0,4.0])
doc.save(os.path.join(BASE,"README.docx")); print("README.docx saved.")
