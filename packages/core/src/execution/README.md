# Execution Domain

## Purpose
Responsible for applying decisions to the system safely.

## Responsibilities
- Taking a `Decision` and executing it via `IConfigStore`.
- Emitting events for audit logging via `IEventEmitter`.
- Respecting cooldowns or circuit breakers.

## Inputs
- A `Decision` object.
- `IConfigStore` to enact changes.

## Outputs
- An `Action` object detailing what happened (e.g., EXECUTED or SKIPPED_COOLDOWN).

## Role in IntelliGate
The Execution Domain is the final step in the optimization pipeline, translating abstract decisions into tangible configuration updates.
