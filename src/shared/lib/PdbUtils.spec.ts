import { assert } from 'chai';
import {convertPdbPosToResCode, convertPdbPosToResAndInsCode, mergeAlignments} from './PdbUtils';
import {initPdbAlignment} from "test/PdbMockUtils";
import {IPdbPositionRange, IPdbChain} from "shared/model/Pdb";
import {PdbUniprotAlignment} from "shared/api/generated/PdbAnnotationAPI";

describe('PdbUtils', () => {

    let pointPositionRange: IPdbPositionRange;
    let pointPositionRangeWithInsertion: IPdbPositionRange;
    let multiPositionRange: IPdbPositionRange;
    let multiPositionRangeWithInsertion: IPdbPositionRange;

    before(() => {
        pointPositionRange = {
            start: {
                position: 666
            },
            end: {
                position: 666
            }
        };

        multiPositionRange = {
            start: {
                position: 666
            },
            end: {
                position: 668
            }
        };

        pointPositionRangeWithInsertion = {
            start: {
                position: 666,
                insertionCode: "D"
            },
            end: {
                position: 666
            }
        };

        multiPositionRangeWithInsertion = {
            start: {
                position: 666,
                insertionCode: "D"
            },
            end: {
                position: 668,
                insertionCode: "D"
            }
        };
    });

    it('converts pdb positions to residue codes', () => {
        assert.deepEqual(convertPdbPosToResCode(pointPositionRange), ["666"]);
        assert.deepEqual(convertPdbPosToResCode(multiPositionRange), ["666", "667", "668"]);
        assert.deepEqual(convertPdbPosToResCode(pointPositionRangeWithInsertion), ["666^D"]);
        assert.deepEqual(convertPdbPosToResCode(multiPositionRangeWithInsertion), ["666^D", "667", "668^D"]);
    });

    it('converts pdb positions to residue and insertion code pairs', () => {
        assert.deepEqual(convertPdbPosToResAndInsCode(pointPositionRange),
            [{resi: 666}]);
        assert.deepEqual(convertPdbPosToResAndInsCode(multiPositionRange),
            [{resi: 666}, {resi: 667}, {resi: 668}]);
        assert.deepEqual(convertPdbPosToResAndInsCode(pointPositionRangeWithInsertion),
            [{resi: 666, icode: "D"}]);
        assert.deepEqual(convertPdbPosToResAndInsCode(multiPositionRangeWithInsertion),
            [{resi: 666, icode: "D"}, {resi: 667}, {resi: 668, icode: "D"}]);
    });

    it('merges alignments properly', () => {
        let alignments: PdbUniprotAlignment[];
        let chain: IPdbChain|undefined;

        // overlapping, ordered
        alignments = [
            initPdbAlignment("ABCDEFG", 6),
            initPdbAlignment("EFGXYZ", 10),
        ];

        chain = mergeAlignments(alignments);
        assert.equal(chain && chain.alignment, "ABCDEFGXYZ");
        assert.equal(chain && chain.uniprotStart, 6);
        assert.equal(chain && chain.uniprotEnd, 15);

        // overlapping, reverse ordered
        alignments = [
            initPdbAlignment("EFGXYZ", 10),
            initPdbAlignment("ABCDEFG", 6)
        ];

        chain = mergeAlignments(alignments);
        assert.equal(chain && chain.alignment, "ABCDEFGXYZ");
        assert.equal(chain && chain.uniprotStart, 6);
        assert.equal(chain && chain.uniprotEnd, 15);

        // gap, ordered
        alignments = [
            initPdbAlignment("Portal", 2),
            initPdbAlignment("Rocks", 11)
        ];

        chain = mergeAlignments(alignments);
        assert.equal(chain && chain.alignment, "Portal***Rocks");
        assert.equal(chain && chain.uniprotStart, 2);
        assert.equal(chain && chain.uniprotEnd, 15);

        // gap, reverse ordered
        alignments = [
            initPdbAlignment("Rocks", 11),
            initPdbAlignment("Portal", 2)
        ];

        chain = mergeAlignments(alignments);
        assert.equal(chain && chain.alignment, "Portal***Rocks");
        assert.equal(chain && chain.uniprotStart, 2);
        assert.equal(chain && chain.uniprotEnd, 15);

        // gap, reverse ordered
        alignments = [
            initPdbAlignment("ThisIsTheEnd", 33),
            initPdbAlignment("Random", 2),
            initPdbAlignment("StarryNight", 22),
            initPdbAlignment("RockStar", 18),
            initPdbAlignment("WhatTheRock", 11)
        ];

        chain = mergeAlignments(alignments);
        assert.equal(chain && chain.alignment, "Random***WhatTheRockStarryNightThisIsTheEnd");
        assert.equal(chain && chain.uniprotStart, 2);
        assert.equal(chain && chain.uniprotEnd, 44);
    });
});
