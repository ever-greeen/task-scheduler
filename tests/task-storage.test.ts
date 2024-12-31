import { describe, expect, it, vi } from "vitest";

const simnet: any = {
  getAccounts: () =>
    new Map([
      ["wallet_1", "address1"],
      ["wallet_2", "address2"],
    ]),
  callReadOnlyFn: vi.fn(),
  callPrivateFn: vi.fn(),
};

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;

const taskStorageModule = "task-storage-module";

describe("Task Storage Module Tests", () => {
  it("should retrieve a task by ID", () => {
    simnet.callReadOnlyFn.mockReturnValueOnce({
      result: {
        some: true,
        value: {
          owner: address1,
          name: "Sample Task",
          interval: 5,
          lastExecuted: 100,
          active: true,
          executionCount: 0,
        },
      },
    });

    const { result } = simnet.callReadOnlyFn(taskStorageModule, "get-task", [
      { type: "uint", value: 1 },
    ]);

    expect(result.some).toBe(true);
    expect(result.value).toMatchObject({
      owner: address1,
      name: "Sample Task",
      interval: 5,
      lastExecuted: 100,
      active: true,
      executionCount: 0,
    });
  });

  it("should return none if the task ID does not exist", () => {
    simnet.callReadOnlyFn.mockReturnValueOnce({ result: { some: false } });

    const { result } = simnet.callReadOnlyFn(taskStorageModule, "get-task", [
      { type: "uint", value: 999 },
    ]);

    expect(result.some).toBe(false);
  });

  it("should set a task successfully", () => {
    simnet.callPrivateFn.mockReturnValueOnce({ result: { ok: true } });

    const taskData = {
      owner: address1,
      name: "New Task",
      interval: 10,
      lastExecuted: 120,
      active: true,
      executionCount: 0,
    };

    const { result } = simnet.callPrivateFn(taskStorageModule, "set-task", [
      { type: "uint", value: 2 },
      { type: "tuple", value: taskData },
    ]);

    expect(result.ok).toBe(true);
  });

  it("should get the next task ID", () => {
    simnet.callReadOnlyFn.mockReturnValueOnce({
      result: { ok: true, value: 2 },
    });

    const { result } = simnet.callReadOnlyFn(
      taskStorageModule,
      "get-next-task-id"
    );

    expect(result.ok).toBe(true);
    expect(result.value).toBe(2);
  });

  it("should increment the task counter", () => {
    simnet.callPrivateFn.mockReturnValueOnce({ result: { ok: true } });

    const { result } = simnet.callPrivateFn(
      taskStorageModule,
      "increment-task-counter"
    );

    expect(result.ok).toBe(true);
  });
});
