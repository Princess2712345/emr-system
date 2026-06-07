"""
Generates a PowerPoint pitch deck for the EMR System & MyHealth Portal
using ONLY the Python standard library (no python-pptx required).

A .pptx file is an Open Office XML package: a ZIP archive containing XML
parts. This script writes that package directly.

Run:  python build_deck.py
Out:  EMR_System_Pitch_Deck.pptx  (next to this script)
"""
import os
import zipfile

EMU = 914400  # EMUs per inch


def inch(v):
    return int(round(v * EMU))


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


# ---------------- Theme colors (hex, no #) ----------------
NAVY = "0B2A4A"
TEAL = "129E9E"
TEAL_DARK = "0E7C7C"
LIGHT = "F2F7FA"
WHITE = "FFFFFF"
GREY = "5B6B73"
DARK = "1B2B34"
ACCENT = "3EC6B6"
BORDER = "DDE6EA"

SLIDE_W = inch(13.333)
SLIDE_H = inch(7.5)


class Slide:
    def __init__(self, bg=None):
        self.shapes = []
        self._id = 1
        self.bg = bg

    def _nid(self):
        self._id += 1
        return self._id

    def rect(self, x, y, w, h, fill, line=None, prst="rect"):
        i = self._nid()
        if line is None:
            ln = '<a:ln><a:noFill/></a:ln>'
        else:
            ln = ('<a:ln w="12700"><a:solidFill><a:srgbClr val="%s"/>'
                  '</a:solidFill></a:ln>' % line)
        self.shapes.append(
            '<p:sp><p:nvSpPr><p:cNvPr id="%d" name="r%d"/><p:cNvSpPr/>'
            '<p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="%d" y="%d"/>'
            '<a:ext cx="%d" cy="%d"/></a:xfrm><a:prstGeom prst="%s">'
            '<a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="%s"/>'
            '</a:solidFill>%s</p:spPr><p:txBody><a:bodyPr/><a:lstStyle/>'
            '<a:p/></p:txBody></p:sp>'
            % (i, i, inch(x), inch(y), inch(w), inch(h), prst, fill, ln))

    def text(self, x, y, w, h, paras, anchor="t"):
        """paras: list of dicts:
        {algn:'l|ctr|r', after:pt, ls:float, runs:[(t,sz,bold,color)]}"""
        i = self._nid()
        body = []
        for p in paras:
            algn = p.get("algn", "l")
            after = p.get("after", 6)
            ls = p.get("ls", 1.0)
            ppr = ('<a:pPr algn="%s"><a:lnSpc><a:spcPct val="%d"/></a:lnSpc>'
                   '<a:spcAft><a:spcPts val="%d"/></a:spcAft></a:pPr>'
                   % (algn, int(ls * 100000), int(after * 100)))
            runs = []
            for (t, sz, bold, color) in p["runs"]:
                runs.append(
                    '<a:r><a:rPr lang="en-US" sz="%d" b="%d"><a:solidFill>'
                    '<a:srgbClr val="%s"/></a:solidFill>'
                    '<a:latin typeface="Segoe UI"/></a:rPr><a:t>%s</a:t></a:r>'
                    % (int(sz * 100), 1 if bold else 0, color, esc(t)))
            body.append("<a:p>" + ppr + "".join(runs) + "</a:p>")
        self.shapes.append(
            '<p:sp><p:nvSpPr><p:cNvPr id="%d" name="t%d"/>'
            '<p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr>'
            '<a:xfrm><a:off x="%d" y="%d"/><a:ext cx="%d" cy="%d"/></a:xfrm>'
            '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/>'
            '<a:ln><a:noFill/></a:ln></p:spPr><p:txBody>'
            '<a:bodyPr wrap="square" anchor="%s" lIns="45720" tIns="18000" '
            'rIns="45720" bIns="18000"/><a:lstStyle/>%s</p:txBody></p:sp>'
            % (i, i, inch(x), inch(y), inch(w), inch(h), anchor,
               "".join(body)))

    def bullets(self, x, y, w, h, items, size=12.5, color=DARK, gap=6,
                bcolor=TEAL):
        paras = []
        for it in items:
            runs = [("\u25CF  ", size - 4, False, bcolor)]
            if isinstance(it, tuple):
                runs.append((it[0], size, True, color))
                runs.append((it[1], size, False, color))
            else:
                runs.append((it, size, False, color))
            paras.append({"algn": "l", "after": gap, "ls": 1.05,
                          "runs": runs})
        self.text(x, y, w, h, paras, anchor="t")

    def xml(self):
        bg = ""
        return (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
            'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
            '<p:cSld>%s<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/>'
            '<p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm>'
            '<a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/>'
            '<a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>%s</p:spTree>'
            '</p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>'
            % (bg, "".join(self.shapes)))


