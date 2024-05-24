import i18n from "@dhis2/d2-i18n";
import { ObjectsTable, TableState, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MetadataItem, MetadataModel } from "../../../../domain/entities/MetadataItem";
import { ListMetadataResponse, ListOptions } from "../../../../domain/repositories/MetadataRepository";
import Dropdown, { DropdownOption } from "../../../components/dropdown/Dropdown";
import { useAppContext } from "../../../contexts/app-context";
import { MetadataSharingWizardStepProps } from "../SharingWizardSteps";
import { EllipsizedList } from "../../../components/ellipsized-list/EllipsizedList";

export const SelectMetadataStep: React.FC<MetadataSharingWizardStepProps> = ({ builder, updateBuilder }) => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [response, setResponse] = useState<ListMetadataResponse>(initialResponse);
    const [listOptions, setListOptions] = useState<ListOptions>(initialState);

    const columns = useMemo(
        () => [
            { name: "name", text: i18n.t("Name"), sortable: true },
            { name: "id", text: i18n.t("ID"), sortable: true },
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
        []
    );

    const selection = useMemo(() => {
        return builder.baseElements.map(id => ({ id }));
    }, [builder]);

    useEffect(() => {
        setIsLoading(true);

        compositionRoot.metadata.list(listOptions).run(
            data => {
                const rows = data.objects.map((item: MetadataItem) => ({
                    ...item,
                    model: listOptions.model,
                }));

                setResponse({ objects: rows, pager: data.pager });
                setIsLoading(false);
            },
            error => snackbar.error(error)
        );
    }, [compositionRoot, snackbar, listOptions]);

    const onTableChange = useCallback(
        async ({ pagination, sorting, selection }: TableState<MetadataItem>) => {
            updateBuilder(builder => ({ ...builder, baseElements: selection.map(({ id }) => id) }));
            setListOptions(options => ({
                ...options,
                pageSize: pagination.pageSize,
                page: pagination.page,
                sorting: { field: String(sorting.field), order: sorting.order },
            }));
        },
        [updateBuilder]
    );

    const filterComponents = (
        <Dropdown<MetadataModel>
            items={filterModels}
            onValueChange={model => setListOptions(options => ({ ...options, model }))}
            value={listOptions.model}
            label={i18n.t("Metadata type")}
            hideEmpty={true}
        />
    );

    return (
        <ObjectsTable<MetadataItem>
            rows={response.objects}
            columns={columns}
            onChange={onTableChange}
            pagination={response.pager}
            sorting={{ field: "displayName", order: "asc" }}
            loading={isLoading}
            initialState={initialState}
            selection={selection}
            forceSelectionColumn={true}
            filterComponents={filterComponents}
            onChangeSearch={search => setListOptions(options => ({ ...options, search }))}
            searchBoxLabel={i18n.t(`Search by name`)}
        />
    );
};

const initialState: ListOptions = {
    model: "dashboards",
    sorting: { field: "name", order: "asc" },
    pageSize: 10,
};

const initialResponse: ListMetadataResponse = {
    objects: [],
    pager: { pageSize: 10, page: 1, total: 0 },
};

const filterModels: DropdownOption<MetadataModel>[] = [
    { id: "dataSets", name: i18n.t("Data Sets") },
    { id: "dashboards", name: i18n.t("Dashboards") },
    { id: "programs", name: i18n.t("Programs") },
    { id: "dataElementGroups", name: i18n.t("Data Element Group") },
    { id: "dataElementGroupSets", name: i18n.t("Data Element Group Set") },
    { id: "organisationUnitGroups", name: i18n.t("Organisation Unit Group") },
    { id: "organisationUnitGroupSets", name: i18n.t("Organisation Unit Group Set") },
];
