import * as React from 'react';
import {FormControl, Checkbox} from 'react-bootstrap';
import {If, Else, Then} from 'react-if';
import Collapse from 'react-collapse';
import {ThreeBounce} from 'better-react-spinkit';
import {observable, computed} from "mobx";
import {observer} from "mobx-react";
import Draggable from 'react-draggable';
import DefaultTooltip from "shared/components/DefaultTooltip";
import {ProteinScheme, ProteinColor, SideChain, MutationColor, default as StructureViewer} from "./StructureViewer";

export interface IStructureViewerPanelProps {

}

@observer
export default class StructureViewerPanel extends React.Component<IStructureViewerPanelProps, {}> {

    @observable protected isHelpCollapsed:boolean = true;
    @observable protected proteinScheme:ProteinScheme = ProteinScheme.CARTOON;
    @observable protected proteinColor:ProteinColor = ProteinColor.UNIFORM;
    @observable protected sideChain:SideChain = SideChain.SELECTED;
    @observable protected mutationColor:MutationColor = MutationColor.MUTATION_TYPE;
    @observable protected displayBoundMolecules:boolean = true;
    @observable protected isClosed:boolean = false;

    constructor() {
        super();

        this.toggleHelpCollapse = this.toggleHelpCollapse.bind(this);
        this.handleProteinSchemeChange = this.handleProteinSchemeChange.bind(this);
        this.handleProteinColorChange = this.handleProteinColorChange.bind(this);
        this.handleSideChainChange = this.handleSideChainChange.bind(this);
        this.handleMutationColorChange = this.handleMutationColorChange.bind(this);
        this.handleBoundMoleculeChange = this.handleBoundMoleculeChange.bind(this);
        this.handlePyMolDownload = this.handlePyMolDownload.bind(this);
        this.handlePanelClose = this.handlePanelClose.bind(this);
    }

    public selectionTitle(text: string, tooltip?: JSX.Element)
    {
        let content:JSX.Element|null = null;

        if (tooltip)
        {
            content = this.defaultInfoTooltip(tooltip);
        }

        return (
            <span>
                {text} {content}:
            </span>
        )
    }

    public defaultInfoTooltip(tooltip: JSX.Element)
    {
        return (
            <DefaultTooltip
                placement="top"
                overlay={() => tooltip}
                arrowContent={<div className="rc-tooltip-arrow-inner"/>}
                destroyTooltipOnHide={true}
            >
                <i className="fa fa-info-circle"/>
            </DefaultTooltip>
        );
    }

    public proteinColorTooltipContent()
    {
        return (
            <div style={{maxWidth: "400px", maxHeight: "200px", overflowY: "auto"}}>
                Color options for the protein structure.<br />
                <br />
                <b>Uniform:</b> Colors the entire protein structure with a
                <span className='mutation-3d-loop'>single color</span>.<br />
                <b>Secondary structure:</b> Colors the protein by secondary structure.
                Assigns different colors for <span className='mutation-3d-alpha-helix'>alpha helices</span>,
                <span className='mutation-3d-beta-sheet'>beta sheets</span>, and
                <span className='mutation-3d-loop'>loops</span>.
                This color option is not available for the space-filling protein scheme.<br />
                <b>N-C rainbow:</b> Colors the protein with a rainbow gradient
                from red (N-terminus) to blue (C-terminus).<br />
                <b>Atom Type:</b> Colors the structure with respect to the atom type (CPK color scheme).
                This color option is only available for the space-filling protein scheme.<br />
                <br />
                The selected chain is always displayed with full opacity while the rest of the structure
                has some transparency to help better focusing on the selected chain.
            </div>
        )
    }


    public sideChainTooltipContent()
    {
        return (
            <div style={{maxWidth: "400px", maxHeight: "200px", overflowY: "auto"}}>
                Display options for the side chain atoms.<br />
                <br />
                <b>All:</b> Displays the side chain atoms for every mapped residue.<br />
                <b>Selected:</b> Displays the side chain atoms only for the selected mutations.<br />
                <b>None:</b> Hides the side chain atoms.<br />
                <br />
                This option has no effect for the space-filling protein scheme.
            </div>
        );
    }

