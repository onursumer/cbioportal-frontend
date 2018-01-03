import {observer} from "mobx-react";
import * as React from 'react';
import LazyMobXTable from "shared/components/lazyMobXTable/LazyMobXTable";
import FrequencyBar from "shared/components/cohort/FrequencyBar";

export interface IGeneAlteration {
    oqlLine: string;
    sequenced: number;
    altered: number;
    percentAltered: string;
}

export interface IGeneAlterationTableProps {
    geneAlterationData: IGeneAlteration[];
}

class GeneAlterationTableComponent extends LazyMobXTable<IGeneAlteration> {}

@observer
export default class GeneAlterationTable extends React.Component<IGeneAlterationTableProps, {}> {
    public render()
    {
        return (
            <GeneAlterationTableComponent
                data={this.props.geneAlterationData}
                columns={
                    [
                        {
                            name: 'OQL Line',
                            render: (data: IGeneAlteration) => <span>{data.oqlLine}</span>,
                            download: (data: IGeneAlteration) => data.oqlLine,
                            sortBy: (data: IGeneAlteration) => data.oqlLine,
                            filter: (data: IGeneAlteration, filterString: string, filterStringUpper: string) => {
                                return data.oqlLine.toUpperCase().indexOf(filterStringUpper) > -1;
                            }
                        },
                        {
                            name: 'Num Samples Altered',
                            render: (data: IGeneAlteration) => <span>{data.altered}</span>,
                            download: (data: IGeneAlteration) => `${data.altered}`,
                            sortBy: (data: IGeneAlteration) => data.altered
                        },
                        {
                            name: 'Percent Samples Altered',
                            render: (data: IGeneAlteration) => (
                                <FrequencyBar
                                    barWidth={200}
                                    counts={[data.altered]}
                                    totalCount={data.sequenced}
                                />
                            ),
                            download: (data: IGeneAlteration) => data.percentAltered,
                            sortBy: (data: IGeneAlteration) => data.altered / data.sequenced,
                        }
                    ]
                }
                initialSortColumn="Percent Samples Altered"
                initialSortDirection={'desc'}
                showPagination={true}
                initialItemsPerPage={10}
                showColumnVisibility={false}
                showFilter={true}
                showCopyDownload={true}
            />
        );
    }
}
