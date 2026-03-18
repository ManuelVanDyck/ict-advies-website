---
children_hash: c446707fe301c71dc906ac9766964d7b0f3e0d91b9353f12dcdb834c3792d5a4
compression_ratio: 0.7962962962962963
condensation_order: 1
covers: [assignment_correction_system.md]
covers_token_total: 486
summary_level: d1
token_count: 387
type: summary
---
### AI-Driven Assignment Correction System

**Structural Overview**
The system automates assignment evaluation via a multi-model pipeline that processes student submissions (Google Sheets, PDFs, or screenshots) against criteria defined in Sanity. Results are stored in the Supabase `opdracht_inzendingen` table.

**Architectural Components**
*   **API Endpoint:** `/api/opdracht/correct` (`src/app/api/opdracht/correct/route.ts`).
*   **Execution Flow:** `CorrectionRequest` → Data Retrieval (CSV/Jina/Vision) → AI Prompting → Scoring/Feedback → Supabase Update.
*   **Status Lifecycle:** `ingediend` → `bezig` → `voltooid` or `mislukt`.

**Model & Data Dependencies**
*   **Text Models:** Primary `mistral:7b` (Ollama) with `glm-4-plus` (Z.ai) fallback.
*   **Vision Model:** `llava:7b` (Ollama) for screenshot analysis (300s timeout).
*   **Data Sources:** Google Sheets (via CSV export/Jina AI Reader) and Sanity (scoring criteria).

**Key Rules & Logic**
*   **Scoring:** Standard range of 60-90 for valid entries; cautious scores (60-70) for private sheets.
*   **Constraints:** Feedback must use direct address ("je"); no requirements for graphs/conclusions unless explicitly in criteria.
*   **Output Format:** Strict JSON requirement containing `score`, `feedback`, and `details`.

**Child Entries**
*   [assignment_correction_system.md](architecture/ai_correction/assignment_correction_system.md) (Primary technical documentation)
*   [ict_advies_website_stack.md](architecture/overview/ict_advies_website_stack.md) (Related infrastructure)