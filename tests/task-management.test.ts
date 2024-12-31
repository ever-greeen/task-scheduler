import { describe, expect, it, vi } from "vitest";

const simnet: any = {
  getAccounts: () =>
    new Map([
      ["wallet_1", "address1"],
      ["wallet_2", "address2"],
    ]),
  callPrivateFn: vi.fn(),
};

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const taskManagementModule = "task-management-module";

describe("Task Management Module Tests", () => {
  it("should validate task owner successfully", () => {
    const taskData = {
      owner: address1,
      name: "Test Task",
      interval: 5,
      lastExecuted: 100,
      active: true,
      executionCount: 0,
    };

    simnet.callPrivateFn.mockReturnValueOnce({ result: { ok: true } });

    const { result } = simnet.callPrivateFn(
      taskManagementModule,
      "validate-owner",
      [{ type: "tuple", value: taskData }]
    );

    expect(result.ok).toBe(true);
  });

  it("should reject task owner validation for unauthorized user", () => {
    const taskData = {
      owner: "address2",
      name: "Test Task",
      interval: 5,
      lastExecuted: 100,
      active: true,
      executionCount: 0,
    };

    simnet.callPrivateFn.mockReturnValueOnce({
      result: { ok: false, error: 100 },
    });

    const { result } = simnet.callPrivateFn(
      taskManagementModule,
      "validate-owner",
      [{ type: "tuple", value: taskData }]
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe(100);
  });

  it("should validate a positive interval successfully", () => {
    simnet.callPrivateFn.mockReturnValueOnce({ result: { ok: true } });

    const { result } = simnet.callPrivateFn(
      taskManagementModule,
      "validate-interval",
      [{ type: "uint", value: 10 }]
    );

    expect(result.ok).toBe(true);
  });

  it("should reject an invalid interval", () => {
    simnet.callPrivateFn.mockReturnValueOnce({
      result: { ok: false, error: 102 },
    });

    const { result } = simnet.callPrivateFn(
      taskManagementModule,
      "validate-interval",
      [{ type: "uint", value: 0 }]
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe(102);
  });

  it("should create task data correctly", () => {
    simnet.callPrivateFn.mockReturnValueOnce({
      result: {
        ok: true,
        value: {
          owner: address1,
          name: "New Task",
          interval: 10,
          lastExecuted: 100,
          active: true,
          executionCount: 0,
        },
      },
    });

    const { result } = simnet.callPrivateFn(
      taskManagementModule,
      "create-task-data",
      [
        { type: "string-ascii", value: "New Task" },
        { type: "uint", value: 10 },
      ]
    );

    expect(result.ok).toBe(true);
    expect(result.value).toMatchObject({
      owner: address1,
      name: "New Task",
      interval: 10,
      lastExecuted: 100,
      active: true,
      executionCount: 0,
    });
  });

  it("should toggle task status successfully", () => {
    const taskData = {
      owner: address1,
      name: "Toggle Task",
      interval: 10,
      lastExecuted: 100,
      active: true,
      executionCount: 0,
    };

    simnet.callPrivateFn.mockReturnValueOnce({
      result: {
        ok: true,
        value: {
          ...taskData,
          active: false,
        },
      },
    });

    const { result } = simnet.callPrivateFn(
      taskManagementModule,
      "toggle-status",
      [{ type: "tuple", value: taskData }]
    );

    expect(result.ok).toBe(true);
    expect(result.value.active).toBe(false);
  });
});
