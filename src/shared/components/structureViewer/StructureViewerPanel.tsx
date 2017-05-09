import * as React from 'react';
import {FormControl, Checkbox} from 'react-bootstrap';
import {If, Else, Then} from 'react-if';
import Collapse from 'react-collapse';
import {ThreeBounce} from 'better-react-spinkit';
import {observable, computed} from "mobx";
import {observer} from "mobx-react";

export interface IStructureViewerPanelProps {

}

export enum ProteinScheme {
    CARTOON, SPACE_FILLING, TRACE
}

export enum ProteinColor {
    UNIFORM, SECONDARY_STRUCTURE, NC_RAINBOW, ATOM_TYPE
}

export enum SideChain {
    ALL, SELECTED, NONE
}

export enum MutationColor {
    UNIFORM, MUTATION_TYPE, NONE
}

@observer
export default class StructureViewerPanel extends React.Component<IStructureViewerPanelProps, {}> {

    @observable protected isHelpCollapsed:boolean = true;
    @observable protected proteinScheme:ProteinScheme = ProteinScheme.CARTOON;
    @observable protected proteinColor:ProteinColor = ProteinColor.UNIFORM;
    @observable protected sideChain:SideChain = SideChain.SELECTED;
    @observable protected mutationColor:MutationColor = MutationColor.MUTATION_TYPE;
    @observable protected displayBoundMolecules:boolean = true;

    constructor() {
        super();

        this.toggleHelpCollapse = this.toggleHelpCollapse.bind(this);
        this.handleProteinSchemeChange = this.handleProteinSchemeChange.bind(this);
        this.handleProteinColorChange = this.handleProteinColorChange.bind(this);
        this.handleSideChainChange = this.handleSideChainChange.bind(this);
        this.handleMutationColorChange = this.handleMutationColorChange.bind(this);
        this.handleBoundMoleculeChange = this.handleBoundMoleculeChange.bind(this);
    }

    public proteinStyleMenu()
    {
        return (
            <span>
                <div className='mutation-3d-style-header'>
                    <span>Protein Style</span>
                </div>
                <table>
                    <tr>
                        <td>
                            <Checkbox
                                className='mutation-3d-display-non-protein'
                                checked={this.displayBoundMolecules}
                                onChange={this.handleBoundMoleculeChange as React.FormEventHandler<any>}
                            >
                                Display bound molecules
                            </Checkbox>
                            <img className='display-non-protein-help' src='{{helpImage}}'
                                 alt='Help (non-protein display)' />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span>Scheme:</span>
                            <FormControl
                                className="mutation-3d-protein-style-select"
                                componentClass="select"
                                title='Select 3d protein style'
                                value={`${this.proteinScheme}`}
                                onChange={this.handleProteinSchemeChange as React.FormEventHandler<any>}
                            >
                                <option value={ProteinScheme.CARTOON}
                                        title='Switch to the Cartoon Scheme'>cartoon</option>
                                <option value={ProteinScheme.SPACE_FILLING}
                                        title='Switch to the Space-filling Scheme'>space-filling</option>
                                <option value={ProteinScheme.TRACE}
                                        title='Switch to the Trace Scheme'>trace</option>
                            </FormControl>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span>Color:</span>
                            <FormControl
                                className="mutation-3d-protein-color-select"
                                componentClass="select"
                                title='Select 3d protein coloring'
                                value={`${this.proteinColor}`}
                                onChange={this.handleProteinColorChange as React.FormEventHandler<any>}
                            >
                                <option value={ProteinColor.UNIFORM}
                                        title='Uniform Color'>uniform</option>
                                <option value={ProteinColor.SECONDARY_STRUCTURE}
                                        title='Color by Secondary Structure'
                                        disabled={this.colorBySecondaryStructureDisabled}>secondary structure</option>
                                <option value={ProteinColor.NC_RAINBOW}
                                        title='Color by Rainbow Gradient'
                                        disabled={this.colorByNCRainbowDisabled}>N-C rainbow</option>
                                <option value={ProteinColor.ATOM_TYPE}
                                        title='Color by Atom Type'
                                        disabled={this.colorByAtomTypeDisabled}>atom type</option>
                            </FormControl>
                            <img className='protein-struct-color-help' src='{{helpImage}}'
                                 alt='Help (protein coloring)' />
                        </td>
                    </tr>
                </table>
            </span>
        );
    }

    public mutationStyleMenu()
    {
        return (
            <span>
                <div className='mutation-3d-style-header'>
                    <label>Mutation Style</label>
                </div>
                <table>
                    <tr>
                        <td>
                            <span>Side chain:</span>
                            <FormControl
                                className="mutation-3d-side-chain-select"
                                componentClass="select"
                                title='Select 3d protein side-chain display'
                                value={`${this.sideChain}`}
                                onChange={this.handleSideChainChange as React.FormEventHandler<any>}
                            >
                                <option value={SideChain.ALL}
                                        title='Display side chain for all mapped residues'>all</option>
                                <option value={SideChain.SELECTED}
                                        title='Display side chain for highlighted residues only'>selected</option>
                                <option value={SideChain.NONE}
                                        title='Do not display side chains'>none</option>
                            </FormControl>
                            <img className='display-side-chain-help' src='{{helpImage}}'
                                 alt='Help (side chain display)' />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span>Color:</span>
                            <FormControl
                                className="mutation-3d-mutation-color-select"
                                componentClass="select"
                                title='Select 3d protein mutation color'
                                value={`${this.mutationColor}`}
                                onChange={this.handleMutationColorChange as React.FormEventHandler<any>}
                            >
                                <option value={MutationColor.UNIFORM}
                                        title='Uniform color'>uniform</option>
                                <option value={MutationColor.MUTATION_TYPE}
                                        title='Color by mutation type'>mutation type</option>
                                <option value={MutationColor.NONE}
                                        title='Do not color'>none</option>
                            </FormControl>
                            <img className='mutation-type-color-help' src='{{helpImage}}'
                                 alt='Help (mutation type coloring)' />
                        </td>
                    </tr>
                </table>
            </span>
        );
    }

