import * as React from 'react';
import $ from 'jquery';
import {observer} from "mobx-react";
import {observable} from "mobx";

// 3Dmol expects "this" to be the global context
const $3Dmol = require('imports?this=>window!3dmol/build/3Dmol-nojquery.js');

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

export interface IStructureViewerProps {
    proteinScheme:ProteinScheme;
    proteinColor:ProteinColor;
    sideChain:SideChain;
    mutationColor:MutationColor;
    displayBoundMolecules:boolean;
    pdbId:string;
    chainId:string;
    // TODO position and color mapping...
    // TODO 3Dmol settings (see Mutation3dVis options for details)
}

@observer
export default class StructureViewer extends React.Component<IStructureViewerProps, {}>
{
    private _3dMolDiv:HTMLDivElement|undefined;
    private _3dMolViewer:any;

    public constructor() {
        super();

        this.divHandler = this.divHandler.bind(this);
        this.updateViewer = this.updateViewer.bind(this);
    }

    public render()
    {
        return (
            <div
                ref={this.divHandler}
                style={{height: "300px"}}
            />
        );
    }

    public componentDidMount() {
        const options = {
            doAssembly: true,
            // multiMode: true,
            // frames: true
        };

        if (this._3dMolDiv) {
            const viewer = $3Dmol.createViewer(
                $(this._3dMolDiv),
                {defaultcolors: $3Dmol.elementColors.rasmol}
            );

            viewer.setBackgroundColor(0xffffff);

            this._3dMolViewer = viewer;

            $3Dmol.download(`pdb:${this.props.pdbId.toUpperCase()}`, this._3dMolViewer, options, this.updateViewer);
        }
    }

    public componentDidUpdate() {
        this.updateViewer(this.props);
    }

    protected updateViewer(props:IStructureViewerProps = this.props) {
        // TODO follow the logic in the MolScriptGenerator & Mol3DScriptGenerator from MutationMapper...

        const selected = {};
        const schemeSpecs:{[scheme:number]: any} = {};

        schemeSpecs[ProteinScheme.CARTOON] = {cartoon: {}};
        schemeSpecs[ProteinScheme.TRACE] = {cartoon: {style: "trace"}};
        schemeSpecs[ProteinScheme.SPACE_FILLING] = {sphere: {scale: 0.6}};

        this._3dMolViewer.setStyle(selected, schemeSpecs[props.proteinScheme]);

        this._3dMolViewer.render();
    }

    private divHandler(div:HTMLDivElement) {
         this._3dMolDiv = div;
    }
}
