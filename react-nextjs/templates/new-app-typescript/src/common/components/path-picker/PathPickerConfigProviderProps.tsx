'use client'

import { createContext, ReactNode } from "react";
import { AppFileStyles } from "./PathPicker";

export interface AppFileConfig {
    defaults?: AppFileStyles
    prepend?: AppFileStyles
    append?: AppFileStyles
}

export const AppFileConfigContext = createContext<AppFileConfig>({});

export interface AppFileConfigProviderProps extends AppFileConfig {
    children?: ReactNode;
}

export function AppFileConfigProvider({ children, ...config }: AppFileConfigProviderProps) {
    return (
        <AppFileConfigContext.Provider value={config}>
            {children}
        </AppFileConfigContext.Provider>
    );
}