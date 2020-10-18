import * as React from 'react';
import _ from 'lodash';
import { PatientViewPageStore } from '../clinicalInformation/PatientViewPageStore';
import 'pathway-mapper/dist/base.css';
import PathwayMapperTable, {
    IPathwayMapperTable,
    IPathwayMapperTableColumnType,
} from '../../../shared/lib/pathwayMapper/PathwayMapperTable';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';
import { observable, computed, action } from 'mobx';
import { Row } from 'react-bootstrap';

import { AppStore } from 'AppStore';
import { remoteData } from 'cbioportal-frontend-commons';
import { fetchGenes } from 'shared/lib/StoreUtils';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import PatientViewUrlWrapper from '../PatientViewUrlWrapper';
import { getGeneticTrackRuleSetParams } from 'shared/components/oncoprint/OncoprintUtils';
import PathwayMapper, { ICBioData } from 'pathway-mapper';

import 'cytoscape-panzoom/cytoscape.js-panzoom.css';
import 'cytoscape-navigator/cytoscape.js-navigator.css';
import 'react-toastify/dist/ReactToastify.css';
import { buildCBioLink } from 'shared/api/urls';

const alterationFrequencyData: ICBioData[] = [];

interface IPatientViewPathwayMapperProps {
    store: PatientViewPageStore;
    appStore: AppStore;
    urlWrapper: PatientViewUrlWrapper;
}

const DEFAULT_RULESET_PARAMS = getGeneticTrackRuleSetParams(true, true, true);

@observer
export default class PatientViewPathwayMapper extends React.Component<
    IPatientViewPathwayMapperProps
> {
    @observable
    private addGenomicData: (alterationData: ICBioData[]) => void;

    constructor(props: IPatientViewPathwayMapperProps) {
        super(props);

        // @ts-ignore
        import(/* webpackChunkName: "pathway-mapper" */ 'pathway-mapper').then(
            (module: any) => {
                this.PathwayMapperComponent = (module as any)
                    .default as PathwayMapper;
            }
        );
    }

    @observable.ref PathwayMapperComponent:
        | PathwayMapper
        | undefined = undefined;

    //here for nonquery genes
    @computed get alterationFrequencyData(): ICBioData[] {
        return this.alterationFrequencyDataForQueryGenes;
    }
    @computed get alterationFrequencyDataForQueryGenes() {
        this.props.store.mergedMutationDataIncludingUncalledFilteredByGene.forEach(
            altData => {
                const mutationType = {
                    gene: altData[0].gene.hugoGeneSymbol,
                    altered: 1,
                    sequenced: 1,
                    percentAltered: altData[0].mutationType,
                    geneticTrackRuleSetParams: DEFAULT_RULESET_PARAMS,
                    geneticTrackData: this.props.store.geneticTrackData.result
                        ? this.props.store.geneticTrackData.result[
                              altData[0].gene.hugoGeneSymbol
                          ]
                        : undefined,
                };
                if (mutationType) {
                    alterationFrequencyData.push(mutationType);
                }
            }
        );

        this.props.store.mergedDiscreteCNADataFilteredByGene.forEach(
            altData => {
                const cna = {
                    gene: altData[0].gene.hugoGeneSymbol,
                    altered: 1,
                    sequenced: 1,
                    percentAltered: this.getCNAtypes(altData[0].alteration),
                    geneticTrackRuleSetParams: DEFAULT_RULESET_PARAMS,
                    geneticTrackData: this.props.store.geneticTrackData.result
                        ? this.props.store.geneticTrackData.result[
                              altData[0].gene.hugoGeneSymbol
                          ]
                        : undefined,
                };
                if (cna) {
                    alterationFrequencyData.push(cna);
                }
            }
        );

        return alterationFrequencyData;
    }
    private getCNAtypes(CNAtype: number) {
        switch (CNAtype) {
            case -2:
                return 'DeepDel';
            case -1:
                return 'SHALLOWDEL';
            case 0:
                return 'DIPLOID';
            case 1:
                return 'GAIN';
            default:
                return 'AMP';
        }
    }

    private getQueryGenes(data: ICBioData[]) {
        const allTypes = data.map(x => x.gene);

        const allGenes = allTypes.filter((x, i, a) => a.indexOf(x) == i);
        //This parameter needs the hugoGeneSymbol in PathwayMapper
        const keyed_genes = allGenes.map(gene => {
            return { hugoGeneSymbol: gene };
        });
        return keyed_genes;
    }
    @computed get isStoreReady() {
        return (
            this.patientStore &&
            this.patientStore.samples.isComplete &&
            this.patientStore.mergedMutationData &&
            this.patientStore.coverageInformation.isComplete &&
            this.patientStore.mergedDiscreteCNADataFilteredByGene &&
            this.patientStore.mergedMutationDataIncludingUncalledFilteredByGene
        );
    }
    public render() {
        //control the data
        if (this.isStoreReady) {
            this.addGenomicData(this.alterationFrequencyData);
            this.getQueryGenes(this.alterationFrequencyData);
        }
        if (!this.PathwayMapperComponent) {
            return null;
        }
        return (
            <div className="pathwayMapper">
                <div
                    data-test="pathwayMapperTabDiv"
                    className="cBioMode"
                    style={{ width: '99%' }}
                >
                    <Row>
                        <React.Fragment>
                            {/*
                                  // @ts-ignore */}
                            <this.PathwayMapperComponent
                                isCBioPortal={true}
                                isCollaborative={false}
                                genes={this.getQueryGenes(
                                    this.alterationFrequencyData
                                )}
                                cBioAlterationData={
                                    this.alterationFrequencyData
                                }
                                addGenomicDataHandler={
                                    this.addGenomicDataHandler
                                }
                                tableComponent={this.renderTable}
                                patientView={true}
                                //message banner patch will be removed
                                messageBanner={this.renderBanner}
                            />
                            <ToastContainer
                                closeButton={<i className="fa fa-times" />}
                            />
                        </React.Fragment>
                    </Row>
                </div>
            </div>
        );
    }

    @computed get patientStore(): PatientViewPageStore | undefined {
        let patientStore: PatientViewPageStore | undefined;
        return patientStore;
    }
    /**
     * addGenomicData function is implemented in PathwayMapper component and overlays
     * alteration data onto genes. Through this function callback, the function implemented
     * in PathwayMapper is copied here.
     */
    @autobind
    @action
    private addGenomicDataHandler(
        addGenomicData: (alterationData: ICBioData[]) => void
    ) {
        this.addGenomicData = addGenomicData;
    }
    //will be removed when Banner is added
    @autobind
    private renderBanner() {
        return null;
    }
    @autobind
    private renderTable(
        data: IPathwayMapperTable[],
        selectedPathway: string,
        onPathwaySelect: (pathway: string) => void
    ) {
        return (
            <PathwayMapperTable
                data={data}
                selectedPathway={selectedPathway}
                changePathway={onPathwaySelect}
                columnsOverride={{
                    [IPathwayMapperTableColumnType.SCORE]: {
                        name: '# Genes matched',
                        tooltip: <span>Number of Genes Matched</span>,
                    },
                }}
            />
        );
    }
}
