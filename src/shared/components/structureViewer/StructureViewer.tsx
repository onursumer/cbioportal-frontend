import * as React from 'react';

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
    // TODO position and color mapping...
}

export default class StructureViewer extends React.Component<IStructureViewerProps, {}> {

    public render()
    {
        return (
            <span>
                displayBoundMolecules: {`${this.props.displayBoundMolecules}`} <br/>
                selectedScheme: {this.props.proteinScheme} <br/>
                selectedProteinColor: {this.props.proteinColor} <br/>
                selectedSideChain: {this.props.sideChain} <br/>
                selectedMutationColor: {this.props.mutationColor} <br/>
            </span>
        );
    }

}