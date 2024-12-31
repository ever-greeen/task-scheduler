import { describe, expect, it, vi } from "vitest";

const simnet: any = {
  blockHeight: 100,
  getAccounts: () =>
    new Map([
      ["wallet_1", "address1"],
      ["wallet_2", "address2"],
    ]),
  callPublicFn: vi.fn(),
  callReadOnlyFn: vi.fn(),
  mineBlock: vi.fn(),
};

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;

const ERR_INVALID_INTERVAL = { type: "err", value: 102 };

// Task trait definition
const taskTrait = "task-trait";

describe("Task Trait Tests", () => {
  it("ensures simnet is well initialized", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("should schedule a task successfully", () => {
    const mockTaskId = 1; // Mocked task ID
    simnet.callPublicFn.mockReturnValueOnce({
      result: { ok: true, value: mockTaskId },
    });

    const { result } = simnet.callPublicFn(
      taskTrait,
      "schedule-task",
      [
        { type: "uint", value: 10 },
        { type: "string-ascii", value: "Task A" },
      ],
      address1
    );

    expect(result.ok).toBe(true);
    const taskId = result.value;

    simnet.callReadOnlyFn.mockReturnValueOnce({
      result: {
        some: true,
        value: {
          taskId,
          name: "Task A",
          interval: 10,
          owner: address1,
          status: "SCHEDULED",
        },
      },
    });

    const task = simnet.callReadOnlyFn(
      taskTrait,
      "get-task",
      [{ type: "uint", value: taskId }],
      address1
    );

    expect(task.result.some).toBe(true);
    expect(task.result.value).toMatchObject({
      taskId,
      name: "Task A",
      interval: 10,
      owner: address1,
      status: "SCHEDULED",
    });
  });

  it("should not schedule a task with an invalid interval", () => {
    simnet.callPublicFn.mockReturnValueOnce({
      result: { err: true, value: ERR_INVALID_INTERVAL },
    });

    const { result } = simnet.callPublicFn(
      taskTrait,
      "schedule-task",
      [
        { type: "uint", value: 0 },
        { type: "string-ascii", value: "Invalid Task" },
      ],
      address1
    );

    expect(result.err).toBe(true);
    expect(result.value).toMatchObject(ERR_INVALID_INTERVAL);
  });

  it("should execute a due task successfully", () => {
    const mockTaskId = 2;
    simnet.callPublicFn.mockReturnValueOnce({
      result: { ok: true, value: mockTaskId },
    });

    const { result } = simnet.callPublicFn(
      taskTrait,
      "schedule-task",
      [
        { type: "uint", value: 1 },
        { type: "string-ascii", value: "Task B" },
      ],
      address1
    );
    expect(result.ok).toBe(true);

    const taskId = result.value;
    simnet.mineBlock.mockImplementation(() => {});

    simnet.callPublicFn.mockReturnValueOnce({ result: { ok: true } });

    const execute = simnet.callPublicFn(
      taskTrait,
      "execute-task",
      [{ type: "uint", value: taskId }],
      address1
    );

    expect(execute.result.ok).toBe(true);
  });
});
