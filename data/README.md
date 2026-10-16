# Maintaining ownership records

`brands.json` is the editable source for the ownership matcher, searchable list, JSON and CSV downloads, and `docs/BRANDS.md`. Generated files are committed so the directory can also be read without building the app.

This is a reviewed, US-focused directory. It is not an exhaustive registry of every corporation, private equity investment, or independently operated location. Missing businesses remain unknown. Do not use a business's size, name, logo, or absence from a portfolio as proof that it is independent.

Each brand record needs:

- `brand`: one canonical storefront brand, with separate records for sister brands.
- `aliases`: reviewed spelling or format variants of that brand. Punctuation is ignored automatically. Do not add loose name fragments or sister brands as aliases.
- `type`: `corporate` for a large public or privately held chain; `pe` for documented current private equity backing; `independent` only for a sourced and geographically restricted business.
- `parent`: the supported brand owner or investment backing. Do not substitute a historical owner or imply a minority investor owns the entire company.
- `source`, `sourceTitle`: an HTTPS primary company, investor, or regulatory source that supports the classification.
- `note`: the scope of the evidence, franchise/operator distinctions, and minority investment qualifications where relevant.
- `checked`: the ISO date on which the source was reviewed.
- Optional `matchCategories`: restrict ambiguous names to relevant app categories (`restaurant`, `grocery`, `gas`, `coffee`, `other`) unless the place data has an explicit matching brand field.
- Optional `preservePunctuation: true`: require the reviewed spelling after case and whitespace normalization when punctuation distinguishes unrelated chains, such as Whataburger and What-A-Burger.
- Optional `local: true`: restrict the independent reference to within 25 km of the existing Austin example center. Additional local references require explicit geography support in the matcher before use elsewhere.

For current private equity backing, verify the current portfolio section, not an exited-investments list. For acquisitions, verify closing rather than relying on an announced agreement. For public companies with investment-firm connections, establish the relevant current ownership/backing before changing the category. Large private family-owned chains belong in the corporate category; private ownership alone does not establish private equity backing.

The categories are mutually exclusive for filtering: a documented PE-backed brand uses `pe`, and other reviewed large chains use `corporate`. Neither category verifies ownership of each individual franchise, licensed store, or branded fuel station. The map's ownership matcher currently covers researched continental US geography; related international brand references do not establish worldwide ownership.

After an edit, run:

```sh
npm run directory
npm test
npm run build
```

The generator rejects missing evidence and aliases that collide across distinct brands. Review source and export changes together. Ownership research is manual; a review date is not a promise of automatic updates.
