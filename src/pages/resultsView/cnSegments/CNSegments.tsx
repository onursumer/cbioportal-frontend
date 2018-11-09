import * as React from 'react';
import {observer} from "mobx-react";
import {computed, observable} from "mobx";
import autobind from "autobind-decorator";
import {Button, Nav, NavItem} from "react-bootstrap";
import fileDownload from "react-file-download";

import {ResultsViewPageStore} from "../ResultsViewPageStore";
import {Gene} from "shared/api/generated/CBioPortalAPI";
import IntegrativeGenomicsViewer from "shared/components/igv/IntegrativeGenomicsViewer";
import {defaultSegmentTrackProps, generateSegmentFileContent} from "shared/lib/IGVUtils";
import DefaultTooltip from "shared/components/defaultTooltip/DefaultTooltip";
import LoadingIndicator from "shared/components/loadingIndicator/LoadingIndicator";
import onMobxPromise from "shared/lib/onMobxPromise";

const WHOLE_GENOME = "all";

@observer
export default class CNSegments extends React.Component<{ store: ResultsViewPageStore}, {}> {

    @observable selectedLocus: string;
    @observable segmentTrackHeight = 600;

    @computed get activeLocus(): string {
        let locus = this.selectedLocus;

        if (!locus) {
            locus = this.props.store.genes.result ?
                this.props.store.genes.result[0].hugoGeneSymbol : WHOLE_GENOME;
        }

        return locus;
    }

    @computed get features() {
        return this.props.store.cnSegments.result || [];
    }

    @computed get filename()
    {
        let prefix = "";

        if (this.props.store.studies.result) {
            if (this.props.store.studies.result.length > 1) {
                prefix = "multi_study_";
            }
            else if (this.props.store.studies.result.length === 1) {
                prefix = `${this.props.store.studies.result[0].studyId}_`;
            }
        }

        return `${prefix}segments.seg`;
    }

    public render() {

        if (this.props.store.cnSegments.isComplete)
        {
            return (
                <div className="pillTabs">
                    <DefaultTooltip
                        overlay={<span>Download a copy number segment file for the selected samples</span>}
                        placement="left"
                    >
                        <Button
                            className="btn btn-sm pull-right"
                            onClick={this.handleDownload}
                        >
                            <i className='fa fa-cloud-download'/>
                        </Button>
                    </DefaultTooltip>
                    <Nav
                        bsStyle="pills"
                        activeKey={this.activeLocus}
                        onSelect={(id: any) => {
                             this.selectedLocus = id;
                        }}
                    >
                        <NavItem eventKey={WHOLE_GENOME}>
                            Whole Genome
                        </NavItem>
                        {
                            this.props.store.genes.result && this.props.store.genes.result.map((gene: Gene) => (
                                <NavItem eventKey={gene.hugoGeneSymbol}>
                                    {gene.hugoGeneSymbol}
                                </NavItem>
                            ))
                        }
                    </Nav>
                    <IntegrativeGenomicsViewer
                        tracks={[
                            {
                                ...defaultSegmentTrackProps(),
                                height: this.segmentTrackHeight,
                                features: this.features
                            }
                        ]}
                        locus={this.activeLocus}
                    />
                </div>
            );
        } else {
            return <LoadingIndicator isLoading={true} center={true} size="big" />;
        }
    }

    @autobind
    private handleDownload() {
        onMobxPromise(
            this.props.store.cnSegments,
            data => fileDownload(generateSegmentFileContent(data), this.filename)
        );
    }
}