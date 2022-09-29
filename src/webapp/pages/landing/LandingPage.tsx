import i18n from "@eyeseetea/d2-ui-components/locales";
import React from "react";
import { useHistory } from "react-router-dom";
import { Card, CardGrid } from "../../components/card-grid/CardGrid";

export const LandingPage: React.FC = () => {
    const history = useHistory();

    const cards: Card[] = [
        {
            title: "Sharing settings management",
            key: "main",
            children: [
                {
                    name: i18n.t("Apply update"),
                    description: i18n.t("Edit sharing settings to data sets, programs and dashboards."),
                    listAction: () => history.push("/apply"),
                },
            ],
        },
        {
            title: "Settings",
            key: "settings",
            children: [
                {
                    name: i18n.t("Settings"),
                    listAction: () => history.push("/settings"),
                },
            ],
        },
    ];

    return <CardGrid cards={cards} />;
};
