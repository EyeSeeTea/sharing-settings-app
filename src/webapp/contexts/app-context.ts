import React, { useContext } from "react";
import { CompositionRoot } from "../../CompositionRoot";
import { User } from "../../domain/entities/User";
import { D2Api } from "../../types/d2-api";
import i18n from "../../locales";

export interface AppContextState {
    api: D2Api;
    currentUser: User;
    compositionRoot: CompositionRoot;
}

export const AppContext = React.createContext<AppContextState | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    i18n.setDefaultNamespace("sharing-settings-app");
    if (context) {
        return context;
    } else {
        throw new Error("App context uninitialized");
    }
}