# ---------------- shared helpers ----------------
def header(s, kicker, title):
    s.rect(0, 0, 13.333, 1.35, NAVY)
    s.rect(0, 1.35, 13.333, 0.06, TEAL)
    s.text(0.6, 0.18, 12, 0.4,
           [{"runs": [(kicker.upper(), 12, True, ACCENT)]}])
    s.text(0.6, 0.52, 12, 0.75,
           [{"runs": [(title, 26, True, WHITE)]}])


def footer(s, n):
    s.text(0.6, 7.05, 8, 0.3,
           [{"runs": [("EMR System  \u2022  MyHealth Portal", 9, False, GREY)]}])
    s.text(12.0, 7.05, 0.9, 0.3,
           [{"algn": "r", "runs": [(str(n), 9, True, GREY)]}])


def card(s, x, y, w, h, title, items, accent=TEAL):
    s.rect(x, y, w, h, WHITE, line=BORDER)
    s.rect(x, y, 0.12, h, accent)
    s.text(x + 0.32, y + 0.16, w - 0.5, 0.5,
           [{"runs": [(title, 15, True, NAVY)]}])
    s.bullets(x + 0.32, y + 0.66, w - 0.55, h - 0.8, items, size=12.5, gap=6)


slides = []


def add(s):
    slides.append(s)


# ============ SLIDE 1 — Title ============
s = Slide()
s.rect(0, 0, 13.333, 7.5, NAVY)
s.rect(0, 0, 0.25, 7.5, TEAL)
s.rect(8.4, 0, 4.93, 7.5, TEAL_DARK)
s.rect(8.15, 0, 0.25, 7.5, ACCENT)
s.rect(10.45, 2.7, 0.85, 2.1, WHITE)   # cross vertical
s.rect(9.78, 3.38, 2.2, 0.75, WHITE)   # cross horizontal
s.text(0.8, 2.05, 7.4, 0.5,
       [{"runs": [("HEALTHCARE  \u2022  DIGITAL RECORDS PLATFORM", 13, True, ACCENT)]}])
s.text(0.8, 2.55, 7.4, 2.0,
       [{"ls": 0.98, "runs": [("EMR System &", 44, True, WHITE)]},
        {"ls": 0.98, "runs": [("MyHealth Portal", 44, True, WHITE)]}])
s.text(0.8, 4.7, 7.0, 0.9,
       [{"runs": [("Digitizing the full clinic care loop \u2014 from registration to billing.",
                   16, False, "C8DDE8")]}])
s.text(0.8, 6.45, 7.0, 0.6,
       [{"runs": [("Built on Nuxt 4  \u2022  Vue 3  \u2022  PostgreSQL  \u2022  Prisma",
                   12, True, ACCENT)]}])
add(s)

# ============ SLIDE 2 — Problem ============
s = Slide()
header(s, "The Problem", "Clinics are still stuck on paper and phone calls")
s.text(0.6, 1.65, 12, 0.6,
       [{"runs": [("Manual, fragmented operations slow down care and create costly errors.",
                   16, False, GREY)]}])
problems = [
    ("Paper-based records", " are easy to lose, hard to search, and impossible to audit."),
    ("Manual billing", " leads to disputes, lost revenue, and slow collections."),
    ("Phone-based communication", " between staff and patients wastes hours every day."),
    ("No real-time visibility", " into appointments, lab results, or inventory."),
]
for i, (h, t) in enumerate(problems):
    yy = 2.45 + i * 1.05
    s.rect(0.6, yy, 0.55, 0.85, LIGHT)
    s.text(0.6, yy, 0.55, 0.85,
           [{"algn": "ctr", "runs": [(str(i + 1), 22, True, TEAL)]}], anchor="ctr")
    s.text(1.35, yy, 11, 0.85,
           [{"runs": [(h, 16, True, NAVY), (t, 15, False, GREY)]}], anchor="ctr")
