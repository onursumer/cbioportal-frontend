import {Query, EvidenceQueries} from "../api/OncoKbAPI";

/**
 * @author Selcuk Onur Sumer
 * @author Hongxin Zhang
 */

export function generateEvidenceQuery(queryVariants:Query[]): EvidenceQueries
{
    return {
        evidenceTypes: "GENE_SUMMARY,GENE_BACKGROUND,ONCOGENIC,MUTATION_EFFECT,VUS,STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY,STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE,INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY",
        highestLevelOnly: true,
        levels: ['LEVEL_1', 'LEVEL_2A', 'LEVEL_2B', 'LEVEL_3A', 'LEVEL_3B', 'LEVEL_4', 'LEVEL_R1'],
        queries: queryVariants,
        source: "cbioportal"
    }
}

export function generateQueryVariant(hugoSymbol:string,
                                     mutationType:string,
                                     proteinChange:string,
                                     proteinPosStart:number,
                                     proteinPosEnd:number,
                                     tumorType:string): Query
{
    return {
        id: generateQueryVariantId(hugoSymbol, mutationType, proteinChange, tumorType),
        hugoSymbol,
        tumorType,
        alterationType: "MUTATION",
        entrezGeneId: 0,
        alteration: proteinChange,
        consequence: convertConsequence(mutationType),
        proteinStart: proteinPosStart,
        proteinEnd: proteinPosEnd,
    };
}

export function generateQueryVariantId(hugoSymbol:string,
                                       mutationType:string,
                                       proteinChange:string,
                                       tumorType:string): string
{
    return `${hugoSymbol}_${proteinChange}_${tumorType}_${mutationType}`;
}

function normalizeLevel(level:string):string|null
{
    if (level)
    {
        const matchArray = level.match(/LEVEL_(R?\d[AB]?)/);

        if (matchArray && matchArray.length >= 2) {
            return matchArray[1];
        }
        else {
            return level;
        }
    }
    else {
        return null;
    }
}

export function oncogenicImageClassNames(oncogenic:string,
                                         isVUS:boolean,
                                         highestSensitiveLevel:string,
                                         highestResistanceLevel:string):string[]
{
    let classNames = ["", ""];

    const oncogenicToIcon:{[oncogenic:string] : string} = {
        'Likely Neutral': 'likely-neutral',
        'Unknown': 'unknown-oncogenic',
        'Inconclusive': 'unknown-oncogenic',
        'Likely Oncogenic': 'oncogenic',
        'Oncogenic': 'oncogenic',
    };

    const sl = normalizeLevel(highestSensitiveLevel);
    const rl = normalizeLevel(highestResistanceLevel);

    if (!rl && sl)
    {
        classNames[0] = 'level' + sl;
    }
    else if (rl && !sl)
    {
        classNames[0] = 'level' + rl;
    }
    else if (rl && sl)
    {
        classNames[0] = 'level' + sl + 'R';
    }

    classNames[1] = oncogenicToIcon[oncogenic] || "no-info-oncogenic";

    if(classNames[1] === 'no-info-oncogenic' && isVUS)
    {
        classNames[1] = 'vus';
    }

    return classNames;
}

export function calcOncogenicScore(oncogenic:string, isVus:boolean)
{
    const oncogenicScore:{[oncogenic:string]: number} = {
        'Unknown': 2,
        'Inconclusive': 3,
        'Likely Neutral': 4,
        'Likely Oncogenic': 5,
        'Oncogenic': 5
    };

    let score:number = oncogenicScore[oncogenic] || 0;

    if (score === 0 && isVus) {
        score = 1;
    }

    return score;
}

export function calcSensitivityLevelScore(level:string)
{
    const levelScore:{[level:string]: number} = {
        '0': 1,
        '1': 2,
        '2A': 3,
        '2B': 4,
        '3A': 5,
        '3B': 6,
        '4': 7
    };

    return levelScore[normalizeLevel(level) || ""] || 0;
}

export function calcResistanceLevelScore(level:string)
{
    const levelScore:{[level:string]: number} = {
        'R1': 1,
        'R2': 2,
        'R3': 3,
    };

    return levelScore[normalizeLevel(level) || ""] || 0;
}

/**
 * Convert cBioPortal consequence to OncoKB consequence
 *
 * @param consequence cBioPortal consequence
 * @returns
 */
export function convertConsequence(consequence:string) {
    const matrix:{[consequence:string]: string[]} = {
        '3\'Flank': ['any'],
        '5\'Flank ': ['any'],
        'Targeted_Region': ['inframe_deletion', 'inframe_insertion'],
        'COMPLEX_INDEL': ['inframe_deletion', 'inframe_insertion'],
        'ESSENTIAL_SPLICE_SITE': ['feature_truncation'],
        'Exon skipping': ['inframe_deletion'],
        'Frameshift deletion': ['frameshift_variant'],
        'Frameshift insertion': ['frameshift_variant'],
        'FRAMESHIFT_CODING': ['frameshift_variant'],
        'Frame_Shift_Del': ['frameshift_variant'],
        'Frame_Shift_Ins': ['frameshift_variant'],
        'Fusion': ['fusion'],
        'Indel': ['frameshift_variant', 'inframe_deletion', 'inframe_insertion'],
        'In_Frame_Del': ['inframe_deletion'],
        'In_Frame_Ins': ['inframe_insertion'],
        'Missense': ['missense_variant'],
        'Missense_Mutation': ['missense_variant'],
        'Nonsense_Mutation': ['stop_gained'],
        'Nonstop_Mutation': ['stop_lost'],
        'Splice_Site': ['splice_region_variant'],
        'Splice_Site_Del': ['splice_region_variant'],
        'Splice_Site_SNP': ['splice_region_variant'],
        'splicing': ['splice_region_variant'],
        'Translation_Start_Site': ['start_lost'],
        'vIII deletion': ['any']
    };

    if (consequence in matrix) {
        return matrix[consequence].join(',');
    } else {
        return 'any';
    }
}