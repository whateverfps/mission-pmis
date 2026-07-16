## 1.3.4
- Fixed live Excel import so CM_PM Operations and COR_Report are parsed into the COR Reporting Center.
- Preserved COR report data after loading a workbook instead of replacing it with building-only data.
- Added fallback parsing from the CM/PM manual action register.

# Changelog

## v1.2.4 — GitHub Long-Haul Stack

Prepared Mission PMIS for GitHub Pages, version control, stable releases, and long-term development.

- Added GitHub Pages workflow.
- Added documentation folder.
- Added roadmap, architecture, deployment, and contribution notes.
- Added `.gitignore` to protect workbook/private data.
- Preserved current working application files.

## 1.3.3
- Registered COR Reports in the live app-main left-rail navigation.
- Forced the COR overlay hidden during normal page load.
- Made app-main the single owner of COR open/close state.
- Prevented COR report markup from appearing below the main dashboard.

## 1.3.5 — Complete COR Campus Data
- COR Reports now reads full 30-building section ranges from CM_PM Operations.
- COR_Report remains the concise printable summary instead of limiting the web view.
- All assessment, risk, quality, design, and commissioning rows are available in the COR workspace.