footer(s, 2)
add(s)

# ============ SLIDE 3 — Solution ============
s = Slide()
header(s, "The Solution", "One platform. Two portals. Complete care loop.")
s.text(0.6, 1.65, 12.1, 0.7,
       [{"runs": [("A unified Electronic Medical Records platform with dedicated experiences "
                   "for staff and patients, sharing one secure database.", 15, False, GREY)]}])
card(s, 0.6, 2.65, 5.9, 3.85, "EMR System  \u2014  for Staff",
     ["Operations dashboard with live KPIs",
      "Registration, appointments & dispositions",
      "Lab uploads, billing & refill approvals",
      "Inventory, analytics & audit history"], accent=TEAL)
card(s, 6.85, 2.65, 5.9, 3.85, "MyHealth Portal  \u2014  for Patients",
     ["Personal health dashboard & vitals",
      "Book appointments & view lab results",
      "Pay bills with payment-proof upload",
      "Request medication refills & alerts"], accent=ACCENT)
footer(s, 3)
add(s)

# ============ SLIDE 4 — Target users ============
s = Slide()
header(s, "Market", "Who it's for")
targets = [
    ("Small & mid-size clinics", "Replace paper charts with a modern, affordable system."),
    ("Outpatient facilities", "Streamline registration, scheduling, and billing."),
    ("Hospital departments", "Coordinate labs, dispositions, and inventory in one place."),
]
for i, (h, t) in enumerate(targets):
    x = 0.6 + i * 4.12
    s.rect(x, 2.1, 3.85, 3.4, WHITE, line=BORDER)
    s.rect(x, 2.1, 3.85, 0.9, TEAL)
    s.text(x, 2.1, 3.85, 0.9, [{"algn": "ctr", "runs": [(h, 16, True, WHITE)]}],
           anchor="ctr")
    s.text(x + 0.3, 3.25, 3.25, 2.0, [{"runs": [(t, 14, False, GREY)]}])
s.text(0.6, 5.95, 12, 0.7,
       [{"runs": [("Localized for the Philippine market \u2014 currency, workflows, "
                   "and ID formats (MRN / Staff #) built in.", 14, True, NAVY)]}])
footer(s, 4)
add(s)

# ============ SLIDE 5 — Architecture ============
s = Slide()
header(s, "Architecture", "How it works")
layers = [
    ("Frontend", "Nuxt 4 + Vue 3, role-based dual-portal UI", TEAL),
    ("Server API", "Nitro server routes handle auth & business logic", TEAL_DARK),
    ("ORM", "Prisma 6 maps clean, type-safe data models", NAVY),
    ("Database", "PostgreSQL stores patients, records & audit logs", DARK),
]
for i, (h, t, c) in enumerate(layers):
    yy = 2.05 + i * 1.12
    s.rect(0.9, yy, 3.2, 0.9, c)
    s.text(0.9, yy, 3.2, 0.9, [{"algn": "ctr", "runs": [(h, 17, True, WHITE)]}],
           anchor="ctr")
    s.text(4.4, yy, 8.4, 0.9, [{"runs": [(t, 15, False, GREY)]}], anchor="ctr")
    if i < len(layers) - 1:
        s.rect(2.35, yy + 0.9, 0.1, 0.22, ACCENT)
footer(s, 5)
add(s)

# ============ SLIDE 6 — Staff features ============
s = Slide()
header(s, "Features", "EMR System \u2014 staff capabilities")
feats = [
    ("Dashboard KPIs", "patients, appointments, pending labs, unpaid invoices"),
    ("Patient registration", "auto-generated MRN & full clinical profiles"),
    ("Appointments", "schedule and assign to doctors / staff"),
    ("Lab results", "upload, interpret, and track status"),
    ("Billing", "itemized invoices with payment-proof review"),
    ("Pharmacy refills", "review and approve patient requests"),
    ("Dispositions", "record clinical outcomes & discharge"),
    ("Inventory", "track medical supplies and pricing"),
    ("Analytics", "revenue and operational metrics"),
]
cols, cw, ch, gx, gy = 3, 3.95, 1.4, 0.25, 0.2
for i, (h, t) in enumerate(feats):
    r, c = divmod(i, cols)
    x = 0.6 + c * (cw + gx)
    yy = 1.85 + r * (ch + gy)
    s.rect(x, yy, cw, ch, WHITE, line=BORDER)
    s.rect(x, yy, cw, 0.08, TEAL)
    s.text(x + 0.25, yy + 0.16, cw - 0.4, 0.45, [{"runs": [(h, 14.5, True, NAVY)]}])
    s.text(x + 0.25, yy + 0.64, cw - 0.4, 0.7, [{"runs": [(t, 11.5, False, GREY)]}])
