import * as _ from 'lodash';
import {PdbHeader} from "shared/api/generated/PdbAnnotationAPI";

/**
 * Generates a pdb info summary for the given pdb header and the chain id.
 */
export function generatePdbInfoSummary(pdbHeader:PdbHeader, chainId: string)
{
    const summary: {
        pdbInfo: string,
        moleculeInfo?: string
    } = {
        pdbInfo: pdbHeader.title
    };

    // get chain specific molecule info
    _.find(pdbHeader.compound, (mol:any) => {
        if (mol.molecule &&
            _.indexOf(mol.chain, chainId.toLowerCase()) !== -1)
        {
            // chain is associated with this mol,
            // get the organism info from the source
            summary.moleculeInfo = mol.molecule;
            return mol;
        }
    });

    return summary;
}
