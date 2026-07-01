# Engine Domain

## Purpose
The primary facade for consuming the Core Engine.

## Responsibilities
- Orchestrating the flow: Analysis -> Providers/Decision -> Execution.
- Wiring up dependencies via Constructor Injection.

## Inputs
- All shared interfaces (`IMetricsStore`, `IConfigStore`, `IProvider`, `ILogger`, `IEventEmitter`).

## Outputs
- None (Side-effect: configurations are updated).

## Role in IntelliGate
This is the only class the Backend or SDK needs to instantiate to run the full IntelliGate optimization cycle.
