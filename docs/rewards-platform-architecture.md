# Vedoy Rewards architecture

Rewards owns game engines, versioned catalog, verified sessions, anti-fraud, authoritative points ledger and redemption. Monetize is marketing/onboarding; Collective and other apps are branded clients, not the source of truth.

Current audit: Collective web/extra-games.js implements Chess, Tic-Tac-Toe, Connect Four, Word Guess, Snake, Sudoku Mini and 2048. It depends on Collective DOM, auth localStorage and Supabase RPCs. Additional Collective games need separate inventory. Existing database has both collective_reward_ledger and reward_coin_ledger: never merge or migrate balances without reconciliation.

Migration: (1) inventory and test each game, (2) extract deterministic engines into independently tested modules, (3) expose a versioned Rewards SDK and catalog, (4) authenticate app/user via trusted identity, (5) validate completion server-side and grant idempotent coins in an RLS-protected ledger, (6) switch Collective behind a feature flag after parity tests, (7) retain rollback and monitor.

Do not award points from client-submitted scores, expose privileged keys, or imply demo coins have monetary value. Chess is currently practice-only. Do not break Collective while migrating.