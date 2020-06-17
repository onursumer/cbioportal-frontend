import * as React from 'react';
import * as _ from 'lodash';
import { If } from 'react-if';
import { ThumbnailExpandVAFPlot } from '../vafPlot/ThumbnailExpandVAFPlot';
import {
    ClinicalDataBySampleId,
    CopyNumberSeg,
    Mutation,
    Sample,
} from 'cbioportal-ts-api-client';
import SampleManager from '../SampleManager';
import { MutationFrequenciesBySample } from '../vafPlot/VAFPlot';
import { computed } from 'mobx';
import IntegrativeGenomicsViewer from 'shared/components/igv/IntegrativeGenomicsViewer';
import {
    sampleIdToIconData,
    IKeyedIconData,
    genePanelIdToIconData,
} from './GenomicOverviewUtils';
import {
    calcSegmentTrackHeight,
    defaultSegmentTrackProps,
    generateSegmentFeatures,
    WHOLE_GENOME,
} from 'shared/lib/IGVUtils';

interface IGenomicOverviewProps {
    mergedMutations: Mutation[][];
    cnaSegments: any;
    samples: Sample[];
    sampleOrder: { [s: string]: number };
    sampleLabels: { [s: string]: string };
    sampleColors: { [s: string]: string };
    sampleManager: SampleManager;
    containerWidth: number;
    sampleIdToMutationGenePanelId?: { [sampleId: string]: string };
    sampleIdToCopyNumberGenePanelId?: { [sampleId: string]: string };
    onSelectGenePanel?: (name: string) => void;
    disableTooltip?: boolean;
    locus?: string;
}

export default class GenomicOverview extends React.Component<
    IGenomicOverviewProps,
    { frequencies: MutationFrequenciesBySample }
