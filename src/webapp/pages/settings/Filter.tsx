import { displayName, MetadataModel } from "../../../domain/entities/MetadataItem";
import Dropdown, { DropdownOption } from "../../components/dropdown/Dropdown";
import _ from "lodash";
import i18n from "../../../locales";

export const Filter = (props: { model: MetadataModel; onChangeModel: (model: MetadataModel) => void }) => {
    const { model, onChangeModel } = props;

    return (
        <Dropdown<MetadataModel>
            items={filterModels}
            onValueChange={onChangeModel}
            value={model}
            label={i18n.t("Metadata type")}
            hideEmpty={true}
        />
    );
};

const filterModels: DropdownOption<MetadataModel>[] = _(displayName)
    .map((name, id) => ({
        id: id as MetadataModel,
        name: i18n.t(name),
    }))
    .sortBy("name")
    .value();
