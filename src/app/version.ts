// Spielversion – muss zu package.json passen (ein Test prüft das). Die Build-Nummer setzt der Cloud-Build.
export const VERSION = '0.2.0';
export const BUILD: string = import.meta.env.VITE_BUILD ?? 'lokal';
export const VERSION_LABEL = `${VERSION} (${BUILD})`;
