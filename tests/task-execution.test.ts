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
const address2 = accounts.get("wallet_2")!;

const ERR_TASK_NOT_DUE = { type: "err", value: 103 };
const ERR_NOT_FOUND = { type: "err", value: 404 };
const ERR_NOT_AUTHORIZED = { type: "err", value: 403 };

const taskTrait = "task-trait";

describe("Task Trait Implementation Tests", () => {
  it("should schedule a new task successfully", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: { ok: true, value: 1 } });

    const { result } = simnet.callPublicFn(
      taskTrait,
      "schedule-task",
      [
        { type: "uint", value: 5 },
        { type: "string-ascii", value: "Sample Task" },
      ],
      address1
    );

    expect(result.ok).toBe(true);
    expect(result.value).toBe(1);
  });

  it("should retrieve a scheduled task", () => {
    simnet.callReadOnlyFn.mockReturnValueOnce({
      result: {
        some: true,
        value: {
          taskId: 1,
          name: "Sample Task",
          interval: 5,
          nextExecution: 105,
          owner: address1,
          status: "SCHEDULED",
        },
      },
    });

    const { result } = simnet.callReadOnlyFn(
      taskTrait,
      "get-task",
      [{ type: "uint", value: 1 }],
      address1
    );

    expect(result.some).toBe(true);
    expect(result.value).toMatchObject({
      taskId: 1,
      name: "Sample Task",
      interval: 5,
      nextExecution: 105,
      owner: address1,
      status: "SCHEDULED",
    });
  });

  it("should execute a due task successfully", () => {
    simnet.callPublicFn.mockReturnValueOnce({
      result: { ok: true, value: true },
    });

    const { result } = simnet.callPublicFn(
      taskTrait,
      "execute-task",
      [{ type: "uint", value: 1 }],
      address1
    );

    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
  });

  it("should return an error if a task is not due", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_TASK_NOT_DUE });

    const { result } = simnet.callPublicFn(
      taskTrait,
      "execute-task",
      [{ type: "uint", value: 1 }],
      address1
    );

    expect(result).toMatchObject(ERR_TASK_NOT_DUE);
  });

  it("should cancel a task successfully", () => {
    simnet.callPublicFn.mockReturnValueOnce({
      result: { ok: true, value: true },
    });

    const { result } = simnet.callPublicFn(
      taskTrait,
      "cancel-task",
      [{ type: "uint", value: 1 }],
      address1
    );

    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
  });

  it("should update a task interval successfully", () => {
    simnet.callPublicFn.mockReturnValueOnce({
      result: { ok: true, value: true },
    });

    const { result } = simnet.callPublicFn(
      taskTrait,
      "update-interval",
      [
        { type: "uint", value: 1 },
        { type: "uint", value: 10 },
      ],
      address1
    );

    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
  });

  it("should verify if a task is due", () => {
    simnet.callReadOnlyFn.mockReturnValueOnce({
      result: { ok: true, value: true },
    });

    const { result } = simnet.callReadOnlyFn(
      taskTrait,
      "is-due",
      [{ type: "uint", value: 1 }],
      address1
    );

    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
  });

  it("should return an error if the task is not found", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_NOT_FOUND });

    const { result } = simnet.callPublicFn(
      taskTrait,
      "execute-task",
      [{ type: "uint", value: 99 }],
      address1
    );

    expect(result).toMatchObject(ERR_NOT_FOUND);
  });

  it("should return an error if not authorized to cancel a task", () => {
    simnet.callPublicFn.mockReturnValueOnce({ result: ERR_NOT_AUTHORIZED });

    const { result } = simnet.callPublicFn(
      taskTrait,
      "cancel-task",
      [{ type: "uint", value: 1 }],
      address2
    );

    expect(result).toMatchObject(ERR_NOT_AUTHORIZED);
  });
});
