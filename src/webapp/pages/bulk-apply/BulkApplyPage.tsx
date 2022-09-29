import i18n from "@dhis2/d2-i18n";
import { ConfirmationDialog, ConfirmationDialogProps } from "@eyeseetea/d2-ui-components";
import React, { useCallback, useState } from "react";
import { SharingUpdate } from "../../../domain/entities/SharingUpdate";
import { PageHeader } from "../../components/page-header/PageHeader";
import { useGoBack } from "../../hooks/useGoBack";
import { SharingWizard } from "./SharingWizard";

export const BulkApplyPage: React.FC = () => {
    const goBack = useGoBack();

    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);

    const [builder, updateBuilder] = useState<SharingUpdate>(defaultBuilder);

    const onCancel = useCallback(() => {
        updateDialog({
            title: i18n.t("Cancel sharing action?"),
            description: i18n.t("All your changes will be lost. Are you sure you want to proceed?"),
            saveText: i18n.t("Yes"),
            cancelText: i18n.t("No"),
            onSave: () => null,
            onCancel: () => updateDialog(null),
        });
    }, []);

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Bulk apply")} onBackClick={goBack} />

            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}

            <SharingWizard onCancel={onCancel} builder={builder} updateBuilder={updateBuilder} />
        </React.Fragment>
    );
};

const defaultBuilder: SharingUpdate = {
    baseElements: [],
    excludedDependencies: [],
    replaceExistingSharings: false,
    sharings: {
        publicAccess: "--------",
        userAccesses: [],
        userGroupAccesses: [],
    },
};
