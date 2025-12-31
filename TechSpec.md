# Technical Specification — ZKX OMA Proof of Concept

## Overview

This Proof of Concept (PoC) demonstrates an end-to-end **trade intent → policy enforcement → execution → audit evidence** workflow. A user submits a trading intent, the system evaluates a minimal set of compliance policies, and execution produces immutable, audit-ready evidence via on-chain events and reconciled off-chain records. The PoC focuses on enforceability and traceability rather than full venue integration.

## PoC Scope (Core Subset)

1. **Intent submission & lifecycle**  
   Users can create a trading intent and track its lifecycle states: `Created → Validated → Executed / Rejected`.

2. **Embedded policy engine (minimal rules)**  
   Policies include allow/deny lists, per-asset trade limits, and per-venue allowlists. Policy failures return explicit reasons and deterministically block execution.

3. **Execution on Foundry local network**  
   Execution is performed on a local Foundry (Anvil) Ethereum network using a single-chain execution stub (swap or venue adapter mock) that consumes intent parameters and emits standardized events.

4. **Audit evidence generation**  
   Every execution attempt (success or failure) produces on-chain events and persists off-chain audit artifacts, enabling post-trade reconstruction.

## Architecture & Tech Stack

- **Frontend:** Next.js (App Router)  
  - Intent creation form  
  - Intent list and detail views  
  - Policy evaluation preview (pass/fail)  
  - Audit timeline per intent  

- **Backend:** Next.js API routes  
  - Policy evaluation and orchestration  
  - Smart contract interaction  
  - Event decoding and persistence  

- **Database:** PostgreSQL  
  - Tables: `intents`, `policies`, `executions`, `audit_artifacts`  
  - Stored data includes tx hash, block number, decoded events, timestamps, and policy evaluation results  
  - Avoid complex ORM; use raw SQL

- **Blockchain:** Foundry (Anvil) + Solidity  
  - `OMAAccount` with `executeIntent()`  
  - `PolicyModule` enforced on the execution require-path  
  - `VenueAdapterMock` emitting `TradeExecuted` events

- **Infrastructure:**  
  - Docker for containerization
  - Containerized Postgres and Anvil instances for local development

## Deliverables & Acceptance Criteria

The PoC is considered complete when:

- A user can submit an intent via the UI  
- Policies are evaluated and clearly shown as pass/fail  
- Execution either reverts with a policy reason or succeeds on-chain  
- A reconciled audit view shows intent parameters, applied policies, tx hash, and decoded events  

Additionally, the PoC must include:

- A minimal threat checklist (intent replay protection, execution authorization, input validation)  
- A Foundry test suite covering:
  - One successful execution path  
  - At least two policy failure paths with asserted revert reasons and event expectations
