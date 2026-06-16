# Frontend Unused Code Audit - Arova

This audit evaluates the cleanup candidates in the Arova Angular frontend directory (`[Frontend Root]`).

---

## 1. High-Confidence Unused Files
* None. All TS/HTML/SCSS configuration files are actively referenced, routed, or required for environment initialization.

## 2. High-Confidence Unused Components
* None. All component views mapped in routes or templates are actively loaded. Shared components like `ArovaLoadingStateComponent` and `ArovaEmptyStateComponent` are actively used in lists. Legacy components (e.g. `empty-state`, `glass-card`, `planet-card`, `romantic-button`) have already been deleted from the repository.

## 3. High-Confidence Unused Services
* **`src/app/core/services/settings-api.service.ts`** and **`src/app/core/services/settings-data.service.ts`**:
  * *Why*: These files are not imported anywhere in the UI component tree.
  * *Verification*: Grep search returns zero active imports outside their own module context.
  * *Risk Level*: Medium.
  * *Deletion Decision*: **Keep** as uncertain candidates. They represent backend settings sync structures for API Mode syncing.

## 4. High-Confidence Unused Models/Interfaces
* None. The entities defined under `src/app/shared/models` represent active backend shapes and storage matrices.

## 5. High-Confidence Unused SCSS/Classes
* None. Standard assets in `src/styles` are imported globally in `styles.scss`.

## 6. High-Confidence Unused Assets
* Empty folders:
  * `public/assets/audio`
  * `public/assets/icons`
  * `public/assets/images`
  * *Why*: These folders contain no files.
  * *Verification*: Directory listings show 0 bytes.
  * *Risk Level*: Low.
  * *Deletion Decision*: **Keep** as empty placeholder structures for future asset uploads.

## 7. High-Confidence Unused Tests
* **`src/app/app.spec.ts` (Title Test Block)**:
  * *Why*: The test `should render title` searches for an `h1` element containing "Hello, dd", which was deleted from `app.html` in favor of a clean routing outlet.
  * *Verification*: Running `npm test` fails with an assertion error.
  * *Risk Level*: Low.
  * *Deletion Decision*: **Delete** the obsolete test block while keeping the bootstrap check.

## 8. Duplicate/Legacy Files
* None. Legacy folders have been successfully cleared out in previous phases.

## 9. Uncertain Candidates (Should NOT be deleted yet)
* **`settings-api.service.ts`** and **`settings-data.service.ts`**: Kept because they maintain API Mode endpoint definitions for user settings syncing.

## 10. Files Intentionally Kept and Why
* **`package.json` dependencies**:
  * `tslib`: Kept because `"importHelpers": true` is enabled in `tsconfig.json`.
  * `@angular/build`, `@angular/compiler-cli`, `typescript`: Flagged as unused by `depcheck` but are core builders/compilers for Angular.
  * `jsdom` & `vitest`: Required for running unit tests in simulated browser environment.

