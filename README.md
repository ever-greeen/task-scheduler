# Task Scheduler Smart Contract

A Clarity smart contract for scheduling and managing automated tasks on the Stacks blockchain.

## Features

- Task registration with customizable execution intervals
- Task status management (active/inactive)
- Execution tracking and history

## Project Structure

The project is organized into several modules:
- `task-trait.clar`: Defines the interface for task operations
- `task-storage.clar`: Handles data storage and retrieval
- `task-execution.clar`: Manages task execution logic
- `task-management.clar`: Provides task management functions
- `task-scheduler.clar`: Main contract that integrates all modules

## Prerequisites

- Clarity CLI
- Node.js >= 14
- NPM or Yarn
- Vitest for testing

## Installation

```bash
git clone https://github.com/yourusername/task-scheduler
cd task-scheduler
npm install
```

## Development

1. Start the Clarity REPL:
```bash
clarity-repl
```

2. Run tests:
```bash
npm test
```

3. Deploy contract:
```bash
npm run deploy
```

## Testing

The project uses Vitest for testing. Tests are organized into:
- Unit tests: Test individual modules
- Integration tests: Test the complete contract functionality

Run tests with:
```bash
npm run test           # Run all tests
```

## Contract Interaction

### Register a Task
```clarity
(contract-call? .task-scheduler register-task "backup" u100)
```

### Update Task Interval
```clarity
(contract-call? .task-scheduler update-task-interval u1 u150)
```

### Toggle Task Status
```clarity
(contract-call? .task-scheduler toggle-task-status u1)
```

### Execute Task
```clarity
(contract-call? .task-scheduler execute-task u1)
```

## License

MIT License - see LICENSE file for details