---
children_hash: 01e55eabcba66fb6412bd49cc513c2f053066b2e9db5a386eaec4e873f0bc367
compression_ratio: 0.7670157068062827
condensation_order: 2
covers: [ai_correction/_index.md, context.md, overview/_index.md]
covers_token_total: 764
summary_level: d2
token_count: 586
type: summary
---
# Architecture Domain Summary

The architecture domain encompasses the technical infrastructure, automated systems, and core data flows of the ICT-advies platform.

## Core Infrastructure & Stack
The platform is built on a modern web stack designed for content management and automated evaluation.
*   **Frontend & Styling:** Next.js 16 utilizing Tailwind v4.
*   **Content Management:** Sanity (Project ID: `mgu8mw2o`) serves as the primary CMS, managing 5 learning paths (*leerpaden*) and 38 tutorials.
*   **Database:** Supabase manages relational data, specifically assignment submissions via the `opdracht_inzendingen` table.
*   **Visual Identity:** Defined by a specific palette including Red (`#e53013`), Green (`#4c8077`), Orange (`#f7931e`), and Cream (`#fee4cc`).

*For foundational stack details, see [overview/_index.md](architecture/overview/_index.md) and [ict_advies_website_stack.md](architecture/overview/ict_advies_website_stack.md).*

## AI-Driven Assignment Correction
A specialized multi-model pipeline automates the evaluation of student submissions (Google Sheets, PDFs, or screenshots).
*   **API & Workflow:** The system operates through `/api/opdracht/correct` (`src/app/api/opdracht/correct/route.ts`), moving submissions through a lifecycle from `ingediend` to `voltooid` or `mislukt`.
*   **Model Pipeline:** 
    *   **Text:** `mistral:7b` (Ollama) with `glm-4-plus` (Z.ai) fallback.
    *   **Vision:** `llava:7b` (Ollama) for screenshot analysis (300s timeout).
*   **Logic & Constraints:** 
    *   Evaluates submissions against criteria stored in Sanity.
    *   Produces strict JSON output containing `score` (typically 60-90), `feedback` (using direct "je" address), and `details`.
    *   Handles data retrieval via CSV exports or Jina AI Reader for Google Sheets.

*For deep technical specs on the correction engine, see [ai_correction/_index.md](architecture/ai_correction/_index.md) and [assignment_correction_system.md](architecture/ai_correction/assignment_correction_system.md).*

## Key Relationships
*   **Data Integration:** Next.js acts as the orchestrator, fetching content from Sanity, updating submission states in Supabase, and triggering analysis via Ollama.
*   **Evaluation Loop:** Student Submission → Data Extraction (CSV/Vision) → AI Scoring (Mistral/Llava) → Results Storage (Supabase).