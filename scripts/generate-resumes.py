#!/usr/bin/env python3
"""Generate branded one-page and detailed DOCX/PDF resumes from career.json."""

from __future__ import annotations

import argparse
from datetime import datetime
from html import escape
import json
import math
import re
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, PageBreak
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
FONT = "Inter"


def theme_color(name: str) -> str:
    """Resolve the site's light Untitled UI tokens; convert OKLCH to sRGB for print."""
    upstream = (ROOT / "node_modules/tailwindcss/theme.css").read_text(encoding="utf-8")
    theme = (ROOT / "src/styles/theme.css").read_text(encoding="utf-8").split(".dark-mode")[0]
    tokens = {}
    for source in (upstream, theme):
        # First occurrence is the light theme; later dark overrides are excluded.
        local = {}
        for key, value in re.findall(r"(--[\w-]+):\s*([^;]+);", source):
            local.setdefault(key, value.strip())
        tokens.update(local)
    value = tokens[name]
    visited = {name}
    while value.startswith("var("):
        key = value[4:-1]
        if key in visited:
            raise ValueError(f"Cyclic theme token: {key}")
        visited.add(key)
        value = tokens[key]
    if value.startswith("rgb("):
        channels = [round(float(v)) for v in value[4:-1].split()]
    elif value.startswith("oklch("):
        light, chroma, hue = value[6:-1].split()
        light, chroma, hue = float(light.rstrip("%")) / 100, float(chroma), math.radians(float(hue) if hue != "none" else 0)
        a, b = chroma * math.cos(hue), chroma * math.sin(hue)
        l, m, s = (light + .3963377774*a + .2158037573*b)**3, (light - .1055613458*a - .0638541728*b)**3, (light - .0894841775*a - 1.291485548*b)**3
        linear = [4.0767416621*l - 3.3077115913*m + .2309699292*s, -1.2684380046*l + 2.6097574011*m - .3413193965*s, -.0041960863*l - .7034186147*m + 1.707614701*s]
        channels = [round(255 * max(0, min(1, 12.92*c if c <= .0031308 else 1.055*c**(1/2.4)-.055))) for c in linear]
    else:
        raise ValueError(f"Unsupported print color: {value}")
    return "".join(f"{c:02X}" for c in channels)


INK = theme_color("--color-text-primary")
MUTED = theme_color("--color-text-tertiary")
BLUE = theme_color("--color-text-brand-secondary")
for face, filename in [("Inter", "Inter-Regular.ttf"), ("Inter-SemiBold", "Inter-SemiBold.ttf")]:
    pdfmetrics.registerFont(TTFont(face, str(ROOT / "assets/fonts" / filename)))
pdfmetrics.registerFontFamily("Inter", normal="Inter", bold="Inter-SemiBold", italic="Inter", boldItalic="Inter-SemiBold")


def load_profile(source: Path) -> dict:
    records = json.loads(source.read_text(encoding="utf-8"))
    if not records or records[0].get("id") != "profile":
        raise ValueError("career.json must contain the canonical profile record")
    return records[0]


def style_run(run, size=9, color=INK, bold=False, italic=False):
    run.font.name = FONT
    run._element.rPr.rFonts.set(qn("w:ascii"), FONT)
    run._element.rPr.rFonts.set(qn("w:hAnsi"), FONT)
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    run.bold = bold
    run.italic = italic
    return run


def configure_doc(document: Document, compact: bool):
    section = document.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    margin = 0.62
    section.top_margin = Inches(margin)
    section.bottom_margin = Inches(margin)
    section.left_margin = Inches(margin)
    section.right_margin = Inches(margin)
    section.header_distance = Inches(0.25)
    section.footer_distance = Inches(0.25)
    styles = document.styles
    normal = styles["Normal"]
    normal.font.name = FONT
    normal._element.rPr.rFonts.set(qn("w:ascii"), FONT)
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), FONT)
    normal.font.size = Pt(10 if compact else 9.4)
    normal.font.color.rgb = RGBColor.from_string(INK)
    normal.paragraph_format.space_after = Pt(2.4 if compact else 4.5)
    normal.paragraph_format.line_spacing = 1.04 if compact else 1.12


def add_header(document: Document, profile: dict, compact: bool):
    p = document.add_paragraph(style="Title")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(1)
    style_run(p.add_run(profile["name"]), 24 if compact else 23, INK, True)
    p = document.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(3 if compact else 5)
    style_run(p.add_run(profile["headline"]), 9 if compact else 11, BLUE, True)
    contact = f'{profile["location"]}  |  mohamedmoheyeldin.com  |  mohamedmoheyeldin.jobs@gmail.com  |  linkedin.com/in/moheyeldin  |  github.com/mohamedmoheyeldin'
    p = document.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_after = Pt(4 if compact else 8)
    style_run(p.add_run(contact), 8 if compact else 8, MUTED)


