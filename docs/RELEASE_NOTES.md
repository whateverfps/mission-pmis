# Mission PMIS 1.3.8 — Empty Shell

This release contains no Bedford project workbook and no packaged project records. The application remains empty until a user selects or drops a compatible PMIS Excel workbook. Report and operational views populate from that workbook only.

# Mission PMIS 1.3.8

This release completes a production pass on the reporting module. Reports now open in dedicated print layouts designed for clean multi-page PDF or paper output. COR reports respect the current building filter, omit empty sections, and use a consistent professional header and footer.

# Release Notes

## v1.2.4 GitHub Long-Haul Stack

Purpose: prepare Mission PMIS for GitHub Pages, long-term versioning, and stable release management.

### Added
- GitHub Pages deployment workflow.
- `.nojekyll` for static asset compatibility.
- `.gitignore` to prevent accidental workbook/private data commits.
- `docs/DEPLOYMENT.md`.
- `docs/ROADMAP.md`.
- `docs/CONTRIBUTING.md`.
- `docs/ARCHITECTURE.md`.
- `VERSION` file.
- `CHANGELOG.md`.

### Preserved
- Existing Mission PMIS front end.
- Excel workbook loading model.
- Campus map.
- Engineering mode.
- Reports center.
- Meeting mode.
- Local launcher scripts.

### Rule
Excel remains the source of truth. The web application remains the presentation layer.


## 1.3.0 — COR Reports
- Dedicated left-rail COR Reports workspace.
- Current v8.7 mappings for CM_PM Operations and COR_Report.
- Nine ordered report sections, building filter, copy digest, and print.
