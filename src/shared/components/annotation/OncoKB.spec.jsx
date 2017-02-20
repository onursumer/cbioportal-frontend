import OncoKB from './OncoKB';
import React from 'react';
import { assert } from 'chai';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import {IndicatorQueryResp} from "../../api/OncoKbAPI";

describe('OncoKB', () => {

    before(()=>{

    });

    after(()=>{

    });

    it('OncoKB sortValue function', ()=>{

        let queryA = {
            oncogenic: 'Oncogenic'
        };

        let queryB = {
            oncogenic: 'Oncogenic'
        };
        assert.equal(OncoKB.sortValue(queryA), OncoKB.sortValue(queryB), 'Oncogenicity test 1');


        queryA.oncogenic = 'Oncogenic';
        queryB.oncogenic = 'Inconclusive';
        assert.isAbove(OncoKB.sortValue(queryA), OncoKB.sortValue(queryB), 'Oncogenicity test 2');

        queryA.oncogenic = 'Oncogenic';
        queryB.oncogenic = 'Unknown';
        assert.isAbove(OncoKB.sortValue(queryA), OncoKB.sortValue(queryB), 'Oncogenicity test 3');

        queryA.oncogenic = 'Oncogenic';
        queryB.oncogenic = 'Likely Neutral';
        assert.isAbove(OncoKB.sortValue(queryA), OncoKB.sortValue(queryB), 'Oncogenicity test 4');

        queryA.oncogenic = 'Inconclusive';
        queryB.oncogenic = 'Unknown';
        assert.isAbove(OncoKB.sortValue(queryA), OncoKB.sortValue(queryB), 'Oncogenicity test 5');

        queryA.oncogenic = 'Likely Neutral';
        queryB.oncogenic = 'Inconclusive';
        assert.isAbove(OncoKB.sortValue(queryA), OncoKB.sortValue(queryB), 'Oncogenicity test 6');

        queryA = {
            oncogenic: 'Unknown',
            vus: true
        };
        queryB = {
            oncogenic: 'Unknown',
            vus: false
        };
        assert.isAbove(OncoKB.sortValue(queryA), OncoKB.sortValue(queryB), 'A is VUS, which should have higher score.');

        queryA = {
            oncogenic: 'Oncogenic',
            highestSensitiveLevel: 'LEVEL_1'
        };
        queryB = {
            oncogenic: 'Oncogenic',
            highestSensitiveLevel: 'LEVEL_2A'
        };
        assert.isAbove(OncoKB.sortValue(queryA), OncoKB.sortValue(queryB), 'A(LEVEL_1) should be higher than B(LEVEL_2A)');

        queryA = {
            oncogenic: 'Oncogenic',
            highestResistanceLevel: 'LEVEL_R1'
        };
        queryB = {
            oncogenic: 'Oncogenic',
            highestResistanceLevel: 'LEVEL_R2'
        };
        assert.isAbove(OncoKB.sortValue(queryA), OncoKB.sortValue(queryB), 'A(LEVEL_R1) should be higher than B(LEVEL_R2)');

        queryA = {
            oncogenic: 'Oncogenic',
            highestSensitiveLevel: 'LEVEL_2A',
            highestResistanceLevel: ''
        };
        queryB = {
            oncogenic: 'Oncogenic',
            highestSensitiveLevel: '',
            highestResistanceLevel: 'LEVEL_R1'
        };
        assert.isAbove(OncoKB.sortValue(queryA), OncoKB.sortValue(queryB), 'A(LEVEL_2A) should be higher than B(LEVEL_R1)');

        queryA = {
            oncogenic: 'Oncogenic'
        };
        queryB = {
            oncogenic: 'Unknown',
            highestSensitiveLevel: 'LEVEL_2A'
        };
        assert.isAbove(OncoKB.sortValue(queryA), OncoKB.sortValue(queryB), 'The score for Oncogenic variant(A) should always higher than other categories(B) even B has treatments.');

        queryA = {
            variantExist: true
        };
        queryB = {
            variantExist: false
        };
        assert.isAbove(OncoKB.sortValue(queryA), OncoKB.sortValue(queryB), 'variantExist test 1');

        queryA = {
            variantExist: true
        };
        queryB = {
            variantExist: false,
            highestSensitiveLevel: 'LEVEL_2A'
        };
        assert.isAbove(OncoKB.sortValue(queryA), OncoKB.sortValue(queryB), 'variantExist test 2');
    });

});