def add_section_heading(document: Document, black: str, accent: str, compact: bool):
    p = document.add_paragraph()
    p.paragraph_format.space_before = Pt(4 if compact else 10)
    p.paragraph_format.space_after = Pt(2 if compact else 4)
    p.paragraph_format.keep_with_next = True
    style_run(p.add_run(black + " " + accent), 11 if compact else 12, BLUE, True)


def add_body(document: Document, text: str, compact: bool, italic=False):
    p = document.add_paragraph()
    p.paragraph_format.space_after = Pt(2.2 if compact else 5)
    p.paragraph_format.line_spacing = 1.02 if compact else 1.12
    style_run(p.add_run(text), 9.5 if compact else 9.2, MUTED if italic else INK, italic=italic)
    return p


def add_bullet(document: Document, text: str, compact: bool):
    p = document.add_paragraph(style="List Bullet")
    p.paragraph_format.left_indent = Inches(0.16 if compact else 0.22)
    p.paragraph_format.first_line_indent = Inches(-0.12)
    p.paragraph_format.space_after = Pt(1.2 if compact else 3.2)
    p.paragraph_format.line_spacing = 1.0 if compact else 1.08
    style_run(p.add_run(text), 9.2 if compact else 9)


def readable_date(value):
    return "Present" if value is None else datetime.strptime(value, "%Y-%m").strftime("%b %Y")


def credential_date(value: str) -> str:
    return datetime.strptime(value, "%Y-%m-%d").strftime("%B %d, %Y").replace(" 0", " ")


def professional_development(profile: dict, compact: bool) -> list[list[tuple[str, str | None]]]:
    """Keep evidence links with their labels and group repeated print metadata."""
    verified = profile.get("verifiedCredentials", [])
    lines = []
    groups = {}
    for credential in verified:
        groups.setdefault((credential["issuer"], credential["issuedOn"], credential.get("expiresOn")), []).append(credential)
    for (issuer, issued_on, expires_on), credentials in groups.items():
        metadata = f'{issuer} | Issued {credential_date(issued_on)}'
        if expires_on:
            metadata += f' | Expires {credential_date(expires_on)}'
        parts = [(metadata + ": ", None)]
        for index, credential in enumerate(credentials):
            if index:
                parts.append(("; ", None))
            parts.append((credential["name"], credential["href"]))
        lines.append(parts)
    if not compact:
        lines.extend([[(credential, None)] for credential in profile["credentials"]])
    return lines


def add_credential_docx(document: Document, parts: list[tuple[str, str | None]], compact: bool):
    paragraph = add_body(document, "", compact)
    for text, href in parts:
        run = style_run(paragraph.add_run(text), 9.5 if compact else 9.2, BLUE if href else INK)
        if href:
            hyperlink = OxmlElement("w:hyperlink")
            hyperlink.set(qn("r:id"), paragraph.part.relate_to(href, RT.HYPERLINK, is_external=True))
            hyperlink.append(run._element)
            paragraph._p.append(hyperlink)


def credential_pdf(parts: list[tuple[str, str | None]]) -> str:
    return "".join(
        f'<link href="{escape(href, quote=True)}" color="#{BLUE}">{escape(text)}</link>'
        if href else escape(text)
        for text, href in parts
    )


def credential_text(parts: list[tuple[str, str | None]], markdown: bool) -> str:
    return "".join(
        (f'[{text}]({href})' if markdown else f'{text} ({href})') if href else text
        for text, href in parts
    )


def add_role(document: Document, role: dict, compact: bool, highlights: list[str]):
    p = document.add_paragraph()
    p.paragraph_format.space_before = Pt(2.8 if compact else 7)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.keep_with_next = True
    title = role.get("professionalTitle") or role["title"]
    style_run(p.add_run(f'{role["employer"]} — {role["location"]}'), 10, INK, True)
    p = document.add_paragraph()
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.space_after = Pt(1)
    style_run(p.add_run(title), 9.5, INK, True)
    date_end = "Present" if role["end"] is None else role["end"]
    style_run(p.add_run(f'  |  {readable_date(role["start"])} – {readable_date(role["end"])}'), 7 if compact else 8.3, MUTED)
    if role.get("customer"):
        add_body(document, "Customer: " + role["customer"], compact)
    if not compact:
        add_body(document, role["summary"], compact=False, italic=True)
    for item in highlights:
        add_bullet(document, item, compact)


def add_footer(document: Document, label: str):
    for section in document.sections:
        p = section.footer.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        style_run(p.add_run(f"{label} | mohamedmoheyeldin.com"), 7.2, MUTED)


