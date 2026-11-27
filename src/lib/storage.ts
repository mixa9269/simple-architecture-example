// Small wrapper over localStorage: private mode or disabled storage must not break the app.

export const readStored = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStored = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Not saved: the session lasts until the page is reloaded.
  }
};

export const removeStored = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing to remove.
  }
};
