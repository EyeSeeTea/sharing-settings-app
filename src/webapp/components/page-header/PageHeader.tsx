import { ButtonProps, Icon, IconButton as MUIIConButton, Tooltip } from "@material-ui/core";
import { Variant } from "@material-ui/core/styles/createTypography";
import Typography from "@material-ui/core/Typography";
import { DialogButton } from "@eyeseetea/d2-ui-components";
import React from "react";
import i18n from "../../../locales";
import styled from "styled-components";

export const PageHeader: React.FC<PageHeaderProps> = React.memo(props => {
    const { variant = "h5", title, onBackClick, helpText, children } = props;
    return (
        <Container>
            <TitleContainer>
                {!!onBackClick && (
                    <BackButton
                        onClick={onBackClick}
                        color="secondary"
                        aria-label={i18n.t("Back")}
                        data-test={"page-header-back"}
                    >
                        <Icon color="primary">arrow_back</Icon>
                    </BackButton>
                )}

                <Title variant={variant} gutterBottom data-test={"page-header-title"}>
                    {title}
                </Title>
                {helpText && <HelpButton text={helpText} />}
            </TitleContainer>
            {children}
        </Container>
    );
});

export interface PageHeaderProps {
    variant?: Variant;
    title: string;
    onBackClick?: () => void;
    helpText?: string;
}

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const TitleContainer = styled.div``;

const Title = styled(Typography)`
    display: inline-block;
    font-weight: 300;
`;

const Button: React.FC<ButtonProps> = ({ onClick }) => (
    <Tooltip title={i18n.t("Help")}>
        <IconButton onClick={onClick}>
            <Icon color="primary">help</Icon>
        </IconButton>
    </Tooltip>
);

const HelpButton: React.FC<{ text: string }> = ({ text }) => (
    <DialogButton buttonComponent={Button} title={i18n.t("Help")} maxWidth={"sm"} fullWidth={true} contents={text} />
);

const IconButton = styled(MUIIConButton)`
    margin-block-end: 0.5rem;
`;

const BackButton = styled(IconButton)`
    padding-block-start: 0.625rem;
    margin-block-end: 0.3125rem;
`;