def build_docx(profile: dict, output: Path, compact: bool):
    doc = Document()
    configure_doc(doc, compact)
    add_header(doc, profile, compact)
    add_section_heading(doc, "Professional", "profile", compact)
    add_body(doc, profile["summary"] if compact else "\n\n".join(profile["detailedSummary"]), compact)
    add_section_heading(doc, "Professional", "experience", compact)
    for index, role in enumerate(profile["experience"]):
        if not compact and index == 1:
            doc.add_page_break()
            add_section_heading(doc, "Professional experience", "continued", False)
        add_role(doc, role, compact, role["compactHighlights"] if compact else role["highlights"])
    project = next(p for p in profile["projects"] if p["slug"] == "portfolio-career-content-system")
    add_section_heading(doc, "Selected", "project", compact)
    add_body(doc, project["name"] + ": " + project["resumeSummary"] + " mohamedmoheyeldin.com", compact)
    add_section_heading(doc, "Technical", "skills", compact)
    for group in profile["skillGroups"]:
        add_body(doc, f'{group["label"]}: {", ".join(group["items"])}', compact)
    add_section_heading(doc, "Education", "", compact)
    education = profile["education"][0]
    add_body(doc, f'{education["credential"]} in {education["field"]} | {education["institution"]} | May 2014', compact)
    if not compact or profile.get("verifiedCredentials"):
        add_section_heading(doc, "Professional", "development", compact)
        for parts in professional_development(profile, compact):
            add_credential_docx(doc, parts, compact)
    add_footer(doc, "One-page resume" if compact else "Detailed resume")
    doc.core_properties.title = f'{profile["name"]} - {"One-page" if compact else "Detailed"} Resume'
    doc.core_properties.subject = profile["headline"]
    doc.core_properties.comments = ""
    doc.core_properties.author = profile["name"]
    doc.save(output)


def pdf_styles(compact: bool):
    base = getSampleStyleSheet()
    body_size = 9.2 if compact else 9.1
    return {
        "name": ParagraphStyle("Name", parent=base["Normal"], fontName="Inter-SemiBold", fontSize=24 if compact else 23, leading=29 if compact else 26, textColor=HexColor("#" + INK), alignment=TA_CENTER, spaceAfter=2),
        "title": ParagraphStyle("Title", parent=base["Normal"], fontName="Inter-SemiBold", fontSize=9 if compact else 11, leading=11 if compact else 13, textColor=HexColor("#" + BLUE), alignment=TA_CENTER, spaceAfter=3),
        "contact": ParagraphStyle("Contact", parent=base["Normal"], fontName="Inter", fontSize=8, leading=10, textColor=HexColor("#" + MUTED), alignment=TA_LEFT, spaceAfter=5),
        "section": ParagraphStyle("Section", parent=base["Normal"], fontName="Inter-SemiBold", fontSize=11 if compact else 12, leading=14 if compact else 15, textColor=HexColor("#" + INK), spaceBefore=7 if compact else 10, spaceAfter=2 if compact else 4, keepWithNext=True),
        "body": ParagraphStyle("Body", parent=base["Normal"], fontName="Inter", fontSize=body_size, leading=12.5 if compact else 11.2, textColor=HexColor("#" + INK), spaceAfter=2 if compact else 4),
        "muted": ParagraphStyle("Muted", parent=base["Normal"], fontName="Inter", fontSize=body_size, leading=12.5 if compact else 11.2, textColor=HexColor("#" + MUTED), spaceAfter=2 if compact else 4),
        "role": ParagraphStyle("Role", parent=base["Normal"], fontName="Inter-SemiBold", fontSize=10 if compact else 10, leading=12, textColor=HexColor("#" + INK), spaceBefore=2 if compact else 7, spaceAfter=1, keepWithNext=True),
        "bullet": ParagraphStyle("Bullet", parent=base["Normal"], fontName="Inter", fontSize=9.2 if compact else 8.8, leading=12 if compact else 10.7, textColor=HexColor("#" + INK), leftIndent=9 if compact else 13, firstLineIndent=-7, spaceAfter=1 if compact else 3, bulletIndent=1),
    }


def section_pdf(story, styles, black, accent):
    story.append(Paragraph(f'<font color="#{BLUE}">{black} {accent}</font>', styles["section"]))


def role_pdf(story, styles, role, compact, highlights):
    title = role.get("professionalTitle") or role["title"]
    date_end = "Present" if role["end"] is None else role["end"]
    story.append(Paragraph(f'{role["employer"]} — {role["location"]}', styles["role"]))
    story.append(Paragraph(f'<b>{title}</b> | {readable_date(role["start"])} – {readable_date(role["end"])}', styles["body"]))
    if role.get("customer"):
        story.append(Paragraph("Customer: " + role["customer"], styles["body"]))
    if not compact:
        story.append(Paragraph(role["summary"], styles["muted"]))
    for item in highlights:
        story.append(Paragraph("&bull; " + item, styles["bullet"]))


