import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import { BulkApplyPage } from "./bulk-apply/BulkApplyPage";
import { LandingPage } from "./landing/LandingPage";

export const Router: React.FC = React.memo(() => {
    return (
        <Container>
            <HashRouter>
                <Switch>
                    <Route path="/apply" render={() => <BulkApplyPage />} />

                    {/* Default route */}
                    <Route render={() => <LandingPage />} />
                </Switch>
            </HashRouter>
        </Container>
    );
});

const Container = styled.div`
    margin: 15px;
`;
