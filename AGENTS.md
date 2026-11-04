<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the imported portfolio's browser-only Three.js, Web Audio and speech modules under src/purrfolio and lazy-load the experience from the index route; this preserves its source behavior without evaluating browser APIs during SSR.
- Preserve the original portfolio stylesheet in src/styles/purrfolio.css; source fidelity takes precedence over cosmetic restyling during this import.
