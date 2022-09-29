import { Wizard, WizardStep } from "@eyeseetea/d2-ui-components";
import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { MetadataSharingWizardStepProps, metadataSharingWizardSteps } from "./SharingWizardSteps";

export interface MetadataSharingWizardProps extends MetadataSharingWizardStepProps {
    className?: string;
}

export const SharingWizard: React.FC<MetadataSharingWizardStepProps> = props => {
    const location = useLocation();

    const steps = useMemo(() => metadataSharingWizardSteps.map(step => ({ ...step, props })), [props]);

    const onStepChangeRequest = async (_prev: WizardStep) => {
        return undefined;
    };

    const urlHash = location.hash.slice(1);
    const stepExists = steps.find(step => step.key === urlHash);
    const firstStepKey = steps.map(step => step.key)[0];
    const initialStepKey = stepExists ? urlHash : firstStepKey;

    return (
        <Wizard
            useSnackFeedback={true}
            onStepChangeRequest={onStepChangeRequest}
            initialStepKey={initialStepKey}
            lastClickableStepIndex={steps.length - 1}
            steps={steps}
        />
    );
};
