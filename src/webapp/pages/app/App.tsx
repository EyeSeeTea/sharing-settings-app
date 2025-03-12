import { HeaderBar } from "@dhis2/ui";
import { SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { MuiThemeProvider } from "@material-ui/core/styles";
import _ from "lodash";
//@ts-ignore
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React, { useEffect, useState } from "react";
import { appConfig } from "../../../app-config";
import { getCompositionRoot } from "../../../CompositionRoot";
import { Instance } from "../../../data/entities/Instance";
import { D2Api } from "../../../types/d2-api";
import { Feedback } from "@eyeseetea/feedback-component";
import Share from "../../components/share/Share";
import { AppContext, AppContextState } from "../../contexts/app-context";
import { Router } from "../Router";
import "./App.css";
import muiThemeLegacy from "./themes/dhis2-legacy.theme";
import { muiTheme } from "./themes/dhis2.theme";

export interface AppProps {
    api: D2Api;
    d2: D2;
    instance: Instance;
}

export const App: React.FC<AppProps> = React.memo(({ api, d2, instance }) => {
    const [showShareButton, setShowShareButton] = useState(false);
    const [loading, setLoading] = useState(true);
    const [appContext, setAppContext] = useState<AppContextState | null>(null);
    const [username, setUsername] = useState("");

    useEffect(() => {
        async function setup() {
            const compositionRoot = getCompositionRoot(instance);
            const { data: currentUser } = await compositionRoot.instance.getCurrentUser().runAsync();
            if (!currentUser) throw new Error("User not logged in");

            const isShareButtonVisible = _(appConfig).get("appearance.showShareButton") || false;

            setAppContext({ api, currentUser, compositionRoot });
            setUsername(currentUser.username);
            setShowShareButton(isShareButtonVisible);
            setLoading(false);
        }
        setup();
    }, [d2, api, instance]);

    if (loading) return null;

    return (
        <MuiThemeProvider theme={muiTheme}>
            <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                <SnackbarProvider>
                    <HeaderBar appName="Sharing Settings App" />

                    <div id="app" className="content">
                        <AppContext.Provider value={appContext}>
                            <Router />
                        </AppContext.Provider>
                    </div>

                    <Share visible={showShareButton} />
                    <Feedback options={appConfig.feedback} username={username} />
                </SnackbarProvider>
            </OldMuiThemeProvider>
        </MuiThemeProvider>
    );
});

type D2 = object;
