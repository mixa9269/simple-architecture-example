---
description: Simple Architecture — usePresenter is the bridge between the View and the tasks: calls tasks, keeps their data locally and passes it down as props, returns ready-to-render values (contract with the View); reads only global data from the store
paths:
  - "src/**/logic/**"
---

# Presenter layer: `usePresenter`

A component **with logic** has a `logic/usePresenter.ts` hook (see `sa-logic-folder.md`). It serves the View: UI state, effects, derived values, handlers. It returns a flat object with everything the View needs. It also knows **which task to call on which event**: it is the bridge between the UI and the business logic (`sa-tasks-layer.md`).

| Presenter (`logic/usePresenter.ts`, hooks) | Task (`logic/tasks/`) |
|---|---|
| UI state: field value, loading/pending, opened drawer | the use case: what to send, what to store |
| handlers: `onAddToCart`, `onPageChange` | `addToCart(id)`, `loadProducts(params, signal)` |
| toasts, navigation (`useNavigate`, see `sa-routing.md`), focus (they depend on the environment) | returns `{ ok, data }` / `{ ok: false, error }`; no React, no Mantine |
| branches on `result.ok` | catches and logs its own errors |
| keeps the screen's data from tasks (`useState`); reads global data (`useSelector`); may `dispatch` a set-only action for a trivial UI change | returns data; writes the store for global data (`store.dispatch`) |

A component **without logic** (static texts, layout, a constant list rendered with `map`) has no presenter: keep it simple, write it in JSX (see `sa-view-layer.md`).

## Signature: `usePresenter(props: Props)`

- The presenter takes the component's props **whole**, typed by `Props` from `./types.ts`, and destructures them in its body. Props it does not need are simply not destructured.
- A presenter of a component without props takes no parameters.
- ESLint: a destructured `usePresenter` parameter is an error.

```ts
// ProductCard/logic/usePresenter.ts
import type { Props } from '~/App/Shop/ProductList/ProductCard/types';

export function usePresenter(props: Props) {
  const { product } = props;

  return { title: product.title, price: formatPrice(product.price) };
}
```

## Splitting

When `usePresenter` grows, split it by meaning into separate hooks (`useProductsUrl.ts`, `useIsSlow.ts`) and plain functions (`formatPrice.ts`, `getStatus.ts`) in the same `logic/` folder. Business logic (talking to the server, changing global data) goes to tasks. `usePresenter` then reads like a table of contents: it calls tasks, keeps their data, and hands the View what it renders.

```ts
// CategoryChips/logic/usePresenter.ts — gets the data as props, returns ready-to-render values
export function usePresenter(props: Props) {
  const { categories, selected, onChange } = props;

  return {
    items: [{ value: ALL, label: 'All' }, ...categories.map((c) => ({ value: c, label: c }))],
    value: selected ?? ALL,
    onChange: (value: string) => onChange(value === ALL ? null : value),
  };
}
```

## The flow

Event or mount → **Presenter** calls the **Task** → the task returns `{ ok, data | error }` → the presenter keeps it in `useState` → passes it down as **props** → **View**.

- **A screen's data lives in the presenter of the component that owns it** — the nearest component that all its users sit under — and goes down as props. It is not put in the store for convenience (see `sa-entities.md`).
- **Global data** (the store, e.g. the cart) is read with `useSelector` only by the presenters that need it, e.g. the cart button in the header and the add-to-cart buttons.
- **View ↔ Presenter is a contract** (see `sa-dependencies.md`): the View asks for `value`, `options`, `onChange`, `disabled`; the presenter delivers exactly that, already formatted. The View never decides logic, and store or task changes stop at the presenter.

Example — a screen owns its data in one hook and gives every child exactly its props:

```ts
// Shop/logic/useProducts.ts (shortened)
const [params, setParams] = useState(initialParams);              // what was asked
const [page, setPage] = useState<ProductsPage | null>(null);      // last page — stays on screen while loading
const [error, setError] = useState<string | null>(null);
const [isFetching, setIsFetching] = useState(initialParams !== null);

const load = (next: ProductQuery) => {
  controller.current?.abort();
  const own = (controller.current = new AbortController());
  setParams(next);
  setIsFetching(true);
  loadProducts(next, own.signal).then((result) => {
    if (own.signal.aborted) return;
    setIsFetching(false);
    setPage(result.ok ? result.data : null);
    setError(result.ok ? null : result.error);
  });
};

// Shop/logic/usePresenter.ts → one props object per child, typed by the child's Props
return { searchField, productList, categoryChips, pagination };

// Shop.tsx
<SearchField {...searchField} />
{categoryChips && <CategoryChips {...categoryChips} />}
```

