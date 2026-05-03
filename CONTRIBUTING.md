# Contributing to MedDDL

Thanks for helping improve MedDDL.

## What to contribute

Good contributions include:

- New medical, radiology, cardiology, MRI/CMR, neurology, oncology, respiratory, nuclear medicine, and medical AI conference deadlines
- Official source links for deadlines
- Corrections to conference dates, locations, or submission URLs
- Workshop, challenge, late-breaking, or early-registration deadlines
- UI improvements that keep the site static and GitHub Pages-friendly

## Data rules

1. Prefer official conference pages.
2. Do not guess exact times. If only a date is known, use `verified_date_time_tbd` and make the display text clear.
3. If a deadline is unknown, keep `date_iso: ""` and `display: "TBD"`.
4. Update `last_checked` whenever you verify a source.
5. Keep `source_url` as the page that directly supports the deadline.

## Suggested categories

- Radiology
- Cardiology
- Medical AI
- MRI
- Neurology
- Oncology
- Nuclear Medicine
- Respiratory
- Endocrinology

## Pull request checklist

- [ ] The conference has a stable `id`.
- [ ] Date fields use ISO-8601 strings.
- [ ] Deadline source URL is official or clearly marked.
- [ ] Unknown dates are not fabricated.
- [ ] Tags are concise and lowercase.