footer(s, 6)
add(s)

# ============ SLIDE 7 — Patient features ============
s = Slide()
header(s, "Features", "MyHealth Portal \u2014 patient self-service")
feats = [
    ("Health dashboard", "vitals snapshot & next appointment"),
    ("Appointments", "book and manage visits online"),
    ("Lab results", "secure access to health records"),
    ("Billing & payments", "view invoices, submit payment proof"),
    ("Medication refills", "request refills in a few taps"),
    ("Profile management", "allergies, emergency contact, insurance"),
    ("Notifications", "real-time alerts via notification bell"),
    ("E-Record download", "export personal medical record"),
]
cols, cw, ch, gx, gy = 2, 6.0, 1.1, 0.25, 0.22
for i, (h, t) in enumerate(feats):
    r, c = divmod(i, cols)
    x = 0.6 + c * (cw + gx)
    yy = 1.85 + r * (ch + gy)
    s.rect(x, yy, cw, ch, WHITE, line=BORDER)
    s.rect(x, yy, 0.1, ch, ACCENT)
    s.text(x + 0.3, yy + 0.12, cw - 0.5, 0.45, [{"runs": [(h, 14.5, True, NAVY)]}])
    s.text(x + 0.3, yy + 0.55, cw - 0.5, 0.5, [{"runs": [(t, 11.5, False, GREY)]}])
footer(s, 7)
add(s)

# ============ SLIDE 8 — Differentiators ============
s = Slide()
header(s, "Why us", "What sets it apart")
diffs = [
    ("Dual-portal design", "Purpose-built UX for staff and patients on one shared system."),
    ("MRN / Staff ID system", "Auto-generated sequential identifiers (MRN-YYYY-######)."),
    ("Payment-proof workflow", "Patients upload proof; admins review and approve."),
    ("Audit-driven notifications", "Every key action is logged and surfaced as an alert."),
    ("Operational analytics", "Revenue and activity metrics out of the box."),
    ("Modern full-stack", "Fast, maintainable Nuxt + PostgreSQL foundation."),
]
cols, cw, ch, gx, gy = 2, 6.0, 1.45, 0.25, 0.2
for i, (h, t) in enumerate(diffs):
    r, c = divmod(i, cols)
    x = 0.6 + c * (cw + gx)
    yy = 1.85 + r * (ch + gy)
    s.rect(x, yy, cw, ch, LIGHT)
    s.text(x + 0.3, yy + 0.18, cw - 0.5, 0.5,
           [{"runs": [("\u2713  " + h, 16, True, TEAL_DARK)]}])
    s.text(x + 0.3, yy + 0.68, cw - 0.5, 0.65, [{"runs": [(t, 13, False, GREY)]}])
footer(s, 8)
add(s)

# ============ SLIDE 9 — Demo walkthrough ============
s = Slide()
header(s, "Demo", "A guided walkthrough")
steps = [
    ("1", "Login", "Role toggle: staff sign in with Staff #, patients with MRN."),
    ("2", "Staff dashboard", "Live KPIs, recent labs, and quick actions."),
    ("3", "Register a patient", "Auto-assigned MRN and clinical profile."),
    ("4", "Patient portal", "Patient books an appointment & views lab results."),
    ("5", "Billing loop", "Patient submits payment proof; admin approves."),
]
for i, (n, h, t) in enumerate(steps):
    yy = 1.95 + i * 0.95
    s.rect(0.7, yy, 0.7, 0.7, TEAL, prst="ellipse")
    s.text(0.7, yy, 0.7, 0.7, [{"algn": "ctr", "runs": [(n, 20, True, WHITE)]}],
           anchor="ctr")
    s.text(1.65, yy, 11, 0.7,
           [{"runs": [(h + "  \u2014  ", 16, True, NAVY), (t, 14, False, GREY)]}],
           anchor="ctr")
