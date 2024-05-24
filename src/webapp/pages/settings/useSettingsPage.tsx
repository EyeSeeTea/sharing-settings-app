import { RowConfig, TableState } from "@eyeseetea/d2-ui-components";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MetadataItem, MetadataModel } from "../../../domain/entities/MetadataItem";
import { ListMetadataResponse, ListOptions } from "../../../domain/repositories/MetadataRepository";
import { useAppContext } from "../../contexts/app-context";
import _ from "lodash";

interface Builder {
    baseElements: string[];
    excludedDependencies: string[];
    includedDependencies: string[];
}

export function useSettingsPage() {
    const { compositionRoot } = useAppContext();

    const [builder, updateBuilder] = useState<Builder>(defaultBuilder);
    const [listOptions, setListOptions] = useState<ListOptions>(initialState);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [response, setResponse] = useState<ListMetadataResponse>(initialResponse);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        setIsLoading(true);

        compositionRoot.metadata.list(listOptions).run(
            metadata => {
                const { objects, pager } = metadata;

                const rows = objects.map(item => ({
                    ...item,
                    model: listOptions.model,
                }));
                setResponse({ objects: rows, pager: pager });
                setIsLoading(false);
            },
            error => setErrorMessage(error)
        );
    }, [compositionRoot, listOptions]);

    useEffect(() => {
        compositionRoot.excludedDependencies.list().run(
            excludedDependencies => {
                const excludedIds = excludedDependencies.map(({ id }) => id);
                updateBuilder(builder => ({ ...builder, excludedDependencies: excludedIds }));
            },
            error => setErrorMessage(error)
        );
    }, [compositionRoot.excludedDependencies]);

    const selection = useMemo(() => builder.baseElements.map(id => ({ id })), [builder]);
    const getModelName = useCallback(
        (row: MetadataItem): string => compositionRoot.metadata.getModelName(String(row.model)),
        [compositionRoot.metadata]
    );
    const isExcluded = useCallback(
        (row: MetadataItem): boolean => builder.excludedDependencies.includes(row.id),
        [builder.excludedDependencies]
    );
    const isExcludeActive = useCallback((rows: MetadataItem[]) => _.some(rows, row => !isExcluded(row)), [isExcluded]);
    const isIncludeActive = useCallback((rows: MetadataItem[]) => _.every(rows, row => isExcluded(row)), [isExcluded]);

    const rowConfig = useCallback(
        (row: MetadataItem): RowConfig => (isExcluded(row) ? { style: { backgroundColor: "#ffcdd2" } } : {}),
        [isExcluded]
    );

    const excludeDependency = useCallback(
        (selection: string[]) =>
            updateBuilder(builder => ({
                ...builder,
                excludedDependencies: _.uniq([...builder.excludedDependencies, ...selection]),
            })),
        []
    );

    const includeDependency = useCallback(
        (selection: string[]) => {
            const includedDependencies = _.uniq([...builder.includedDependencies, ...selection]);
            const excludedDependencies = _.difference(builder.excludedDependencies, selection);

            return updateBuilder(builder => ({
                ...builder,
                includedDependencies: includedDependencies,
                excludedDependencies: excludedDependencies,
            }));
        },
        [builder.excludedDependencies, builder.includedDependencies]
    );

    const onChangeSearch = useCallback((search: string) => setListOptions(options => ({ ...options, search })), []);
    const onChangeModel = useCallback((model: MetadataModel) => setListOptions(options => ({ ...options, model })), []);
    const onTableChange = useCallback(
        ({ pagination, sorting, selection }: TableState<MetadataItem>) => {
            updateBuilder(builder => ({ ...builder, baseElements: selection.map(({ id }) => id) }));
            setListOptions(options => ({
                ...options,
                pageSize: pagination.pageSize,
                page: pagination.page,
                sorting: { field: String(sorting.field), order: sorting.order },
            }));
        },
        [setListOptions]
    );

    const saveExcludedDependencies = useCallback(() => {
        compositionRoot.excludedDependencies.save(builder.excludedDependencies).run(
            () => setSuccessMessage("Successfully saved global excluded dependencies!"),
            error => setErrorMessage(error)
        );
    }, [builder, compositionRoot.excludedDependencies]);

    return {
        errorMessage: errorMessage,
        successMessage: successMessage,
        isLoading: isLoading,
        listOptions: listOptions,
        response: response,
        selection: selection,
        excludeDependency: excludeDependency,
        includeDependency: includeDependency,
        getModelName: getModelName,
        isExcludeActive: isExcludeActive,
        isIncludeActive: isIncludeActive,
        onChangeSearch: onChangeSearch,
        onChangeModel: onChangeModel,
        onTableChange: onTableChange,
        rowConfig: rowConfig,
        saveExcludedDependencies: saveExcludedDependencies,
    };
}

const defaultBuilder: Builder = {
    baseElements: [],
    excludedDependencies: [],
    includedDependencies: [],
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
