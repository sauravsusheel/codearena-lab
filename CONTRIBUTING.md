# Contributing to UniSphere

Thank you for contributing to the **Chanakya University Unified Autonomous Academic Platform (UniSphere)**!

## Architectural Principles

UniSphere is built around four core resilience pillars:

1. **Decoupled Autonomous Subsystems**:
   - Subsystem code resides in `src/modules/team01_hrms` through `team08_trackit`.
   - Each module must be self-contained and run inside `<ModuleErrorBoundary>`.
2. **CircuitBreaker Protected Operations**:
   - All async operations (data fetching, evaluations, network requests) must wrap calls in a `CircuitBreaker<T>` with a resilient fallback supplier.
3. **Namespaced Storage**:
   - Use `IsolatedStorage('team_name')` for client storage to avoid cross-module key collisions.
4. **Zero Cascading Outages**:
   - A runtime error in one module must never compromise another module or the main portal shell.

## Local Development Workflow

1. Clone repository and install dependencies:
   ```bash
   git clone https://github.com/deepak5256/unisphere.git
   cd unisphere
   npm install
   ```
2. Copy environment template:
   ```bash
   cp .env.example .env
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Verify code before submitting a Pull Request:
   ```bash
   npm run typecheck
   npm run build
   ```