    public mutationColorTooltipContent()
    {
        return (
            <div style={{maxWidth: "400px", maxHeight: "200px", overflowY: "auto"}}>
                Color options for the mapped mutations.<br />
                <br />
                <b>Uniform:</b> Colors all mutated residues with a
                <span className='uniform_mutation'>single color</span>.<br/>
                <b>Mutation type:</b> Enables residue coloring by mutation type.
                Mutation types and corresponding color codes are as follows:
                <ul>
                    <li>
                        <span className='missense_mutation'>Missense Mutations</span>
                    </li>
                    <li>
                        <span className='trunc_mutation'>Truncating Mutations</span>
                        (Nonsense, Nonstop, FS del, FS ins)
                    </li>
                    <li>
                        <span className='inframe_mutation'>Inframe Mutations</span>
                        (IF del, IF ins)
                    </li>
                </ul>
                <b>None:</b> Disables coloring of the mutated residues
                except for manually selected (highlighted) residues.<br />
                <br />
                Highlighted residues are colored with <span className='mutation-3d-highlighted'>yellow</span>.
            </div>
        );
    }

    public boundMoleculesTooltipContent()
    {
        return (
            <div style={{maxWidth: "400px", maxHeight: "200px", overflowY: "auto"}}>
                Displays co-crystalized molecules.
                This option has no effect if the current structure does not contain any co-crystalized bound molecules.
            </div>
        );
    }

    public proteinStyleMenu()
    {
        return (
            <span>
                <div className='row text-center'>
                    <span>Protein Style</span>
                    <hr />
                </div>
                <div className='row'>
                    <Checkbox
                        checked={this.displayBoundMolecules}
                        onChange={this.handleBoundMoleculeChange as React.FormEventHandler<any>}
                    >
                        Display bound molecules {this.defaultInfoTooltip(this.boundMoleculesTooltipContent())}
                    </Checkbox>
                </div>
                <div className="row">
                    <div className="col col-sm-6">
                        <div className="row">
                            {this.selectionTitle("Scheme")}
                        </div>
                        <div className="row">
                            <FormControl
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
                        </div>
                    </div>
                    <div className="col col-sm-6">
                        <div className="row">
                            {this.selectionTitle("Color", this.proteinColorTooltipContent())}
                        </div>
                        <div className="row">
                            <FormControl
                                componentClass="select"
                                title='Select 3d protein coloring'
                                value={`${this.proteinColor}`}
                                onChange={this.handleProteinColorChange as React.FormEventHandler<any>}
                            >
                                <option
                                    value={ProteinColor.UNIFORM}
                                    title='Uniform Color'
                                >
                                    uniform
                                </option>
                                <option
                                    value={ProteinColor.SECONDARY_STRUCTURE}
                                    title='Color by Secondary Structure'
                                    disabled={this.colorBySecondaryStructureDisabled}
                                >
                                    secondary structure
                                </option>
                                <option
                                    value={ProteinColor.NC_RAINBOW}
                                    title='Color by Rainbow Gradient'
                                    disabled={this.colorByNCRainbowDisabled}
                                >
                                    N-C rainbow
                                </option>
                                <option
                                    value={ProteinColor.ATOM_TYPE}
                                    title='Color by Atom Type'
                                    disabled={this.colorByAtomTypeDisabled}
                                >
                                    atom type
                                </option>
                            </FormControl>
                        </div>
                    </div>
                </div>
            </span>
        );
    }