s.text(0.7, 6.8, 12, 0.4,
       [{"runs": [("Tip: replace this slide with live screenshots of your app (localhost:3000).",
                   11, False, GREY)]}])
footer(s, 9)
add(s)

# ============ SLIDE 10 — Tech & security ============
s = Slide()
header(s, "Trust", "Technology & security")
card(s, 0.6, 1.85, 5.9, 4.45, "Tech stack",
     ["Nuxt 4 + Vue 3 + Vue Router",
      "Nitro server API routes",
      "PostgreSQL database",
      "Prisma 6 ORM (type-safe models)",
      "Icons via Lucide & MDI",
      "TypeScript throughout"], accent=TEAL)
card(s, 6.85, 1.85, 5.9, 4.45, "Security & integrity",
     ["bcrypt password hashing",
      "Role-based route protection (5 roles)",
      "MRN / Staff # identity validation",
      "Full audit log of key actions",
      "Separated patient vs staff access",
      "Roadmap: JWT / session hardening"], accent=ACCENT)
footer(s, 10)
add(s)

# ============ SLIDE 11 — Roadmap ============
s = Slide()
header(s, "Roadmap", "Where we're going")
phases = [
    ("Now", ["Dual portals live", "Billing & refills", "Analytics & audit"], TEAL),
    ("Next", ["Session / JWT hardening", "Role-based dashboards", "Email / SMS alerts"], TEAL_DARK),
    ("Later", ["Telemedicine visits", "Insurance integration", "Mobile app"], NAVY),
]
for i, (h, items, c) in enumerate(phases):
    x = 0.6 + i * 4.12
    s.rect(x, 2.0, 3.85, 0.85, c)
    s.text(x, 2.0, 3.85, 0.85, [{"algn": "ctr", "runs": [(h, 18, True, WHITE)]}],
           anchor="ctr")
    s.rect(x, 2.85, 3.85, 3.4, WHITE, line=BORDER)
    s.bullets(x + 0.35, 3.15, 3.2, 3.0, items, size=14, gap=12, bcolor=c)
footer(s, 11)
add(s)

# ============ SLIDE 12 — Closing ============
s = Slide()
s.rect(0, 0, 13.333, 7.5, NAVY)
s.rect(0, 0, 13.333, 0.18, TEAL)
s.rect(0, 7.32, 13.333, 0.18, TEAL)
s.text(1.0, 2.4, 11.3, 1.0,
       [{"algn": "ctr", "runs": [("Bring your clinic online.", 40, True, WHITE)]}])
s.text(1.5, 3.6, 10.3, 0.9,
       [{"algn": "ctr",
         "runs": [("A complete EMR + patient portal covering registration, appointments, "
                   "labs, billing, and pharmacy \u2014 in one modern platform.",
                   16, False, "C8DDE8")]}])
s.text(1.0, 5.1, 11.3, 0.6,
       [{"algn": "ctr", "runs": [("Let's schedule a pilot.", 20, True, ACCENT)]}])
s.text(1.0, 5.8, 11.3, 0.5,
       [{"algn": "ctr",
         "runs": [("Demo  \u2022  localhost:3000        Stack  \u2022  Nuxt + PostgreSQL",
                   12, False, GREY)]}])
add(s)


# ====================================================================
# Package assembly (OOXML parts)
# ====================================================================
N = len(slides)

CT = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
      '<Default Extension="xml" ContentType="application/xml"/>',
      '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>',
      '<Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>',
      '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>',
      '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>',
      '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>']
for i in range(1, N + 1):
    CT.append('<Override PartName="/ppt/slides/slide%d.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>' % i)
CT.append('</Types>')
content_types = "".join(CT)

root_rels = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>'
    '</Relationships>')

# presentation.xml.rels: rId1=master, rId2..=slides, last=presProps
pres_rels = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
             '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
             '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>']
for i in range(1, N + 1):
    pres_rels.append('<Relationship Id="rId%d" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide%d.xml"/>' % (i + 1, i))
pres_rels.append('<Relationship Id="rId%d" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/>' % (N + 2))
pres_rels.append('</Relationships>')
pres_rels = "".join(pres_rels)

sld_ids = "".join('<p:sldId id="%d" r:id="rId%d"/>' % (256 + i, i + 2) for i in range(N))
presentation = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
    'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" saveSubsetFonts="1">'
    '<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>'
    '<p:sldIdLst>' + sld_ids + '</p:sldIdLst>'
    '<p:sldSz cx="%d" cy="%d" type="screen16x9"/>'
    '<p:notesSz cx="6858000" cy="9144000"/></p:presentation>' % (SLIDE_W, SLIDE_H))

