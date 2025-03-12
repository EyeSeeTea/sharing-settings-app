import { SharingSummary as SharingSummaryI } from "../../../domain/entities/SharingSummary";
import { NamedRef } from "../../../domain/entities/Ref";
import i18n from "../../../locales";
import styled from "styled-components";

interface SharingSummaryProps {
    summary: SharingSummaryI;
}

export const SharingSummary = ({ summary }: SharingSummaryProps) => {
    const { excludedMetadata, sharingWarnings, sharingPayload } = summary;

    return (
        <div>
            <Title>{i18n.t("Changes will be made to:")}</Title>
            {Object.entries(sharingPayload).map(([displayName, metadata]) => (
                <MetadataList key={displayName} title={pluralize(displayName)} metadata={metadata} />
            ))}

            {sharingWarnings.length !== 0 && (
                <Warnings>
                    <Title>{i18n.t("Warning:")}</Title>
                    {sharingWarnings.map(metadataItem => (
                        <MetadataList
                            key={metadataItem.id}
                            title={`${metadataItem.name} (${metadataItem.id}) will have different sharing settings from:`}
                            metadata={metadataItem.children}
                        />
                    ))}
                </Warnings>
            )}

            {excludedMetadata.length !== 0 && (
                <div>
                    <Title>{i18n.t("Excluded dependencies:")}</Title>
                    <ul>
                        {excludedMetadata.map(({ id, name }) => (
                            <li key={id}>{i18n.t(`${name} (${id})`)}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const MetadataList = ({ title, metadata }: { title: string; metadata: NamedRef[] }) => {
    return (
        <ul>
            <li>
                {i18n.t(title)}
                <ul>
                    {metadata.map(item => (
                        <li key={item.id}>{i18n.t(`${item.name} (${item.id})`)}</li>
                    ))}
                </ul>
            </li>
        </ul>
    );
};

const Title = styled.p`
    font-weight: 500;
    margin: 0;
`;

const Warnings = styled.div`
    background-color: #fff4e5;
    padding: 2rem;
    margin-bottom: 1rem;
`;

function pluralize(str: string) {
    return str.endsWith("y") ? `${str.slice(0, -1)}ies` : `${str}s`;
}
