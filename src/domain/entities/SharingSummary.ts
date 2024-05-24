import { CodedRef, SharingObject } from "./MetadataItem";
import { NamedRef } from "./Ref";

type MetadataSharing = CodedRef & {
    sharing: SharingObject;
};

export type SharingWarning = MetadataSharing & {
    children: MetadataSharing[];
};

export type SharingPayload = Record<string, CodedRef[]>;

export interface SharingSummary {
    sharingWarnings: SharingWarning[];
    sharingPayload: SharingPayload;
    excludedMetadata: NamedRef[];
}
