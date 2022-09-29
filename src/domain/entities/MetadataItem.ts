import { Ref } from "./Ref";
import { SharedObject } from "./SharedObject";

export type MetadataModel =
    | "dataSets"
    | "programs"
    | "dashboards"
    | "reports"
    | "visualizations"
    | "eventReports"
    | "eventCharts"
    | "maps"
    | "interpretations"
    | "documents"
    | "categoryCombos"
    | "dataElements"
    | "categoryOptions"
    | "categories"
    | "indicators"
    | "optionSets"
    | "legendSets"
    | "programStages"
    | "programIndicators";

export const displayName: Record<string, string> = {
    dataSets: "Data Sets",
    programs: "Programs",
    dashboards: "Dashboards",
    reports: "Reports",
    visualizations: "Visualizations",
    eventReports: "Event Reports",
    eventCharts: "Event Charts",
    maps: "Maps",
    interpretations: "Interpretations",
    documents: "Documents",
    categoryCombos: "Category Combos",
    dataElements: "Data Elements",
    categoryOptions: "Category Options",
    categories: "Categories",
    indicators: "Indicators",
    optionSets: "Option Sets",
    legendSets: "Legend Sets",
    programStages: "Program Stages",
    programIndicators: "Program Indicators",
};
export type MetadataPayload = Record<string, MetadataItem[]>;

export interface Visualization extends MetadataItem {
    dataDimensionItems?: DataDimensionItem[];
}

export interface DataDimensionItem {
    dataDimensionItemType: string;
    indicator?: Ref;
    programIndicator?: Ref;
}

export type MetadataItem = Ref & SharedObject & { [key: string]: any | undefined };

export function isValidModel(model: string): model is MetadataModel {
    return ["dataSets", "programs", "dashboards"].includes(model);
}

export function isValidMetadataItem(item: any): item is MetadataItem {
    return item.id && item.publicAccess && item.userAccesses && item.userGroupAccesses;
}
