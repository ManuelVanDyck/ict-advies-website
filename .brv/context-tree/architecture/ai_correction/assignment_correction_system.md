---
title: Assignment Correction System
tags: []
related: [architecture/overview/ict_advies_website_stack.md]
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-16T21:43:32.238Z'
updatedAt: '2026-03-16T21:43:32.238Z'
---
## Raw Concept
**Task:**
Document AI-driven assignment correction system architecture and API

**Files:**
- src/app/api/opdracht/correct/route.ts

**Flow:**
CorrectionRequest -> Data Retrieval (CSV/Jina/Vision) -> AI Prompting -> Scoring/Feedback -> Supabase Update

**Timestamp:** 2026-03-16

**Author:** ByteRover

## Narrative
### Structure
The system uses a combination of local LLMs (Ollama) and cloud fallbacks (Z.ai). Data is retrieved from Google Sheets (CSV export), Jina AI Reader (fallback), or screenshots.

### Dependencies
Ollama (llava:7b, mistral:7b), Z.ai (glm-4-plus), Supabase (opdracht_inzendingen table), Sanity (criteria definitions).

### Highlights
Automated scoring logic parses JSON or text from LLM responses. Handles private sheets by requesting public access and providing cautious scores (60-70). Realistic scoring range for good entries is 60-90.

### Rules
Rule 1: No extra requirements (graphs/conclusions) unless in criteria
Rule 2: Direct address ("je") in feedback
Rule 3: Strict JSON output format including score, feedback, and details

### Examples
CorrectionRequest includes inzendingId, sheetUrl/pdfUrl, criteria (naam, gewicht, etc.), maxScore, and optional screenshots.

## Facts
- **vision_model**: Vision Model used for screenshot analysis is Ollama llava:7b [project]
- **text_models**: Primary text model is mistral:7b (Ollama) with fallback to glm-4-plus (Z.ai) [project]
- **api_endpoint**: The backend API endpoint for correction is /api/opdracht/correct [project]
- **status_flow**: Assignment status flow: ingediend -> bezig -> voltooid / mislukt [convention]
- **vision_timeout**: Timeout for Ollama Vision is 300 seconds (5 minutes) [project]
