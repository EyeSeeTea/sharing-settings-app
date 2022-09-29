import {
    ObjectsTable,
    RowConfig,
    TableAction,
    TableColumn,
    TableSelection,
    TableState,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
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

export const ListDependenciesStep: React.FC<MetadataSharingWizardStepProps> = ({ builder, updateBuilder }) => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [rows, setRows] = useState<MetadataItem[]>([]);
    const [filteredRows, setFilteredRows] = useState<MetadataItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selection, setSelection] = useState<TableSelection[]>([]);
    const [filterOptions, setFilterOptions] = useState<DropdownOption<MetadataModel>[]>([]);
    const [listOptions, setListOptions] = useState<ListOptions>(initialState);

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
            { name: "publicAccess", text: i18n.t("Public Access"), sortable: true },
            { name: "userAccesses", text: i18n.t("Users"), sortable: true },
            { name: "userGroupAccesses", text: i18n.t("User Groups"), sortable: true },
        ],
        [compositionRoot]
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
                name: "include",
                text: i18n.t("Include dependency"),
                multiple: true,
                icon: <AddCircleOutlineIcon />,
                isActive: (rows: MetadataItem[]) => _.every(rows, row => builder.excludedDependencies.includes(row.id)),
                onClick: (selection: string[]) => {
                    updateBuilder(builder => ({
                        ...builder,
                        excludedDependencies: _.difference(builder.excludedDependencies, selection),
                    }));
                },
            },
        ],
        [builder, updateBuilder]
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
                    name: displayName[item] ?? i18n.t("Unknown model"),
                }));

                setRows(rows);
                setFilterOptions(filterModels);
                setListOptions(options => ({ ...options, model: filterModels[0]?.id ?? "dashboards" }));
                setFilteredRows(rows.filter(row => row.metadataType === filterModels[0]?.id));
                setIsLoading(false);
            },
            error => snackbar.error(error)
        );
    }, [builder, compositionRoot, snackbar]);

    const filterComponents = (
        <Dropdown<MetadataModel>
            items={filterOptions}
            onValueChange={applyFilterChanges}
            value={listOptions.model}
            label={i18n.t("Metadata type")}
            hideEmpty={true}
        />
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

const initialState: ListOptions = {
    model: "dashboards",
    sorting: { field: "name", order: "asc" },
    pageSize: 25,
};
