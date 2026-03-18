---
children_hash: 9ef6dd0ab289a62c9166a1f4fce6194d59ca3942f7dc5a7fbcba15a423d2ba24
compression_ratio: 0.6677966101694915
condensation_order: 1
covers: [context.md, ict_advies_website_stack.md]
covers_token_total: 295
summary_level: d1
token_count: 197
type: summary
---
# ICT-Advies Website Architecture & Stack

## Core Infrastructure
*   **Frontend:** Next.js 16 with Tailwind v4 styling.
*   **CMS:** Sanity (Project ID: `mgu8mw2o`) manages 5 learning paths (*leerpaden*) and 38 tutorials.
*   **Database:** Supabase handles `opdracht_inzendingen` (assignment submissions).
*   **AI Integration:** Ollama `llava:7b` vision model performs automated screenshot analysis.

## Visual Identity
*   **Brand Palette:** Red (`#e53013`), Green (`#4c8077`), Orange (`#f7931e`), and Cream (`#fee4cc`).

## Key Relationships
*   **Data Flow:** Next.js Frontend → Sanity (Content) / Supabase (Submissions) / Ollama (Analysis).

---
*For technical details and implementation specifics, refer to the individual entries: `context.md` and `ict_advies_website_stack.md`.*