def build_pdf(profile: dict, output: Path, compact: bool):
    margin = 0.62 * inch
    document = SimpleDocTemplate(str(output), pagesize=letter, rightMargin=margin, leftMargin=margin, topMargin=margin, bottomMargin=margin, title=f'{profile["name"]} Resume', author=profile["name"])
    styles = pdf_styles(compact)
    story = [
        Paragraph(profile["name"], styles["name"]),
        Paragraph(profile["headline"], styles["title"]),
        Paragraph(f'{profile["location"]} | mohamedmoheyeldin.com | mohamedmoheyeldin.jobs@gmail.com | linkedin.com/in/moheyeldin | github.com/mohamedmoheyeldin', styles["contact"]),
    ]
    section_pdf(story, styles, "Professional", "profile")
    story.append(Paragraph(profile["summary"] if compact else "<br/><br/>".join(profile["detailedSummary"]), styles["body"]))
    section_pdf(story, styles, "Professional", "experience")
    for index, role in enumerate(profile["experience"]):
        if not compact and index == 1:
            story.append(PageBreak())
            section_pdf(story, styles, "Professional experience", "continued")
        role_pdf(story, styles, role, compact, role["compactHighlights"] if compact else role["highlights"])
    project = next(p for p in profile["projects"] if p["slug"] == "portfolio-career-content-system")
    section_pdf(story, styles, "Selected", "project")
    story.append(Paragraph(project["name"] + ": " + project["resumeSummary"] + ' <link href="https://mohamedmoheyeldin.com">mohamedmoheyeldin.com</link>', styles["body"]))
    section_pdf(story, styles, "Technical", "skills")
    for group in profile["skillGroups"]:
        story.append(Paragraph(f'<b>{group["label"]}:</b> {", ".join(group["items"])}', styles["body"]))
    section_pdf(story, styles, "Education", "")
    education = profile["education"][0]
    story.append(Paragraph(f'<b>{education["credential"]} in {education["field"]}</b> | {education["institution"]} | May 2014', styles["body"]))
    if not compact or profile.get("verifiedCredentials"):
        section_pdf(story, styles, "Professional", "development")
        for parts in professional_development(profile, compact):
            story.append(Paragraph(credential_pdf(parts), styles["body"]))
    document.build(story)


def build_text(profile: dict, compact: bool, markdown: bool = True) -> str:
    lines = ["# " + profile["name"], "", profile["headline"], "", profile["location"] + " | mohamedmoheyeldin.com", " | ".join(link["href"].removeprefix("mailto:") for link in profile["links"]), "", "## Professional profile", "", profile["summary"] if compact else "\n\n".join(profile["detailedSummary"]), "", "## Professional experience"]
    for role in profile["experience"]:
        lines += ["", "### " + role["employer"] + " — " + role["location"], "", (role.get("professionalTitle") or role["title"]) + " | " + readable_date(role["start"]) + " – " + readable_date(role["end"])]
        if role.get("customer"):
            lines += ["", "Customer: " + role["customer"]]
        if not compact:
            lines += ["", role["summary"]]
        highlights = role["compactHighlights"] if compact else role["highlights"]
        lines += ["", *["- " + text for text in highlights]]
    project = next(p for p in profile["projects"] if p["slug"] == "portfolio-career-content-system")
    lines += ["", "## Selected project", "", project["name"] + ": " + project["resumeSummary"], project["repository"], "", "## Technical skills"]
    lines += [g["label"] + ": " + ", ".join(g["items"]) for g in profile["skillGroups"]]
    lines += ["", "## Education"]
    lines += [e["credential"] + " in " + e["field"] + " | " + e["institution"] + " | " + readable_date(e["end"]) for e in profile["education"]]
    if not compact or profile.get("verifiedCredentials"):
        lines += ["", "## Professional development", *[credential_text(parts, markdown) for parts in professional_development(profile, compact)]]
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    profile = load_profile(args.source)
    args.output.mkdir(parents=True, exist_ok=True)
    targets = [
        ("mohamed-moheyeldin-resume-one-page", True),
        ("mohamed-moheyeldin-resume-detailed", False),
    ]
    for name, compact in targets:
        build_docx(profile, args.output / f"{name}.docx", compact)
        build_pdf(profile, args.output / f"{name}.pdf", compact)
        (args.output / f"{name}.md").write_text(build_text(profile, compact), encoding="utf-8", newline="\n")
    (args.output / "mohamed-moheyeldin-resume-job-board.txt").write_text(re.sub(r"(?m)^#{1,3} ", "", build_text(profile, False, markdown=False)), encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
