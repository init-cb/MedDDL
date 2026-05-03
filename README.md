# MedDDL

**MedDDL** is a lightweight medical conference deadline tracker inspired by ccfddl. It tracks abstract, paper, workshop, challenge, late-breaking, and registration-related deadlines for major medical, radiology, cardiology, MRI/CMR, neurology, oncology, nuclear medicine, respiratory, and medical AI conferences.

This repository is designed for **GitHub Pages** and uses **Jekyll's native data files**. No Node.js, React, build step, or backend is required.

## Features

- Conference cards with acronym, full name, category, location, conference dates, official links, and tracked deadlines
- Client-side search
- Category filters
- Status filters: all, upcoming, next 30 days, expired, TBD
- Dynamic countdown labels
- YAML-based conference database in `_data/conferences.yml`
- GitHub Pages-ready static site

## Project structure

```text
MedDDL/
├── _config.yml
├── _data/
│   └── conferences.yml
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── img/
│   │   └── favicon.svg
│   └── js/
│       └── app.js
├── index.html
├── 404.html
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## Add or update a conference

Edit `_data/conferences.yml`.

Example:

```yaml
- id: rsna-2026
  acronym: RSNA
  year: 2026
  name: Radiological Society of North America Annual Meeting
  category: Radiology
  location: Chicago, IL, USA
  conference_start: "2026-11-29"
  conference_end: "2026-12-03"
  website: https://www.rsna.org/annual-meeting
  submission_url: https://www.rsna.org/annual-meeting/abstract-submission
  source_url: https://www.rsna.org/annual-meeting/abstract-submission
  last_checked: "2026-05-03"
  tags: [radiology, medical imaging, clinical, abstract]
  note: "Premier global radiology meeting."
  deadlines:
    - type: abstract
      label: Abstract submission
      date_iso: "2026-05-06T12:00:00-05:00"
      display: "May 6, 2026, 12:00 CT"
      timezone: "America/Chicago"
      status_hint: verified
```

### Deadline fields

- `date_iso`: ISO-8601 date-time with timezone offset. Used for countdown and sorting.
- `display`: Human-readable deadline shown on the card.
- `timezone`: IANA timezone name. Useful for future improvements and auditability.
- `status_hint`: one of `verified`, `verified_date_time_tbd`, `tbd`, or `closed_date_unknown`.

If a deadline is unknown, keep `date_iso: ""` and `display: "TBD"`.

## Run locally

GitHub Pages will build this automatically. For local preview:

```bash
gem install bundler jekyll
cd MedDDL
jekyll serve
```

Open the local URL printed by Jekyll, usually `http://127.0.0.1:4000/`.

## Deploy on GitHub Pages

### Option 1: User/organization site

1. Create a GitHub repository named exactly:

   ```text
   your-username.github.io
   ```

2. Upload all files in this folder to the repository root.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. Save. Your site will be available at:

   ```text
   https://your-username.github.io/
   ```

### Option 2: Project site

1. Create a repository, for example:

   ```text
   medddl
   ```

2. Upload all files to the repository root.
3. Edit `_config.yml` and set:

   ```yaml
   baseurl: "/medddl"
   ```

4. Go to **Settings → Pages**.
5. Use:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
6. Your site will be available at:

   ```text
   https://your-username.github.io/medddl/
   ```

## Data disclaimer

Conference deadlines change. MedDDL is a community-maintained tracker, not an official conference source. Always verify every submission deadline on the official conference website before submitting.
