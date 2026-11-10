// Title, meta and three summary lines.
const LINES = [
  { key: 'title', width: '70%', height: 20 },
  { key: 'meta', width: '35%', height: 12 },
  { key: 'summary-1', width: '100%', height: 12 },
  { key: 'summary-2', width: '95%', height: 12 },
  { key: 'summary-3', width: '60%', height: 12 },
];

export function usePresenter() {
  return {
    lines: LINES,
  };
}
