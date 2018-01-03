import {observer} from "mobx-react";
import * as React from 'react';
import LazyMobXTable from "shared/components/lazyMobXTable/LazyMobXTable";
import {OQLLineFilterOutput} from "shared/lib/oql/oqlfilter";
import {AnnotatedExtendedAlteration} from "../ResultsViewPageStore";

export interface ISubAlteration {
    type: string;
    value: string;
}

export interface IOqlData {
    geneSymbol: string;
    mutation: string[];
    fusion: string[];
    cna: ISubAlteration[];
    mrnaExp: ISubAlteration[];
    proteinLevel: ISubAlteration[];
}

export interface ICaseAlteration {
    studyId: string;
    sampleId: string;
    patientId: string;
    altered: boolean;
    oqlData: {[oqlLine: string]: IOqlData};
}

export interface ICaseAlterationTableProps {
    caseAlterationData: ICaseAlteration[];
    oqls: OQLLineFilterOutput<AnnotatedExtendedAlteration>[];
}

export function generateOqlValue(data: IOqlData): string
{
    const oqlValue: string[] = [];

    if (data.mutation.length > 0) {
        oqlValue.push("MUT:");
        oqlValue.push(data.mutation.join(",") + ";");
    }

    if (data.fusion.length > 0) {
        oqlValue.push("FUSION:");
        oqlValue.push(data.fusion.join(",") + ";");
    }

    if (data.cna.length > 0) {
        oqlValue.push("CNA:");
        oqlValue.push(data.cna.map(cna => cna.type).join(",") + ";");
    }

    if (data.mrnaExp.length > 0) {
        oqlValue.push("EXP:");
        oqlValue.push(data.mrnaExp.map(exp => exp.type).join(",") + ";");
    }

    if (data.proteinLevel.length > 0) {
        oqlValue.push("PROT:");
        oqlValue.push(data.proteinLevel.map(prot => prot.type).join(",") + ";");
    }

    return oqlValue.join(" ");
}

class CaseAlterationTableComponent extends LazyMobXTable<ICaseAlteration> {}

@observer
export default class CaseAlterationTable extends React.Component<ICaseAlterationTableProps, {}> {
    public render()
    {
        const columns = [
            {
                name: 'Study ID',
                render: (data: ICaseAlteration) => <span>{data.studyId}</span>,
                download: (data: ICaseAlteration) => data.studyId,
                sortBy: (data: ICaseAlteration) => data.studyId,
                filter: (data: ICaseAlteration, filterString: string, filterStringUpper: string) => {
                    return data.studyId.toUpperCase().indexOf(filterStringUpper) > -1;
                }
            },
            {
                name: 'Sample ID',
                render: (data: ICaseAlteration) => <span>{data.sampleId}</span>,
                download: (data: ICaseAlteration) => `${data.sampleId}`,
                sortBy: (data: ICaseAlteration) => data.sampleId,
                filter: (data: ICaseAlteration, filterString: string, filterStringUpper: string) => {
                    return data.sampleId.toUpperCase().indexOf(filterStringUpper) > -1;
                }
            },
            {
                name: 'Patient ID',
                render: (data: ICaseAlteration) => <span>{data.patientId}</span>,
                download: (data: ICaseAlteration) => `${data.patientId}`,
                sortBy: (data: ICaseAlteration) => data.patientId,
                filter: (data: ICaseAlteration, filterString: string, filterStringUpper: string) => {
                    return data.patientId.toUpperCase().indexOf(filterStringUpper) > -1;
                }
            },
            {
                name: 'Altered',
                tooltip: <span>1 = Case harbors alteration in one of the input genes</span>,
                render: (data: ICaseAlteration) => <span>{data.altered ? "1" : "0"}</span>,
                download: (data: ICaseAlteration) => data.altered ? "1" : "0",
                sortBy: (data: ICaseAlteration) => data.altered ? 1 : 0
            }
        ];

        this.props.oqls.forEach(oql => {
            columns.push({
                name: oql.gene,
                tooltip: <span>{oql.oql_line}</span>,
                render: (data: ICaseAlteration) =>
                    <span>{data.oqlData ? generateOqlValue(data.oqlData[oql.oql_line]) : ""}</span>,
                download: (data: ICaseAlteration) =>
                    data.oqlData ? generateOqlValue(data.oqlData[oql.oql_line]) : "",
                sortBy: (data: ICaseAlteration) =>
                    data.oqlData ? generateOqlValue(data.oqlData[oql.oql_line]) : "",
                filter: (data: ICaseAlteration, filterString: string, filterStringUpper: string) => {
                    return data.oqlData &&
                        generateOqlValue(data.oqlData[oql.oql_line]).toUpperCase().indexOf(filterStringUpper) > -1;
                }
            });
        });


        return (
            <CaseAlterationTableComponent
                data={this.props.caseAlterationData}
                columns={columns}
                initialSortColumn="Altered"
                initialSortDirection={'desc'}
                initialItemsPerPage={20}
                showPagination={true}
                showColumnVisibility={true}
                showFilter={true}
                showCopyDownload={true}
            />
        );
    }
}
