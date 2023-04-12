import { expect, test } from "@jest/globals";
import { debounce } from "./index";

async function sleep(millis: number) {
  return new Promise<undefined>((res) => setTimeout(res, millis));
}

test("Debounce collapses multiple calls into one", async () => {
  let i = 0;
  const action = debounce(() => i++, { delay: 250 });
  action();
  action();
  action();
  await sleep(500);
  expect(i).toBe(1);
});

test("Debounce has a default delay", async () => {
  let i = 0;
  const action = debounce(() => (i = 42));
  action();
  await sleep(500);
  expect(i).toBe(0);
  await sleep(1000);
  expect(i).toBe(42);
});

test("Debounce can have a custom delay", async () => {
  let i = 0;
  const action = debounce(() => (i = 42), { delay: 250 });
  action();
  await sleep(500);
  expect(i).toBe(42);
});

test("Debounce can return a promise", async () => {
  let i = 0;
  const action = debounce(() => (i = 42), { delay: 250, promise: true });
  await action();
  expect(i).toBe(42);
});

test("Debounce rethrows errors when returning a promise", async () => {
  const action = debounce(
    () => {
      throw new Error("Oh no");
    },
    { delay: 250, promise: true }
  );
  await expect(action).rejects.toThrow();
});

test("Debounce knows its own delay", async () => {
  const action = debounce(() => null, { delay: 123 });
  expect(action.delay).toBe(123);
});

test("Debounce can be cancelled", async () => {
  let i = 0;
  const action = debounce(() => (i = 42), { delay: 250 });
  action();
  action.cancel();
  await sleep(500);
  expect(i).toBe(0);
});

test("Debounce can be called again after cancellation", async () => {
  let i = 0;
  const action = debounce(() => (i = 42), { delay: 250 });
  action();
  action.cancel();
  action();
  await sleep(500);
  expect(i).toBe(42);
});
