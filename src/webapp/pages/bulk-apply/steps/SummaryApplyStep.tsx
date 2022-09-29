import { useSnackbar } from "@eyeseetea/d2-ui-components";
import Button from "@material-ui/core/Button";
import React, { useCallback, useState } from "react";
import { ImportResult } from "../../../../domain/entities/ImportResult";
import { ImportSummary } from "../../../components/import-summary/ImportSummary";
import { useAppContext } from "../../../contexts/app-context";
import { MetadataSharingWizardStepProps } from "../SharingWizardSteps";

export const SummaryApplyStep: React.FC<MetadataSharingWizardStepProps> = ({ builder }) => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [importResult, setImportResult] = useState<ImportResult>();

    const applySharingSync = useCallback(() => {
        compositionRoot.metadata
            .applySharingSettings(builder)
            .flatMap(payload => compositionRoot.metadata.import(payload))
            .run(
                result => setImportResult(result),
                error => snackbar.error(error)
            );
    }, [builder, compositionRoot, snackbar]);

    return (
        <React.Fragment>
            {importResult && <ImportSummary results={[importResult]} onClose={() => setImportResult(undefined)} />}

            <Button variant="contained" color="primary" onClick={applySharingSync}>
                Apply Sharing Settings
            </Button>
        </React.Fragment>
    );
};
