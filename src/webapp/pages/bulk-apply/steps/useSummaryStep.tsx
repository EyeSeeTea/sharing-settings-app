import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../../contexts/app-context";
import { SharingUpdate } from "../../../../domain/entities/SharingUpdate";
import { ImportResult } from "../../../../domain/entities/ImportResult";
import { SharingSummary } from "../../../../domain/entities/SharingSummary";
import { MetadataPayload } from "../../../../domain/entities/MetadataItem";

type GlobalMessage = {
    text: string;
    type: "success" | "error";
};

export function useSummaryStep(builder: SharingUpdate) {
    const { compositionRoot } = useAppContext();

    const [importResult, setImportResult] = useState<ImportResult>();
    const [openDialog, setDialogOpen] = useState<boolean>(false);
    const [sharingSummary, setSharingSummary] = useState<SharingSummary>();
    const [loading, setLoading] = useState<boolean>(false);
    const [payload, setPayload] = useState<MetadataPayload>();
    const [globalMessage, setGlobalMessage] = useState<GlobalMessage | undefined>(undefined);

    useEffect(() => {
        setLoading(true);

        compositionRoot.metadata
            .getMetadataWithUpdatedSharings(builder)
            .flatMap(payload => {
                setPayload(payload);
                return compositionRoot.metadata.getSharingSummary(builder, payload);
            })
            .run(
                sharingSummary => {
                    setSharingSummary(sharingSummary);
                    setLoading(false);
                },
                error => setGlobalMessage({ type: "error", text: error })
            );
    }, [builder, compositionRoot.metadata]);

    const applySharingSync = useCallback(() => {
        if (!payload) return;

        setLoading(true);
        compositionRoot.metadata.import(payload).run(
            result => {
                openDialog && setDialogOpen(false);
                setLoading(false);
                setImportResult(result);
                setGlobalMessage({ type: "success", text: "Sharing settings successfully applied" });
            },
            error => setGlobalMessage({ type: "error", text: error })
        );
    }, [compositionRoot.metadata, openDialog, payload]);

    const applySharingSettings = useCallback(() => {
        builder.sharings.publicAccess !== noAccess ? setDialogOpen(true) : applySharingSync();
    }, [applySharingSync, builder.sharings.publicAccess]);
    const closeImportSummary = useCallback(() => setImportResult(undefined), []);
    const closePublicAccessWarningDialog = useCallback(() => {
        setLoading(false);
        setDialogOpen(false);
    }, []);

    return {
        globalMessage,
        importResult,
        loading,
        openDialog,
        sharingSummary,
        applySharingSettings,
        applySharingSync,
        closeImportSummary,
        closePublicAccessWarningDialog,
    };
}

const noAccess = "--------";
