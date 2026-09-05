// Custom Brand Logo Storage & Event Dispatcher
const LOGO_STORAGE_KEY = 'SWC_CUSTOM_BRAND_LOGO_V1';

// Custom event name for cross-component reactive updates
export const LOGO_UPDATED_EVENT = 'swc_logo_updated';

export function getCustomLogo(): string | null {
  try {
    return localStorage.getItem(LOGO_STORAGE_KEY) || null;
  } catch (err) {
    console.error('Error reading custom logo from storage:', err);
    return null;
  }
}

export function setCustomLogo(dataUrl: string): void {
  try {
    localStorage.setItem(LOGO_STORAGE_KEY, dataUrl);
    window.dispatchEvent(new CustomEvent(LOGO_UPDATED_EVENT, { detail: dataUrl }));
  } catch (err) {
    console.error('Error saving custom logo to storage:', err);
  }
}

export function removeCustomLogo(): void {
  try {
    localStorage.removeItem(LOGO_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(LOGO_UPDATED_EVENT, { detail: null }));
  } catch (err) {
    console.error('Error removing custom logo from storage:', err);
  }
}