    public mutationStyleMenu()
    {
        return (
            <span>
                <div className='row text-center'>
                    <span>Mutation Style</span>
                    <hr />
                </div>
                <div className="row">
                    <div className="col col-sm-6">
                        <div className="row">
                            {this.selectionTitle("Side Chain", this.sideChainTooltipContent())}
                        </div>
                        <div className="row">
                            <FormControl
                                componentClass="select"
                                title='Select 3d protein side-chain display'
                                value={`${this.sideChain}`}
                                onChange={this.handleSideChainChange as React.FormEventHandler<any>}
                            >
                                <option
                                    value={SideChain.ALL}
                                    title='Display side chain for all mapped residues'
                                >
                                    all
                                </option>
                                <option
                                    value={SideChain.SELECTED}
                                    title='Display side chain for highlighted residues only'
                                >
                                    selected
                                </option>
                                <option
                                    value={SideChain.NONE}
                                    title='Do not display side chains'
                                >
                                    none
                                </option>
                            </FormControl>
                        </div>
                    </div>
                    <div className="col col-sm-6">
                        <div className="row">
                            {this.selectionTitle("Color", this.mutationColorTooltipContent())}
                        </div>
                        <div className="row">
                            <FormControl
                                componentClass="select"
                                title='Select 3d protein mutation color'
                                value={`${this.mutationColor}`}
                                onChange={this.handleMutationColorChange as React.FormEventHandler<any>}
                            >
                                <option
                                    value={MutationColor.UNIFORM}
                                    title='Uniform color'
                                >
                                    uniform
                                </option>
                                <option
                                    value={MutationColor.MUTATION_TYPE}
                                    title='Color by mutation type'
                                >
                                    mutation type
                                </option>
                                <option
                                    value={MutationColor.NONE}
                                    title='Do not color'
                                >
                                    none
                                </option>
                            </FormControl>
                        </div>
                    </div>
                </div>
            </span>
        );
    }

    public topToolbar()
    {
        return (
            <div className='row'>
                <div className="col col-sm-4">
                    <button
                        className='btn btn-default btn-sm'
                        onClick={this.handlePyMolDownload}
                    >
                        PyMOL
                    </button>
                </div>
                <div className="col col-sm-8" onClick={this.toggleHelpCollapse}>
                    <span className="pull-right">
                        <span>how to pan/zoom/rotate?</span>
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
            </div>
        );
    }

    public helpContent()
    {
        return (
            <div className="col col-sm-12">
                <h4>3D visualizer basic interaction</h4>
                <b>Zoom in/out:</b> Press and hold the SHIFT key and the left mouse button, and then move the mouse backward/forward.<br />
                <b>Pan:</b> Press and hold the CTRL key, click and hold the left mouse button, and then move the mouse in the desired direction.<br />
                <b>Rotate:</b> Press and hold the left mouse button, and then move the mouse in the desired direction to rotate along the x and y axes.<br />
            </div>
        );
    }

    public header()
    {
        return (
            <div className='row'>
                <div className='col col-sm-8'>
                    <span>3D Structure</span>
                </div>
                <div className="col col-sm-4">
                    <span className="pull-right">
                        <i className="fa fa-times" onClick={this.handlePanelClose}/>
                    </span>
                </div>
            </div>
        )
    }

    public render() {
        if (this.isClosed) {
            return null;
        }

        return (
            <Draggable
                handle=".structure-viewer-header"
            >
                <div>
                    <div className="structure-viewer-header row">
                        {this.header()}
                        <hr/>
                    </div>
                    <If condition={false}>
                        <span>
                            Selected location(s) cannot be mapped onto this structure
                        </span>
                    </If>
                    <div className='mutation-3d-vis-container row'>
                        <StructureViewer
                            displayBoundMolecules={this.displayBoundMolecules}
                            proteinScheme={this.proteinScheme}
                            proteinColor={this.proteinColor}
                            sideChain={this.sideChain}
                            mutationColor={this.mutationColor}
                        />
                    </div>
                    <div className='row'>
                        {this.topToolbar()}
                        <div className="row">
                            <Collapse isOpened={!this.isHelpCollapsed}>
                                {this.helpContent()}
                            </Collapse>
                        </div>
                        <div className="row">
                            <div className='col col-sm-6'>
                                {this.proteinStyleMenu()}
                            </div>
                            <div className='col col-sm-6'>
                                {this.mutationStyleMenu()}
                            </div>
                        </div>
                    </div>
                </div>
            </Draggable>
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

    private handlePyMolDownload() {
        // TODO generate a PyMol script for the current state of the viewer
    }

    private handlePanelClose() {
        this.isClosed = true;
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