    public helpContent()
    {
        return (
            <div>
                <h4>3D visualizer basic interaction</h4>
                <b>Zoom in/out:</b> Press and hold the SHIFT key and the left mouse button, and then move the mouse backward/forward.<br/>
                <b>Pan:</b> Press and hold the CTRL key, click and hold the left mouse button, and then move the mouse in the desired direction.<br/>
                <b>Rotate:</b> Press and hold the left mouse button, and then move the mouse in the desired direction to rotate along the x and y axes.<br/>
            </div>
        );
    }

    public render() {
        return (
            <div>
                <If condition={false}>
                    <span className='mutation-3d-residue-warning'>
                        Selected location(s) cannot be mapped onto this structure
                    </span>
                </If>
                <div className='mutation-3d-vis-container'>
                    displayBoundMolecules: {`${this.displayBoundMolecules}`} <br/>
                    isHelpCollapsed: {`${this.isHelpCollapsed}`} <br/>
                    selectedScheme: {this.proteinScheme} <br/>
                    selectedProteinColor: {this.proteinColor} <br/>
                    selectedSideChain: {this.sideChain} <br/>
                    selectedMutationColor: {this.mutationColor} <br/>
                </div>
                <div className='mutation-3d-vis-toolbar'>
                    <div className='mutation-3d-vis-help-init'>
                        <table>
                            <tr>
                                <td>
                                    <button className='mutation-3d-pymol-dload'>PyMOL</button>
                                </td>
                                <td>
                                    <div className="mutation-3d-vis-help-open" onClick={this.toggleHelpCollapse}>
                                        how to pan/zoom/rotate?
                                        <span className="secondary-content">
                                            <If condition={this.isHelpCollapsed}>
                                                <Then>
                                                    <i className="fa fa-chevron-down"/>
                                                </Then>
                                                <Else>
                                                    <i className="fa fa-chevron-up"/>
                                                </Else>
                                            </If>
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <Collapse isOpened={!this.isHelpCollapsed}>
                        {this.helpContent()}
                    </Collapse>
                    <table className="mutation-3d-controls-menu">
                        <tr>
                            <td className='mutation-3d-protein-style-menu'>
                                {this.proteinStyleMenu()}
                            </td>
                            <td className='mutation-3d-mutation-style-menu'>
                                {this.mutationStyleMenu()}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        );
    }

    private toggleHelpCollapse() {
        this.isHelpCollapsed = !this.isHelpCollapsed;
    }

    private handleProteinSchemeChange(evt:React.FormEvent<HTMLSelectElement>) {
        this.proteinScheme = parseInt((evt.target as HTMLSelectElement).value, 10);

        // when the protein scheme is SPACE_FILLING, NC_RAINBOW and SECONDARY_STRUCTURE are not allowed
        if (this.proteinScheme === ProteinScheme.SPACE_FILLING &&
            (this.proteinColor === ProteinColor.NC_RAINBOW || this.proteinColor === ProteinColor.SECONDARY_STRUCTURE))
        {
            this.proteinColor = ProteinColor.UNIFORM;
        }
        // when the protein scheme is CARTOON or TRACE, ATOM_TYPE is not allowed
        else if ((this.proteinScheme === ProteinScheme.TRACE || this.proteinScheme === ProteinScheme.CARTOON) &&
            this.proteinColor === ProteinColor.ATOM_TYPE)
        {
            this.proteinColor = ProteinColor.UNIFORM;
        }
    }

    private handleProteinColorChange(evt:React.FormEvent<HTMLSelectElement>) {
        this.proteinColor = parseInt((evt.target as HTMLSelectElement).value, 10);
    }

    private handleSideChainChange(evt:React.FormEvent<HTMLSelectElement>) {
        this.sideChain = parseInt((evt.target as HTMLSelectElement).value, 10);
    }

    private handleMutationColorChange(evt:React.FormEvent<HTMLSelectElement>) {
        this.mutationColor = parseInt((evt.target as HTMLSelectElement).value, 10);
    }

    private handleBoundMoleculeChange() {
        this.displayBoundMolecules = !this.displayBoundMolecules;
    }

    @computed get colorBySecondaryStructureDisabled()
    {
        return this.proteinScheme === ProteinScheme.SPACE_FILLING;
    }

    @computed get colorByNCRainbowDisabled()
    {
        return this.proteinScheme === ProteinScheme.SPACE_FILLING;
    }

    @computed get colorByAtomTypeDisabled()
    {
        return this.proteinScheme !== ProteinScheme.SPACE_FILLING;
    }
}
