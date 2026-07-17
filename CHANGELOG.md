# Changelog
## 1.3.8 — Empty Shell Release

- Removed the bundled Bedford workbook from the GitHub stack.
- Removed packaged project data from the JavaScript snapshot.
- Mission PMIS now opens as a clean shell with zero project records.
- Dashboard, reports, registers, and shutdown data populate only after the user loads an Excel workbook.
- Updated status messaging so failed imports do not fall back to stale data.


## 1.3.8 — Reporting Production Pass
- Added dedicated, multi-page print documents for Reports Center and COR Reports.
- Added consistent report headers, project identification, generated date, and footer branding.
- Removed dashboard navigation and controls from printed reports.
- Added repeating table headers, print-safe page breaks, and overflow handling.
- Improved report language so summaries read as operational briefings rather than raw dashboard exports.
- COR printing now respects the selected building filter and omits empty sections.
- Added stronger browser popup guidance when print windows are blocked.

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
## 2.0.0
- Added project-neutral workbook loading gate.
- Added global project search.
- Added Project Health owner view.
- Added tabbed Building Workspace.
- Expanded report launch center.
- Preserved empty-shell behavior until a workbook is loaded.
