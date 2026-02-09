---
date: 2026-02-09
topic: workflow-tracker
---

# Workflow Tracker for Department Automation

## What We're Building

A workflow tracking system for oil & gas departments to identify automation opportunities and track software usage across the organization.

**Two Main Components:**

1. **Public Submission Form** - Simple form where employees describe time-consuming workflows
   - No login required (anyone can submit)
   - Captures: name, department, workflow description, time spent, programs used

2. **Protected Admin Dashboard** - Analytics view for management to identify automation candidates
   - Requires authentication (admin only)
   - Shows all submissions with filtering and analytics
   - Tracks program usage across departments

**Core Use Case:**
An accounting employee fills out a form describing a workflow that takes 40 minutes daily and uses Power BI, OpenInvoice, and AFE Execute. Management views the dashboard, identifies this as a high-value automation candidate, and can also see which programs are most heavily used across the organization.

## Why This Approach

**Considered Approaches:**
- ❌ Local storage MVP - Too limited, no data sharing
- ❌ Custom backend - Too time-consuming to build and maintain
- ✅ **React + Supabase** - Best balance of speed and functionality

**Chosen: React + Supabase**

Supabase provides:
- PostgreSQL database for workflow submissions
- Built-in authentication for admin dashboard
- Real-time updates (dashboard refreshes automatically)
- No need to build/maintain custom backend
- Free tier sufficient for starting out

This lets us build quickly while supporting multiple users and departments from day one.

## Key Decisions

**1. Form Access: Public (no authentication required)**
- **Rationale:** Reduces friction for employees; makes submission quick and easy
- **Trade-off:** Less secure, but acceptable since data is not sensitive
- **Mitigation:** Include "Your Name" field to track submissions

**2. Time Tracking: Capture both duration and frequency**
- **Rationale:** Need to calculate total time investment (40 min/day = 200 min/week)
- **Fields:** "Time per occurrence" + "Frequency" (daily/weekly/monthly)
- **Benefit:** Can prioritize automation by total time saved

**3. Program Selection: Hybrid approach**
- **Rationale:** Balance between consistency and flexibility
- **Implementation:**
  - Dropdown with common programs (Power BI, OpenInvoice, AFE Execute, etc.)
  - Multi-select (workflows often use multiple programs)
  - "Other" field to add custom programs
- **Benefit:** Standardized data + ability to discover new tools being used

**4. Dashboard: Admin-only with authentication**
- **Rationale:** Management needs to analyze data; employees only need to submit
- **Access:** Protected route with Supabase authentication
- **Views:**
  - All submissions table (filterable by department, program)
  - Top automation candidates (sorted by time saved)
  - Program usage analytics (most-used tools across departments)

## Data Model

**Workflow Submission:**
```
{
  id: uuid
  created_at: timestamp
  employee_name: string
  department: string
  workflow_description: text
  time_per_occurrence: number (minutes)
  frequency: string ("daily" | "weekly" | "monthly")
  programs_used: string[] (array of program names)
  total_minutes_per_week: number (calculated)
}
```

## Open Questions

- **Department list:** Should departments be a predefined dropdown or free text?
  - *Suggestion:* Dropdown for consistency in analytics

- **Program list:** What are the most common programs to include in the dropdown?
  - *Known:* Power BI, OpenInvoice, AFE Execute
  - *Need:* Complete list of company software

- **Dashboard features:** Any specific analytics or reports beyond the basics?
  - *Current plan:* Submissions table, top candidates, program usage
  - *Possible additions:* Department comparisons, time trends, export to CSV

## Tech Stack

- **Frontend:** React (already set up)
- **Styling:** Tailwind CSS (already configured)
- **Backend:** Supabase
  - PostgreSQL database
  - Authentication (for admin)
  - Row Level Security (RLS) policies
- **Deployment:** Can deploy to Vercel, Netlify, or similar

## Next Steps

1. Set up Supabase project and database schema
2. Build submission form component
3. Build admin dashboard with authentication
4. Add analytics views (top candidates, program usage)
5. Deploy and test with pilot group

→ Ready to proceed to `/workflows:plan` for implementation details?
