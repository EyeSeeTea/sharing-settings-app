import i18n from "@dhis2/d2-i18n";
import { ShareUpdate, Sharing, SharingRule } from "@eyeseetea/d2-ui-components";
import { FormControlLabel, Switch } from "@material-ui/core";
import React, { useCallback } from "react";
import { SharingSetting } from "../../../../domain/entities/SharedObject";
import { useAppContext } from "../../../contexts/app-context";
import { MetadataSharingWizardStepProps } from "../SharingWizardSteps";

export const AccessStep: React.FC<MetadataSharingWizardStepProps> = ({ builder, updateBuilder }) => {
    const { compositionRoot } = useAppContext();

    const strategyName = builder.replaceExistingSharings ? i18n.t("Replace") : i18n.t("Merge");
    const label = `${i18n.t("Update strategy")}: ${strategyName}`;

    const search = useCallback(
        (query: string) => compositionRoot.instance.searchUsers(query).toPromise(),
        [compositionRoot]
    );

    const setModuleSharing = useCallback(
        async ({ publicAccess, userAccesses, userGroupAccesses }: ShareUpdate) => {
            updateBuilder(builder => ({
                ...builder,
                sharings: {
                    publicAccess: publicAccess ?? builder.sharings.publicAccess,
                    userAccesses: mapSharingSettings(userAccesses) ?? builder.sharings.userAccesses,
                    userGroupAccesses: mapSharingSettings(userGroupAccesses) ?? builder.sharings.userGroupAccesses,
                },
            }));
        },
        [updateBuilder]
    );

    const setReplaceStragegy = useCallback(
        (_event: React.ChangeEvent<HTMLInputElement>, replaceExistingSharings: boolean) => {
            updateBuilder(builder => ({
                ...builder,
                replaceExistingSharings,
            }));
        },
        [updateBuilder]
    );

    return (
        <React.Fragment>
            <Sharing
                showOptions={showOptions}
                onSearch={search}
                onChange={setModuleSharing}
                meta={{
                    meta: { allowPublicAccess: true, allowExternalAccess: false },
                    object: {
                        id: "meta-object",
                        displayName: i18n.t("Global sharing settings"),
                        publicAccess: builder.sharings.publicAccess,
                        userAccesses: mapSharingRules(builder.sharings.userAccesses),
                        userGroupAccesses: mapSharingRules(builder.sharings.userGroupAccesses),
                    },
                }}
            />

            <h4>Advanced options</h4>
            <FormControlLabel
                control={
                    <Switch
                        name="replace-existing-sharings"
                        checked={builder.replaceExistingSharings}
                        onChange={setReplaceStragegy}
                        color="primary"
                    />
                }
                label={label}
            />
        </React.Fragment>
    );
};

const mapSharingSettings = (settings?: SharingRule[]): SharingSetting[] | undefined => {
    return settings?.map(item => {
        return { id: item.id, access: item.access, name: item.displayName };
    });
};

const mapSharingRules = (settings?: SharingSetting[]): SharingRule[] | undefined => {
    return settings?.map(item => {
        return { id: item.id, access: item.access, displayName: item.name };
    });
};

const showOptions = {
    title: false,
    dataSharing: true,
    publicSharing: true,
    externalSharing: false,
    permissionPicker: true,
};
