import Store from 'electron-store';

export interface UserSettings {
    theme: 'dark' | 'light' | 'system';
    defaultSearchEngine: string;
    homePage: string;
    restoreSession: boolean;
}

interface SettingsStore {
    settings: UserSettings;
}

export class SettingsManager {
    private store: Store<SettingsStore>;

    constructor() {
        this.store = new Store<SettingsStore>({
            name: 'settings',
            defaults: {
                settings: {
                    theme: 'dark',
                    defaultSearchEngine: 'google',
                    homePage: 'about:blank',
                    restoreSession: true,
                },
            },
        });
    }

    getSettings(): UserSettings {
        return this.store.get('settings');
    }

    updateSettings(newSettings: Partial<UserSettings>) {
        const current = this.store.get('settings');
        this.store.set('settings', { ...current, ...newSettings });
        return this.store.get('settings');
    }
}
