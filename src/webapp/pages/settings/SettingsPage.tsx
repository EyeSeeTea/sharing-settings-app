import i18n from "@dhis2/d2-i18n";
import { TableAction, ObjectsTable, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Button } from "@dhis2/ui";
import React, { useEffect, useMemo } from "react";
import { PageHeader } from "../../components/page-header/PageHeader";
import { useGoBack } from "../../hooks/useGoBack";
import { ListOptions } from "../../../domain/repositories/MetadataRepository";
import { MetadataItem } from "../../../domain/entities/MetadataItem";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import { EllipsizedList } from "../../components/ellipsized-list/EllipsizedList";
import { useSettingsPage } from "./useSettingsPage";
import { Filter } from "./Filter";

export const SettingsPage: React.FC = () => {
    const goBack = useGoBack();
    const snackbar = useSnackbar();

    const {
        errorMessage,
        successMessage,
        isLoading,
        response,
        selection,
        listOptions,
        excludeDependency,
        getModelName,
        includeDependency,
        isExcludeActive,
        isIncludeActive,
        onChangeSearch,
        onChangeModel,
        onTableChange,
        rowConfig,
        saveExcludedDependencies,
    } = useSettingsPage();

    useEffect(() => {
        if (!errorMessage) return;
        snackbar.error(errorMessage);
    }, [errorMessage, snackbar]);

    useEffect(() => {
        if (!successMessage) return;
        snackbar.success(successMessage);
    }, [successMessage, snackbar]);

    const columns = useMemo(
        () => [
            { name: "name", text: i18n.t("Name"), sortable: true },
            { name: "id", text: i18n.t("ID"), sortable: true },
            {
                name: "model",
                text: i18n.t("Metadata Type"),
                sortable: false,
                getValue: getModelName,
            },
            {
                name: "publicAccess",
                text: i18n.t("Public Access"),
                sortable: true,
                getValue: (row: MetadataItem) => row.publicAccess ?? row.sharing.public,
            },
            {
                name: "userAccesses",
                text: i18n.t("Users"),
                sortable: true,
                getValue: (row: MetadataItem) => (
                    <EllipsizedList items={Object.values(row.userAccesses ?? row.sharing.users)} />
                ),
            },
            {
                name: "userGroupAccesses",
                text: i18n.t("User Groups"),
                sortable: true,
                getValue: (row: MetadataItem) => (
                    <EllipsizedList items={Object.values(row.userGroupAccesses ?? row.sharing.userGroups)} />
                ),
            },
        ],
        [getModelName]
    );

    const actions = useMemo(
        (): TableAction<MetadataItem>[] => [
            {
                name: "exclude",
                text: i18n.t("Exclude dependency"),
                multiple: true,
                icon: <RemoveCircleOutlineIcon />,
                isActive: isExcludeActive,
                onClick: excludeDependency,
            },
            {
                name: "include",
                text: i18n.t("Include dependency"),
                multiple: true,
                icon: <AddCircleOutlineIcon />,
                isActive: isIncludeActive,
                onClick: includeDependency,
            },
        ],
        [excludeDependency, includeDependency, isExcludeActive, isIncludeActive]
    );

    return (
        <>
            <PageHeader title={i18n.t("Global exclusion settings")} onBackClick={goBack} />
            <ObjectsTable<MetadataItem>
                rows={response.objects}
                columns={columns}
                onChange={onTableChange}
                pagination={response.pager}
                sorting={{ field: "displayName", order: "asc" }}
                loading={isLoading}
                initialState={initialState}
                forceSelectionColumn={true}
                filterComponents={<Filter model={listOptions.model} onChangeModel={onChangeModel} />}
                onChangeSearch={onChangeSearch}
                searchBoxLabel={i18n.t("Search by name")}
                actions={actions}
                rowConfig={rowConfig}
                selection={selection}
            />
            <Button type="submit" onClick={saveExcludedDependencies} primary>
                {i18n.t("Save global excluded dependencies")}
            </Button>
        </>
    );
};

const initialState: ListOptions = {
    model: "dashboards",
    sorting: { field: "name", order: "asc" },
    pageSize: 10,
};