> {
    public static defaultProps: Partial<IGenomicOverviewProps> = {
        locus: WHOLE_GENOME,
    };

    constructor(props: IGenomicOverviewProps) {
        super(props);
    }

    @computed get frequencies() {
        return this.computeMutationFrequencyBySample(
            this.props.mergedMutations
        );
    }

    @computed get genePanelIds() {
        return _.uniq(
            _.concat(
                _.values(this.props.sampleIdToMutationGenePanelId),
                _.values(this.props.sampleIdToCopyNumberGenePanelId)
            )
        );
    }

    @computed get genePanelIdToIconData(): IKeyedIconData {
        return genePanelIdToIconData(this.genePanelIds);
    }

    @computed get sampleIdToMutationGenePanelIconData(): IKeyedIconData {
        return sampleIdToIconData(
            this.props.sampleIdToMutationGenePanelId,
            this.genePanelIdToIconData
        );
    }

    @computed get sampleIdToCopyNumberGenePanelIconData(): IKeyedIconData {
        return sampleIdToIconData(
            this.props.sampleIdToCopyNumberGenePanelId,
            this.genePanelIdToIconData
        );
    }

    // TODO figure out how to refactor recently added props (need to move the logic out of legacy tracks):
    //  mutationGenePanelIconData, copyNumberGenePanelIconData, and onSelectGenePanel.
    //
    // <Tracks
    //     mutations={_.flatten(this.props.mergedMutations)}
    //     key={Math.random() /* Force remounting on every render */}
    //     sampleManager={this.props.sampleManager}
    //     width={this.getTracksWidth()}
    //     cnaSegments={this.props.cnaSegments}
    //     samples={this.props.samples}
    //     mutationGenePanelIconData={
    //         this.sampleIdToMutationGenePanelIconData
    //     }
    //     copyNumberGenePanelIconData={
    //         this.sampleIdToCopyNumberGenePanelIconData
    //     }
    //     onSelectGenePanel={this.props.onSelectGenePanel}
    // />
    public get tracks() {
        const tracks: any[] = [];

        if (this.props.cnaSegments.length > 0) {
            // sort segments by sample order
            const segFeatures = generateSegmentFeatures(
                this.props.cnaSegments.sort(
                    (a: CopyNumberSeg, b: CopyNumberSeg) =>
                        this.props.sampleOrder[a.sampleId] -
                        this.props.sampleOrder[b.sampleId]
                )
            );

            const segHeight = calcSegmentTrackHeight(segFeatures);

            tracks.push({
                ...defaultSegmentTrackProps(),
                height: segHeight,
                features: segFeatures,
            });
        }

        // TODO enable this for mutation track
        // if (this.props.mergedMutations.length > 0) {
        //     const mutFeatures = _.flatten(this.props.mergedMutations).map(mutation => ({
        //         // TODO sampleKey: mutation.uniqueSampleKey,
        //         sample: mutation.sampleId,
        //         chr: mutation.gene.chromosome,
        //         start: mutation.startPosition,
        //         end: mutation.endPosition,
        //         proteinChange: mutation.proteinChange,
        //         mutationType: mutation.mutationType,
        //         color: getColorForProteinImpactType([mutation])
        //     }));
        //
        //     tracks.push({
        //         type: "annotation",
        //         visibilityWindow: 3088286401,
        //         displayMode: "FILL",
        //         name: "MUT",
        //         height: 25,
        //         features: mutFeatures
        //     });
        // }

        return tracks;
    }

    public render() {
        const labels = _.reduce(
            this.props.sampleManager.samples,
            (result: any, sample: ClinicalDataBySampleId, i: number) => {
                result[sample.id] = i + 1;
                return result;
            },
            {}
        );

        return (
            <div style={{ display: 'flex' }}>
                <span style={{ width: this.getTracksWidth() }}>
                    <IntegrativeGenomicsViewer
                        tracks={this.tracks}
                        locus={this.props.locus}
                    />
                </span>
                <If condition={this.shouldShowVAFPlot()}>
                    <ThumbnailExpandVAFPlot
                        data={this.frequencies}
                        order={this.props.sampleManager.sampleIndex}
                        colors={this.props.sampleColors}
                        labels={labels}
                        overlayPlacement="right"
                        cssClass="vafPlot"
                        genePanelIconData={
                            this.sampleIdToMutationGenePanelIconData
                        }
                    />
                </If>
            </div>
        );
    }

    private shouldShowVAFPlot(): boolean {
        return this.props.mergedMutations.length > 0 && this.isFrequencyExist();
    }

    private isFrequencyExist(): boolean {
        for (const frequencyId of Object.keys(this.frequencies)) {
            if (this.frequencies.hasOwnProperty(frequencyId)) {
                for (const frequency of this.frequencies[frequencyId]) {
                    return !isNaN(frequency);
                }
            }
        }
        return false;
    }

    private getTracksWidth(): number {
        return (
            this.props.containerWidth - (this.shouldShowVAFPlot() ? 140 : 40)
        );
    }

    private computeMutationFrequencyBySample(
        mergedMutations: Mutation[][]
    ): MutationFrequenciesBySample {
        const ret: MutationFrequenciesBySample = {};
        let sampleId;
        let freq;
        for (const mutations of mergedMutations) {
            for (const mutation of mutations) {
                if (
                    mutation.tumorAltCount >= 0 &&
                    mutation.tumorRefCount >= 0
                ) {
                    sampleId = mutation.sampleId;
                    freq =
                        mutation.tumorAltCount /
                        (mutation.tumorRefCount + mutation.tumorAltCount);
                    ret[sampleId] = ret[sampleId] || [];
                    ret[sampleId].push(freq);
                }
            }
        }
        for (const sampleId of Object.keys(this.props.sampleOrder)) {
            ret[sampleId] = ret[sampleId] || [];
            const shouldAdd = mergedMutations.length - ret[sampleId].length;
            for (let i = 0; i < shouldAdd; i++) {
                ret[sampleId].push(NaN);
            }
        }
        return ret;
    }
}
