import { NamedRef, Ref } from "./Ref";
import { SharedObject, SharingSetting } from "./SharedObject";

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
    | "programIndicators"
    | "dataElementGroups"
    | "dataElementGroupSets"
    | "organisationUnitGroups"
    | "organisationUnitGroupSets";

export const displayName: Record<string, string> = {
    attributes: "Attributes",
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
    dataElementGroups: "Data Element Group",
    dataElementGroupSets: "Data Element Group Set",
    organisationUnitGroups: "Organisation Unit Group",
    organisationUnitGroupSets: "Organisation Unit Group Set",
    trackedEntityTypes: "Tracked Entity Types",
    trackedEntityAttributes: "Tracked Entity Attributes",
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

export type Sharing = {
    sharing: SharingObject;
};

export type SharingItem = Record<string, SharingSetting>;

export type SharingObject = {
    userGroups: SharingItem;
    users: SharingItem;
    public: string;
};

export type CodedRef = NamedRef & { code: string | undefined };

export type MetadataItem = CodedRef & Sharing & SharedObject & { [key: string]: any | undefined };

export function isValidModel(model: string): model is MetadataModel {
    return ["dataSets", "programs", "dashboards"].includes(model);
}

export function isValidMetadataItem(item: any): item is MetadataItem {
    return item.id && (item.sharing || (item.publicAccess && item.userAccesses && item.userGroupAccesses));
}
