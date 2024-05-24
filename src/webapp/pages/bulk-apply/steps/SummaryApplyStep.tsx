import { ConfirmationDialog, useSnackbar } from "@eyeseetea/d2-ui-components";
import Button from "@material-ui/core/Button";
import React, { useEffect } from "react";
import i18n from "../../../../locales";
import { ImportSummary } from "../../../components/import-summary/ImportSummary";
import { MetadataSharingWizardStepProps } from "../SharingWizardSteps";
import { useSummaryStep } from "./useSummaryStep";
import { SharingSummary } from "../../../components/sharing-summary/SharingSummary";
import { CircularProgress } from "material-ui";
import styled from "styled-components";

export const SummaryApplyStep: React.FC<MetadataSharingWizardStepProps> = ({ builder }) => {
    const snackbar = useSnackbar();

    const {
        globalMessage,
        importResult,
        loading,
        openDialog,
        sharingSummary,
        applySharingSettings,
        applySharingSync,
        closeImportSummary,
        closePublicAccessWarningDialog,
    } = useSummaryStep(builder);

    useEffect(() => {
        if (!globalMessage) return;

        if (globalMessage.type === "error") {
            snackbar.error(globalMessage.text);
        } else if (globalMessage.type === "success") {
            snackbar.success(globalMessage.text);
        }
    }, [globalMessage, snackbar]);

    return (
        <Container>
            {importResult && <ImportSummary results={[importResult]} onClose={closeImportSummary} />}
            {sharingSummary && <SharingSummary summary={sharingSummary} />}
            {loading && <CircularProgress />}

            <ConfirmationDialog
                isOpen={openDialog}
                title={i18n.t("Warning")}
                onCancel={closePublicAccessWarningDialog}
                onSave={applySharingSync}
                saveText={loading ? i18n.t("Saving") : i18n.t("Continue")}
                cancelText={i18n.t("Go back")}
                maxWidth={"sm"}
                fullWidth={true}
                disableSave={loading}
            >
                {i18n.t("You are about to change the public access sharing setting. Would you like to continue?")}
            </ConfirmationDialog>

            <StyledButton variant="contained" color="primary" onClick={applySharingSettings} disabled={loading}>
                {i18n.t("Apply Sharing Settings")}
            </StyledButton>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const StyledButton = styled(Button)`
    margin: 20px 0 0 0;
    width: max-content;
`;
