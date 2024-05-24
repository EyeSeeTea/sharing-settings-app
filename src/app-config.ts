import { AppConfig } from "./webapp/pages/app/AppConfig";

export const appConfig: AppConfig = {
    appKey: "sharing-settings-app",
    appearance: {
        showShareButton: true,
    },
    feedback: {
        repositories: {
            clickUp: {
                listId: "901202304538",
                title: "[User feedback] {title}",
                body: "## dhis2\n\nUsername: {username}\n\n{body}",
            },
        },
        layoutOptions: {
            showContact: false,
            descriptionTemplate: "## Summary\n\n## Steps to reproduce\n\n## Actual results\n\n## Expected results\n\n",
        },
    },
};
