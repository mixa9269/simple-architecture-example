// What a task returns to its caller (a presenter on the frontend, a route on the server).
// The task catches its errors, logs them and reports them here; the caller branches on `ok`.
// Types only: imported with `import type`.

export type TaskResult<T, E = string> = { ok: true; data: T } | { ok: false; error: E };
