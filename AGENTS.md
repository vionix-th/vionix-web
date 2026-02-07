## Template & Stack
- Build pages with Bootstrap, Bootstrap Icons, and the assets/styles bundled with the BizLand template.
- Study the template's layout, visual style, and intended use cases to guide page structure and content mapping.
- Preserve the template's layout, responsiveness, and animations while keeping the site fully static-hosting compatible.
- Reuse existing pages and layout patterns from the template; do not modularize HTML, split it into partials, or inject it dynamically.
- Restrict scripting to plain JavaScript—avoid TypeScript and frameworks such as React or Vue.

## Structural Requirements
- Maintain key components including headers, footers, contact forms, and call-to-action sections.
- Update navigation and menu links so they reflect the actual structure of the rebuilt site.
- If critical business data (for example, address or phone number) is missing, either request it from the user or insert a `<!-- MISSING: [description] -->` placeholder comment.

## Markdown Content Integration
- Source business content from the provided Markdown files (business plan, competency profiles, team resumes, testimonials, etc.).
- Interpret and rewrite that material into high-quality, semantically structured HTML that aligns with the BizLand template.
- Place each rewritten section on the most suitable page (for example, team bios on `about.html`, competency details on `service-details.html`).
- Complete this work manually—do not create tooling to auto-convert Markdown.

## Language Scope
- Deliver content in English only and skip any multilingual implementation unless the user explicitly requests a translation.

## Taxonomy Consistency Rules
- Canonical service pillars must be used verbatim across the site:
  - `Database & Reporting Performance`
  - `Legacy Core Stabilisation`
  - `Incremental System Modernisation`
  - `Efficient Team & Workflow Enablement`
- Do not introduce alternate pillar names or shortened variants in headings, filters, footer service lists, or CTA references.
- Use the same icon mapping for each pillar everywhere:
  - `Database & Reporting Performance` -> `bi-code-square`
  - `Legacy Core Stabilisation` -> `bi-arrow-repeat`
  - `Incremental System Modernisation` -> `bi-robot`
  - `Efficient Team & Workflow Enablement` -> `bi-mortarboard`
