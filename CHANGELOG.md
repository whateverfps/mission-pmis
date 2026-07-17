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

## 1.3.6 — Register Architecture & COR Accordions
- Bundled Bedford VA EHRM PMIS v8.8 as the current Excel source.
- Front end now loads the bundled workbook automatically on GitHub Pages.
- Project_Register is the direct source for COR Sections 8 and 9.
- Shutdown_Tracker is the direct source for active shutdown records.
- CM_PM Operations remains the reporting layer for assessment-derived Sections 1–7.
- COR report sections and Executive Summary now open as collapsed dropdown panels.
- Added Expand All and Collapse All controls; printing expands all sections automatically.
