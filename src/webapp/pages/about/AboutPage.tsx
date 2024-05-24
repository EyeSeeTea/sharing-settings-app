import styled from "styled-components";
import i18n from "../../../locales";
import { IconButton, Typography } from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import { NavLink } from "react-router-dom";
import { useGoBack } from "../../hooks/useGoBack";

export const AboutPage = () => {
    const goBack = useGoBack();
    return (
        <Container>
            <Wrapper>
                <BackButton
                    title="Go to dashboard"
                    onClick={goBack}
                    color="inherit"
                    aria-label={i18n.t("Back")}
                    data-test={"page-header-back"}
                >
                    <HomeIcon fontSize="small" color="inherit" />
                </BackButton>
                <Title variant="h1">{i18n.t("About Sharing Settings App")}</Title>
                <Description variant="body2">
                    {i18n.t(
                        "Sharing Settings app development is sustainable thanks to the partners for which we build customized DHIS2 solutions. It has been funded by WHO and the WHO Integrated Data Platform (WIDP), where several WHO departments and units share a dedicated hosting and maintenance provided by"
                    )}{" "}
                    <Link to={"https://eyeseetea.com"} target="_blank" rel="noopener noreferrer">
                        EyeSeeTea
                    </Link>
                    , {i18n.t("back some specific new features.")} <br />
                    {i18n.t(
                        "The Long Term Agreement EyeSeeTea holds with WHO for this maintenance includes maintenance of this application, ensuring that it will always work at least with the last version of WIDP. We are passionate about both DHIS2 and open source, so giving back to the community through dedicated open-source development is and will always be part of EyeSeeTea’s commitment. You can also"
                    )}{" "}
                    <Link to={"https://github.com/sponsors/EyeSeeTea"} target="_blank" rel="noopener noreferrer">
                        {i18n.t(
                            "support our work through a one-time contribution or becoming a regular github sponsor"
                        )}
                    </Link>
                    .
                </Description>
                <LogoWrapper>
                    <Logo alt={i18n.t("World Health Organization")} src="./img/logo-who.svg" />
                    <Logo alt={i18n.t("EyeSeeTea")} src="./img/logo-eyeseetea.png" />
                </LogoWrapper>
            </Wrapper>
        </Container>
    );
};

const Container = styled.section`
    height: 100vh;
    background-color: #276696;
    margin: -1rem;
    padding: 1rem;
    color: white;
`;

const Wrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-block-start: 4rem;
`;

const Title = styled(Typography)`
    font-size: 2rem;
    text-align: center;
    margin-block-end: 1.75rem;
`;

const Description = styled(Typography)`
    font-size: 17px;
    font-weight: 300;
    line-height: 28px;
    margin-block-end: 17px;
    max-width: 90ch;
    margin-inline: 1rem;
`;

const Link = styled(NavLink)`
    color: inherit;
`;

const LogoWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Logo = styled.img`
    width: 200px;
    margin: 0 50px;
`;

const BackButton = styled(IconButton)`
    position: absolute;
    top: 0;
    left: 0;
`;
