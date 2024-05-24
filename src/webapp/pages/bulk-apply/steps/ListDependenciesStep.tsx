import {
    ObjectsTable,
    RowConfig,
    TableAction,
    TableColumn,
    TableSelection,
    TableState,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import Button from "@material-ui/core/Button";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { displayName, MetadataItem, MetadataModel } from "../../../../domain/entities/MetadataItem";
import { Ref } from "../../../../domain/entities/Ref";
import { ListOptions } from "../../../../domain/repositories/MetadataRepository";
import i18n from "../../../../locales";
import Dropdown, { DropdownOption } from "../../../components/dropdown/Dropdown";
import { useAppContext } from "../../../contexts/app-context";
import { MetadataSharingWizardStepProps } from "../SharingWizardSteps";
import styled from "styled-components";
import { EllipsizedList } from "../../../components/ellipsized-list/EllipsizedList";

export const ListDependenciesStep: React.FC<MetadataSharingWizardStepProps> = ({ builder, updateBuilder }) => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [rows, setRows] = useState<MetadataItem[]>([]);
    const [globalExclusions, setGlobalExclusions] = useState<string[]>([]);
    const [filteredRows, setFilteredRows] = useState<MetadataItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selection, setSelection] = useState<TableSelection[]>([]);
    const [filterOptions, setFilterOptions] = useState<DropdownOption<MetadataModel>[]>([]);
    const [listOptions, setListOptions] = useState<ListOptions>(initialState);
    const [selectedModel, setSelectedModel] = useState<MetadataModel>();

    const columns = useMemo(
        (): TableColumn<MetadataItem>[] => [
            { name: "name", text: i18n.t("Name"), sortable: true },
            { name: "id", text: i18n.t("ID"), sortable: true },
            {
                name: "metadataType",
                text: i18n.t("Metadata Type"),
                sortable: false,
                getValue: (row: MetadataItem) => compositionRoot.metadata.getModelName(String(row.metadataType)),
            },
            {
                name: "publicAccess",
                text: i18n.t("Public Access"),
                sortable: true,
                getValue: (row: MetadataItem) => row.sharing.public ?? row.publicAccess,
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
            {
                name: "status",
                text: i18n.t("Exclusion Status"),
                sortable: true,
                getValue: (row: MetadataItem) =>
                    builder.excludedDependencies.includes(row.id) ? "Excluded" : "Included",
            },
        ],
        [builder.excludedDependencies, compositionRoot.metadata]
    );

    const actions = useMemo(
        (): TableAction<MetadataItem>[] => [
            {
                name: "exclude",
                text: i18n.t("Exclude dependency"),
                multiple: true,
                icon: <RemoveCircleOutlineIcon />,
                isActive: (rows: MetadataItem[]) => _.some(rows, row => !builder.excludedDependencies.includes(row.id)),
                onClick: (selection: string[]) => {
                    updateBuilder(builder => ({
                        ...builder,
                        excludedDependencies: _.uniq([...builder.excludedDependencies, ...selection]),
                    }));
                },
            },
            {
                name: "excludeExcept",
                text: i18n.t("Exclude all but selected"),
                multiple: true,
                icon: <RemoveCircleOutlineIcon />,
                isActive: (rows: MetadataItem[]) => _.some(rows, row => !builder.excludedDependencies.includes(row.id)),
                onClick: (selection: string[]) => {
                    const rowsToExclude = _.difference(
                        filteredRows.map(row => row.id),
                        selection
                    );
                    updateBuilder(builder => ({
                        ...builder,
                        excludedDependencies: _.uniq([...builder.excludedDependencies, ...rowsToExclude]),
                    }));
                },
            },
            {
                name: "include",
                text: i18n.t("Include dependency"),
                multiple: true,
                icon: <AddCircleOutlineIcon />,
                isActive: (rows: MetadataItem[]) =>
                    _.every(
                        rows,
                        row => builder.excludedDependencies.includes(row.id) && !globalExclusions.includes(row.id)
                    ),
                onClick: (selection: string[]) => {
                    updateBuilder(builder => ({
                        ...builder,
                        excludedDependencies: _.difference(builder.excludedDependencies, selection),
                    }));
                },
            },
        ],
        [builder.excludedDependencies, filteredRows, globalExclusions, updateBuilder]
    );

    const onTableChange = useCallback(({ selection }: TableState<Ref>) => setSelection(selection), [setSelection]);

    const rowConfig = useCallback(
        (row: MetadataItem): RowConfig => {
            const isExcluded = builder.excludedDependencies.includes(row.id);
            return isExcluded ? { style: { backgroundColor: "#ffcdd2" } } : {};
        },
        [builder]
    );

    const applyFilterChanges = useCallback(
        (model: MetadataModel) => {
            setSelectedModel(model);
            setListOptions(options => ({ ...options, model }));
            setFilteredRows(rows.filter(row => row.metadataType === model));
        },
        [rows]
    );

    const onSearchChange = useCallback(
        (search: string) => {
            setListOptions(options => ({ ...options, search }));
            if (search === "") {
                setFilteredRows(rows.filter(row => row.metadataType === listOptions.model));
            } else {
                setFilteredRows(filteredRows.filter(row => row.name.includes(search)));
            }
        },
        [listOptions, filteredRows, rows]
    );

    useEffect(() => {
        setIsLoading(true);
        compositionRoot.metadata.listDependencies(builder.baseElements).run(
            data => {
                const rows = _(data)
                    .mapValues((value, key) => {
                        return value.map(item => ({ ...item, metadataType: key }));
                    })
                    .values()
                    .flatten()
                    .value();

                const filterModels = _.keys(data).map(item => ({
                    id: item as MetadataModel,
                    name: displayName[item] ?? i18n.t(_.startCase(item)),
                }));

                setRows(rows);
                setFilterOptions(filterModels);
                setListOptions(options => ({ ...options, model: filterModels[0]?.id ?? "dashboards" }));
                setFilteredRows(rows.filter(row => row.metadataType === (selectedModel ?? filterModels[0]?.id)));

                setIsLoading(false);
            },
            error => snackbar.error(error)
        );
    }, [builder, compositionRoot, selectedModel, snackbar]);

    useEffect(() => {
        compositionRoot.excludedDependencies.list().run(
            data => {
                const plainIds = data.map(({ id }) => id);
                setGlobalExclusions(plainIds);
                updateBuilder(builder => ({
                    ...builder,
                    excludedDependencies: _.uniq([...builder.excludedDependencies, ...plainIds]),
                }));
            },
            error => snackbar.error(error)
        );
    }, [compositionRoot.excludedDependencies, snackbar, updateBuilder]);

    const filterComponents = (
        <>
            <Dropdown<MetadataModel>
                items={filterOptions}
                onValueChange={applyFilterChanges}
                value={selectedModel ?? listOptions.model}
                label={i18n.t("Metadata type")}
                hideEmpty={true}
            />
            <StyledButton
                variant="contained"
                color="primary"
                onClick={() =>
                    updateBuilder(builder => ({
                        ...builder,
                        excludedDependencies: [],
                    }))
                }
            >
                Reset exclusions
            </StyledButton>
        </>
    );

    return (
        <div>
            <ObjectsTable<MetadataItem>
                rows={filteredRows}
                columns={columns}
                sorting={{ field: "displayName", order: "asc" }}
                initialState={initialState}
                forceSelectionColumn={true}
                loading={isLoading}
                actions={actions}
                onChange={onTableChange}
                selection={selection}
                rowConfig={rowConfig}
                filterComponents={filterComponents}
                searchBoxLabel={i18n.t("Search by name")}
                onChangeSearch={onSearchChange}
            />
        </div>
    );
};

const StyledButton = styled(Button)`
    margin-left: 1rem;
`;

const initialState: ListOptions = {
    model: "dashboards",
    sorting: { field: "name", order: "asc" },
    pageSize: 25,
};