pres_props = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<p:presentationPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
    'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>')

# ---- theme ----
theme = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office">'
    '<a:themeElements><a:clrScheme name="Office">'
    '<a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>'
    '<a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>'
    '<a:dk2><a:srgbClr val="0B2A4A"/></a:dk2>'
    '<a:lt2><a:srgbClr val="F2F7FA"/></a:lt2>'
    '<a:accent1><a:srgbClr val="129E9E"/></a:accent1>'
    '<a:accent2><a:srgbClr val="3EC6B6"/></a:accent2>'
    '<a:accent3><a:srgbClr val="0E7C7C"/></a:accent3>'
    '<a:accent4><a:srgbClr val="5B6B73"/></a:accent4>'
    '<a:accent5><a:srgbClr val="1B2B34"/></a:accent5>'
    '<a:accent6><a:srgbClr val="C8DDE8"/></a:accent6>'
    '<a:hlink><a:srgbClr val="129E9E"/></a:hlink>'
    '<a:folHlink><a:srgbClr val="0E7C7C"/></a:folHlink></a:clrScheme>'
    '<a:fontScheme name="Office">'
    '<a:majorFont><a:latin typeface="Segoe UI"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>'
    '<a:minorFont><a:latin typeface="Segoe UI"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>'
    '<a:fmtScheme name="Office">'
    '<a:fillStyleLst>'
    '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'
    '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'
    '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>'
    '<a:lnStyleLst>'
    '<a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>'
    '<a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>'
    '<a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>'
    '<a:effectStyleLst>'
    '<a:effectStyle><a:effectLst/></a:effectStyle>'
    '<a:effectStyle><a:effectLst/></a:effectStyle>'
    '<a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>'
    '<a:bgFillStyleLst>'
    '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'
    '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'
    '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>'
    '</a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>')

# ---- slide master ----
slide_master = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
    'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
    '<p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>'
    '<a:effectLst/></p:bgPr></p:bg><p:spTree>'
    '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
    '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
    '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
    '</p:spTree></p:cSld>'
    '<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" '
    'accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" '
    'accent6="accent6" hlink="hlink" folHlink="folHlink"/>'
    '<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>'
    '<p:txStyles>'
    '<p:titleStyle><a:lvl1pPr><a:defRPr sz="2800"><a:latin typeface="Segoe UI"/></a:defRPr></a:lvl1pPr></p:titleStyle>'
    '<p:bodyStyle><a:lvl1pPr><a:defRPr sz="1400"><a:latin typeface="Segoe UI"/></a:defRPr></a:lvl1pPr></p:bodyStyle>'
    '<p:otherStyle><a:lvl1pPr><a:defRPr sz="1400"><a:latin typeface="Segoe UI"/></a:defRPr></a:lvl1pPr></p:otherStyle>'
    '</p:txStyles></p:sldMaster>')

master_rels = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>'
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>'
    '</Relationships>')

slide_layout = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
    'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" '
    'type="blank" preserve="1"><p:cSld name="Blank"><p:spTree>'
    '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
    '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
    '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
    '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>')

layout_rels = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>'
    '</Relationships>')

slide_rels_xml = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>'
    '</Relationships>')

out = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "EMR_System_Pitch_Deck.pptx")
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", content_types)
    z.writestr("_rels/.rels", root_rels)
    z.writestr("ppt/presentation.xml", presentation)
    z.writestr("ppt/_rels/presentation.xml.rels", pres_rels)
    z.writestr("ppt/presProps.xml", pres_props)
    z.writestr("ppt/theme/theme1.xml", theme)
    z.writestr("ppt/slideMasters/slideMaster1.xml", slide_master)
    z.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", master_rels)
    z.writestr("ppt/slideLayouts/slideLayout1.xml", slide_layout)
    z.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", layout_rels)
    for i, sl in enumerate(slides, start=1):
        z.writestr("ppt/slides/slide%d.xml" % i, sl.xml())
        z.writestr("ppt/slides/_rels/slide%d.xml.rels" % i, slide_rels_xml)

print("Saved:", out)
print("Slides:", N)
