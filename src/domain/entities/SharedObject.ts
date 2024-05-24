import { Id } from "./Ref";

export type SharingSetting = { id: Id; displayName: string; access: string; name: string };

export interface SharedObject {
    publicAccess: string;
    userAccesses: SharingSetting[];
    userGroupAccesses: SharingSetting[];
}

export interface Access {
    meta: { read: boolean; write: boolean };
    data?: { read: boolean; write: boolean };
}

export function getAccessFromString(access: string): Access {
    const [metaRead, metaWrite, dataRead, dataWrite] = access.slice(0, 4).split("");

    return {
        meta: { read: metaRead === "r", write: metaWrite === "w" },
        data: { read: dataRead === "r", write: dataWrite === "w" },
    };
}

export function buildAccessString(d2Access: Access, stripData = false): string {
    return (
        [
            d2Access.meta.read ? "r" : "-",
            d2Access.meta.write ? "w" : "-",
            !stripData && d2Access.data?.read ? "r" : "-",
            !stripData && d2Access.data?.write ? "w" : "-",
        ].join("") + "----"
    );
}
