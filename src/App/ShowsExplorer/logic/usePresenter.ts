import { useSearchUrl } from './useSearchUrl';

/** The search lives in the store; this component only binds it to the URL. */
export function usePresenter() {
  useSearchUrl();
}
