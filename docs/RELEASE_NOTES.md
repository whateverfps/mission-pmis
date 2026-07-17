# Mission PMIS 2.0.0

Mission PMIS 2.0 introduces a project-neutral product shell while preserving Excel as the source of truth.

## New
- Clean workbook-loading landing experience with no project data shown before a workbook is loaded.
- Global search across buildings, Project Register records, and Shutdown Tracker records.
- Owner-oriented Project Health panel.
- Building Workspace with Overview, Assessment, Systems, Project Register, Shutdowns, Documents, and Photos tabs.
- Expanded Reports Center with clear report-purpose launch cards.
- Product-neutral branding for reuse across projects.
- Local browser processing; no project workbook is bundled.

## Data architecture
- Assessment sheets remain field-condition sources.
- Project Register remains the management-record source.
- Shutdown Tracker remains the shutdown source.
- Reports and workspaces consume those sources without creating duplicate front-end records.
