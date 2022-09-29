import { NamedRef, Ref } from "../../domain/entities/Ref";
import { Codec, Schema } from "../../utils/codec";

export const RefModel: Codec<Ref> = Schema.object({
    id: Schema.string,
});

export const NamedRefModel: Codec<NamedRef> = Schema.extend(
    RefModel,
    Schema.object({
        name: Schema.string,
    })
);
