---
children_hash: 7d308e76e25a6864fb1701ded8e1016e8cc69dfeb6f4e1857ff968ffdede334f
compression_ratio: 0.6358921161825726
condensation_order: 3
covers: [architecture/_index.md, branding/_index.md]
covers_token_total: 964
summary_level: d3
token_count: 613
type: summary
---
# ICT-Advies Project Structural Summary (Level d3)

This summary provides a consolidated overview of the technical architecture and branding foundations for the ICT-advies platform, integrating the infrastructure, AI systems, and visual identity.

## Technical Architecture & Infrastructure
The platform is an automated educational ecosystem built on a modern full-stack architecture designed to handle content management and student evaluations.

*   **Core Stack:** Next.js 16 with Tailwind v4.
*   **Data & Content Management:** 
    *   **Sanity CMS:** (Project ID: `mgu8mw2o`) Orchestrates 5 learning paths and 38 tutorials.
    *   **Supabase:** Manages relational data, specifically student submissions via the `opdracht_inzendingen` table.
*   **AI Correction Engine:** A specialized multi-model pipeline located at `/api/opdracht/correct/` that automates evaluation.
    *   **Models:** `mistral:7b` (Text), `llava:7b` (Vision), and `glm-4-plus` (Fallback).
    *   **Workflow:** Submissions transition through states (`ingediend` → `voltooid`/`mislukt`) using data extracted via Jina AI or CSV.
    *   **Output:** Strict JSON containing scores (60-90 range), direct feedback, and details.

*For deep technical specs, see [architecture/_index.md](architecture/_index.md), [overview/_index.md](architecture/overview/_index.md), and [ai_correction/_index.md](architecture/ai_correction/_index.md).*

## Branding & Visual Identity
The project's visual presence is defined by a consistent primary palette and structured styling guidelines.

*   **Primary Palette:** 
    *   **Red:** `#e53013`
    *   **Green:** `#4c8077`
    *   **Orange:** `#f7931e`
    *   **Cream:** `#fee4cc`
*   **Implementation:** These hex codes serve as the technical foundation for project-level styling and digital interfaces.

*For specific color mappings and brand specifications, see [branding/_index.md](branding/_index.md) and [visual_identity/_index.md](branding/visual_identity/_index.md).*

## Key Relationships
*   **Orchestration:** Next.js acts as the central hub, fetching content from Sanity, managing states in Supabase, and triggering AI analysis via Ollama.
*   **Evaluation Loop:** Student Submission → Extraction (CSV/Vision) → AI Scoring (Mistral/Llava) → Results Storage (Supabase).
*   **Thematic Consistency:** The visual identity defined in the branding domain is applied across the frontend components managed within the architecture domain.