import { ICBioData } from 'pathway-mapper';
import _ from 'lodash';

// Calculates truncated version of gene string without truncating gene names.
// That is, instead of truncating a gene name, removes it all.
// For example, if the gene string is MDM2 CDKN2A, instead of truncating it as "MDM2 CKDN ...",
// produces "MDM2 ..."
export function truncateGeneList(
    genesMatched: string[],
    lengthThreshold: number
) {
    let runningLength = 0;
    let geneStr = '';

    for (const geneName of genesMatched) {
        runningLength += geneName.length;
        if (runningLength < lengthThreshold) {
            geneStr += geneName + ' ';
            runningLength++; //Whitespace is added
        } else {
            return geneStr + '...';
        }
    }

    return geneStr.trim();
}

export function getUniqueGenes(data: ICBioData[]) {
    return _.uniq(data.map(x => x.gene)).map(gene => ({
        hugoGeneSymbol: gene,
    }));
}

export function getCnaTypes(cnaType: number) {
    switch (cnaType) {
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
