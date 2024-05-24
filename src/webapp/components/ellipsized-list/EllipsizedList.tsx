import _ from "lodash";
import i18n from "../../../locales";
import { Tooltip } from "@material-ui/core";
import { SharingSetting } from "../../../domain/entities/SharedObject";

export const EllipsizedList = ({ items, limit = 3 }: { items: SharingSetting[]; limit?: number }) => {
    const names = items.map(item => item.name ?? item.displayName);
    const overflow = items.length - limit;
    const hasOverflow = overflow > 0;

    const buildList = (items: string[]) => items.map(item => <li key={`${item}-sharing`}>{item}</li>);

    return (
        <Tooltip title={buildList(names)} disableHoverListener={!hasOverflow}>
            <ul>
                {buildList(_.take(names, limit))}

                {hasOverflow && <li>{i18n.t("And {{overflow}} more...", { overflow })}</li>}
            </ul>
        </Tooltip>
    );
};