Reference implementation in this repo: `src/App/ShowsExplorer/logic/` (`useShowsSearch.ts`, `usePresenter.ts`).

## State and requests

Keep the data flow simple and predictable:

- **Data is loaded through tasks**, from the handler that caused it (`onChange → loadPage(page)`) or once on mount (`useEffect` → task → `setState` in `.then`). Not in an effect reacting to state that a handler could have handled.
- **`useEffect` only for mount/startup and subscriptions/timers**: the first load, restoring from the URL, syncing the URL, a "slow request" timer. Never to react to the URL or to state that a handler could have handled: the URL is an output of the state (see `sa-routing.md`).
- **No `setState` during render.** Not even guarded by a condition — it is easy to loop and hard to read.
- **In an effect, `setState` only in async callbacks** (`.then`, a timer callback), never synchronously in its body.
- **Debounce in the handler**: a timer in `useRef`, cleared on every change and on unmount; when it fires it calls the load.
- **One cancellation mechanism: `AbortController`** in a `useRef` of the presenter that owns the state. A new load aborts the previous one; pass its `signal` to the task and keep nothing from an aborted load (`if (own.signal.aborted) return`).
- **Keep the last data on screen while the next load runs**: don't clear `page` when starting a load; a status like `loading` comes from `isFetching`, not from emptying the data.
- **The first load on mount** starts in `useEffect` without a synchronous `setState`: the initial state (`params`, `isFetching = true`) comes from `useState` initializers (e.g. read from the URL), the effect only starts the task and sets state in its continuation.
- **Calling a task**: `const result = await task()`, then branch on `result.ok` (data → render or toast; `result.error` → error state or toast). No try/catch around a task: it never throws, it already logged the error. Keep pending flags local (`setIsPending(true)` before, `false` after). No Redux round-trip for loading flags.
- **`useCallback` / `useMemo` only where a stable reference matters** (a dependency of an effect, a prop of a memoized child, an expensive derivation).

```ts
// AddToCartButton/logic/usePresenter.ts
const onAdd = async () => {
  setIsPending(true);
  const result = await addToCart(product.id);
  setIsPending(false);
  notifications.show(result.ok ? getAddedToast(result.data) : getErrorToast(result.error));
};

// HomePage/logic/usePresenter.ts — the task returns the data, the presenter keeps it
const [videos, setVideos] = useState<Video[]>([]);
const [error, setError] = useState<string | null>(null);
useEffect(() => {
  loadHomePageVideos().then((result) =>
    result.ok ? setVideos(result.data) : setError(result.error),
  );
}, []);
```

## Writing the store directly

A task is for a use case. A **trivial UI change** with no business meaning — open the drawer, collapse the sidebar — needs no task: the presenter dispatches the set-only action itself (`dispatch(drawerOpened(true))` with `useDispatch`). As soon as the write has a rule (a server call, a check, a computation), it is a task.

## Bad

- `export function usePresenter({ show }: Props)` — props destructured in the signature.
- A props interface declared in `usePresenter.ts` (it belongs in `types.ts`).
- A presenter that only returns constants (`return { title: 'Shop' }`) — write them in JSX.
- `if (!query && result) setResult(null);` in the hook body — reset in the handler instead.
- Several "is this answer current?" mechanisms at once (`AbortController` + `requestKey` + answer ids).
- One 250-line `usePresenter` with search, debounce, abort, pagination and filtering all inline.
- `fetch`/`callApi`/`api.*` or a business rule right in the presenter: that is a task's job. A direct `dispatch` is fine only for a trivial UI change (see below).
- `try { await task() } catch {…}` in the presenter: tasks report errors in their result.
- `useEffect(() => { load(request) }, [request])`: load from the handler that changed the request.
- Putting a screen's data, loading flag or error into the store so that children can read it — keep it in the owning presenter and pass props.
- `useCallback` around every handler "just in case".
- A task that shows a toast or navigates: the presenter does that with the task's result.
- Data rules (filtering, pagination, caching) in the presenter: they belong to the server (`sa-backend.md`).
- Returning raw API objects and letting the View dig into them (`item.product.images?.[0]?.url`); format data for the View in the presenter.

## Checklist

- Presenter exists only if the component has logic; it returns only what the View renders or calls.
- One concern per hook/function file; name it after the concern.
- Server calls and store writes with any rule go through tasks; toasts/navigation stay here.
- Each file stays under 120 lines (see `sa-file-size-120.md`).
