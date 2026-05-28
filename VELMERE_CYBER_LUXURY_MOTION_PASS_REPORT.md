# Velmère — Cyber-Luxury Motion Pass Report

## Scope
This pass applies the requested cyber-luxury visual upgrade while preserving the existing mobile overflow fixes, touch-action rules, floating VLM pill, and navbar layout.

## Implemented

1. **Global Page Transitions**
   - Rebuilt `components/PageTransition.tsx` with Framer Motion `AnimatePresence mode="wait"`.
   - Added slow premium route fade/up transitions: `duration: 0.65`, `ease: [0.16, 1, 0.3, 1]`.
   - Key includes pathname + search params so Basic/Pro transitions also feel intentional.

2. **Cryptographic Scramble Text**
   - Added `components/ui/ScrambleText.tsx`.
   - Text starts as cryptographic glyphs and decrypts into the target text when in viewport.
   - Respects reduced motion.
   - Applied to:
     - VLM Pro display heading
     - Velmère Square hero headings
     - Archive hero heading

3. **Global Film Grain**
   - Added `components/ui/FilmGrain.tsx`.
   - Injected into `app/[locale]/layout.tsx`.
   - Uses fixed, pointer-events-none, low-opacity SVG noise overlay.

4. **Luxury Empty States**
   - Added `components/ui/LuxuryEmptyState.tsx`.
   - Refactored empty cart drawer and cart page states.
   - Added profile empty states for posts and orders.
   - Added i18n copy in PL/EN/DE:
     - Cart: “YOUR SELECTION IS EMPTY. INITIATE EXPLORATION.”
     - Profile no posts: “ACCESS GRANTED. AWAITING INITIALIZATION.”
     - No orders: “NO ARCHIVED TRANSACTIONS FOUND.”

5. **Basic/Pro Motion Refinement**
   - Reduced aggressive side movement from ±105% to subtle ±18–22%.
   - Added blur-to-clear transition.
   - Extended Basic/Pro transition to ~1.05–1.10s for heavier luxury feel.
   - Rebuilt VLM mode overlay into a small floating transition rail instead of full-screen interruption.
   - Mobile pill preserved.

6. **Velmère Square Polish**
   - Added scramble hero text.
   - Constrained Square layout to `max-w-[88rem]` instead of unlimited width.
   - Increased card rounding for a calmer luxury grid.
   - Kept YouTube-style comments/replies intact.

7. **i18n**
   - `node scripts/check-i18n.mjs` passed.

## Files created
- `components/ui/ScrambleText.tsx`
- `components/ui/FilmGrain.tsx`
- `components/ui/LuxuryEmptyState.tsx`
- `VELMERE_CYBER_LUXURY_MOTION_PASS_REPORT.md`

## Files changed
- `app/[locale]/layout.tsx`
- `components/PageTransition.tsx`
- `components/vlm/VlmModeTransitionOverlay.tsx`
- `components/vlm/VlmBasicProShowcase.tsx`
- `components/mobile/MobileModePill.tsx`
- `components/square/VelmereSquareClient.tsx`
- `app/[locale]/archive/page.tsx`
- `app/[locale]/cart/page.tsx`
- `components/CartDrawer.tsx`
- `components/account/ProfileAccountClient.tsx`
- `messages/en.json`
- `messages/pl.json`
- `messages/de.json`

## Commands run
- `node scripts/check-i18n.mjs` — passed.

## Commands not run in sandbox
The sandbox did not have `pnpm` activated and dependencies were not installed in the extracted project, so `pnpm run typecheck`, `pnpm run lint`, and `pnpm run build` could not be executed here. Run them locally after `pnpm install`.

## Local QA to run
- `/pl/vlm-token?mode=pro`
- `/pl/vlm-token#vlm-mode`
- `/pl/square`
- `/pl/archive`
- `/pl/cart`
- `/en/vlm-token?mode=pro`
- Mobile width: 390px
- Check scroll over VLM visual still works.
- Check no horizontal overflow.
- Check Basic/Pro change has smooth transition and no full-screen jump.
