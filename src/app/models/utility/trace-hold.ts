export class RxTraceInfo {
    SEQID: number;
    CLIENTID: string;
    SITEID: string;
    TRACETYPE: string;
    TRACEVALUE: string;
    REASONCODE: string;
    INSTRUCTIONS: string = "";
    STATUS: string;
    FOUNDMODULE: string;
    FOUNDLOCREFERENCE: string;
    FOUNDNOTES: string;
    FOUNDUSER: string;
    FOUNDDATE: Date;
    INACTIVEUSER: string;
    INACTIVEDATE: Date;
    ADDDATE: Date;
    ADDWHO: string;
    EDITDATE: Date;
    EDITWHO: string;
    HOLDREASON: String
}