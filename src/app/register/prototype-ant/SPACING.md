# Ant CT spacing law

**Symptom class:** titles / search / controls flush to panel or split borders; index table primary columns (Contact, Client) crushed so text stacks vertically; status Tags cramped into the name cell so fields are unreadable.

## Rules

1. **ModulePage owns inset.** Default `paddingMD` (16). Titles and body content must not sit flush against a panel edge or split border. Never ship ModulePage at inset 0 unless the surface is intentionally full-bleed chrome (rare).
2. **Do not double-tax.** If ModulePage insets, parent Content should not also pad the same axis (Operator Content uses 0; ModulePage pads).
3. **Primary identity columns breathe.** In index Tables, Contact / Client / Name get the flexible remainder + `ellipsis`. Status Tags are **their own column**, not jammed beside the name in a narrow cell.
4. **Fixed column budget must fit.** Sum of fixed `width`s + inset must leave ≥ ~140px for the primary name column inside the index pane. If not, shrink fixed widths or enable horizontal scroll — never let the name go vertical.
5. **Split panes resize.** Index | detail (Board, Contacts, Meetings) use Ant `Splitter` with a real `min` on the index pane so Contact/Client stay readable. Fixed `width: 360` / `420` with `flexShrink: 0` is a failure mode inside Register CT.
6. **Tab bars inset too.** Workspace tab labels (Client Brief / Engagement record) get the same horizontal inset as body content — not flush to the split.

## Checklist before claiming a desk done

- [ ] Module title has clear air from left/top border
- [ ] Search / primary actions have clear air from left border
- [ ] Opening a row still leaves the name column readable (not vertical glyphs)
- [ ] Status Tag is visually its own field
- [ ] Index | detail can be dragged wider
