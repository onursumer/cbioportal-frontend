import * as _ from 'lodash';
import $ from 'jquery';

// 3Dmol expects "this" to be the global context
const $3Dmol = require('imports?this=>window!3dmol/build/3Dmol-nojquery.js');

// TODO simplify this legacy data structure
export type SelectedResiduesToColor = {[color: string]: string[]};

// ideally these two types should be defined in 3Dmol.js lib.
// manually adding complete style and selector models is quite complicated,
// so defining them as "any" for now
export type AtomSelectionSpec = any;
export type AtomStyleSpec = any;

export enum ProteinScheme {
    CARTOON, SPACE_FILLING, TRACE, BALL_AND_STICK, RIBBON
}

// UNIFORM: single color, effective for all schemes
// SECONDARY_STRUCTURE: not effective for space-filling scheme
// ATOM_TYPE: effective only for space-filling scheme
// NC_RAINBOW: not effective for space-filling scheme
export enum ProteinColor {
    UNIFORM, SECONDARY_STRUCTURE, NC_RAINBOW, ATOM_TYPE
}

// SELECTED: display side chain for only selected mutations
// ALL: display side chain for all mapped mutations
// NONE: do not display side chain atoms
export enum SideChain {
    ALL, SELECTED, NONE
}

// MUTATION_TYPE: use mutation colors for type
// UNIFORM: use a single color
// NONE: do not color (use default atom colors)
export enum MutationColor {
    UNIFORM, MUTATION_TYPE, NONE
}

export interface IStructureVisualizerProps {
    chainId: string;
    proteinScheme: ProteinScheme;
    proteinColor: ProteinColor;
    sideChain: SideChain;
    mutationColor: MutationColor;
    // when set to false, restricts to protein only (hide other atoms)
    displayBoundMolecules: boolean;
    // PDB database URI
    pdbUri?: string;
    // base color of the whole structure
    baseColor?: string;
    // background color
    backgroundColor?: string;
    // colors for special structures
    // structure color takes effect only when corresponding flag is set
    structureColors?: {
        alphaHelix: string;
        betaSheet: string;
        loop: string;
    };
    // translucency (opacity) of the whole structure
    baseTranslucency?: number;
    // color of the selected chain
    chainColor?: string;
    // translucency (opacity) of the selected chain
    chainTranslucency?: number;
    // uniform color of the mutated residues
    uniformMutationColor?: string;
    // color of the user-selected mutations
    highlightColor?: string;
    // TODO position and color mapping...
}

export default class StructureVisualizerWrapper
{
    public static defaultProps = {
        pdbUri: "http://www.rcsb.org/pdb/files/",
        proteinScheme: ProteinScheme.CARTOON,
        displayBoundMolecules: true,
        backgroundColor: "#FFFFFF",
        baseColor: "#DDDDDD",
        structureColors: {
            alphaHelix: "#FFA500",
            betaSheet: "#0000FF",
            loop: "#DDDDDD"
        },
        baseTranslucency: 5,
        chainColor: "#888888",
        chainTranslucency: 0,
        proteinColor: ProteinColor.UNIFORM,
        mutationColor: MutationColor.MUTATION_TYPE,
        uniformMutationColor: "#8A2BE2",
        highlightColor: "#FFDD00",
        sideChain: SideChain.SELECTED
    };

    private _3dMolDiv: HTMLDivElement|undefined;
    private _3dMolViewer: any;
    private _props: IStructureVisualizerProps;

    // latest selection
    private _selector: AtomSelectionSpec;

    // latest style
    private _style: AtomStyleSpec;

    // latest color
    private _color: string;

    public static get PROTEIN_SCHEME_PRESETS(): {[scheme:number]: AtomStyleSpec}
    {
        const presets:{[scheme:number]: any} = {};

        presets[ProteinScheme.CARTOON] = {cartoon: {}};
        presets[ProteinScheme.TRACE] = {cartoon: {style: "trace"}};
        presets[ProteinScheme.SPACE_FILLING] = {sphere: {scale: 0.6}};
        presets[ProteinScheme.BALL_AND_STICK] = {stick: {}, sphere: {scale: 0.25}};
        presets[ProteinScheme.RIBBON] = {cartoon: {style: "ribbon"}};


        return presets;
    }

    constructor(div:HTMLDivElement, props:IStructureVisualizerProps)
    {
        this._3dMolDiv = div;
        this._props = {
            ...StructureVisualizerWrapper.defaultProps,
            ...props
        };

        this.updateViewer = this.updateViewer.bind(this);
    }

    public init(pdbId: string)
    {
        if (this._3dMolDiv) {
            this._3dMolViewer = $3Dmol.createViewer(
                $(this._3dMolDiv),
                {defaultcolors: $3Dmol.elementColors.rasmol}
            );

            const backgroundColor = this.formatColor(
                this._props.backgroundColor || StructureVisualizerWrapper.defaultProps.backgroundColor);
            this._3dMolViewer.setBackgroundColor(backgroundColor);
            this.loadPdb(pdbId);
        }
    }

    public loadPdb(pdbId: string, props:IStructureVisualizerProps = this._props)
    {
        const options = {
            doAssembly: true,
            // multiMode: true,
            // frames: true
        };

        if (this._3dMolViewer) {
            $3Dmol.download(`pdb:${pdbId.toUpperCase()}`, this._3dMolViewer, options, () => {
                this.updateViewer(props);
            });
        }
    }

    public updateViewer(props:IStructureVisualizerProps = this._props)
    {
        this._props = props;

        // TODO selection...
        const selection = {};

        this.updateVisualStyle(selection, props.chainId, props);

        this._3dMolViewer.render();
    }
    
    public selectAll()
    {
        this._selector = {};
    }

    public selectChain(chainId: string)
    {
        this._selector = {chain: chainId};
    }

    public setScheme(scheme: ProteinScheme)
    {
        this._style = StructureVisualizerWrapper.PROTEIN_SCHEME_PRESETS[scheme];
        this.applyStyleForSelector();
    }

    public setColor(color: string)
    {
        // save the color selection
        this._color = this.formatColor(color);

        if (this._style) {
            // update current style with color information
            _.each(this._style, (ele: AtomStyleSpec) => {
                ele.color = this._color;
            });
        }

        this.applyStyleForSelector();
    }

    protected formatColor(color: string)
    {
        // this is for 3Dmol.js compatibility
        // (colors should start with an "0x" instead of "#")
        return color.replace("#", "0x");
    }


    public setTransparency(transparency:number)
    {
        _.each(this._style, (ele: AtomStyleSpec) => {
            ele.opacity = (10 - transparency) / 10;
        });

        this.applyStyleForSelector();
    }

    public rainbowColor(chainId: string)
    {
        this._selector = {chain: chainId};
        this.setColor("spectrum");
    }

    public cpkColor(chainId: string)
    {
        this._selector = {chain: chainId};

        _.each(this._style, (ele: AtomStyleSpec) => {
            // remove previous single color
            delete ele.color;

            // add default color scheme
            ele.colors = $3Dmol.elementColors.defaultColors;
        });

        this.applyStyleForSelector();
    }

    public selectAlphaHelix(chainId: string)
    {
        this._selector = {chain: chainId, ss: "h"};
    }

    public selectBetaSheet(chainId: string)
    {
        this._selector = {chain: chainId, ss: "s"};
    }

    public hideBoundMolecules()
    {
        // since there is no built-in "restrict protein" command,
        // we need to select all non-protein structure...
        const selector = {
            resn: [
                "asp", "glu", "arg", "lys", "his", "asn", "thr", "cys", "gln", "tyr", "ser",
                "gly", "ala", "leu", "val", "ile", "met", "trp", "phe", "pro",
                "ASP", "GLU", "ARG", "LYS", "HIS", "ASN", "THR", "CYS", "GLN", "TYR", "SER",
                "GLY", "ALA", "LEU", "VAL", "ILE", "MET", "TRP", "PHE", "PRO"
            ],
            invert: true
        };

        const style = {sphere: {hidden: true}};

        this._3dMolViewer.setStyle(selector, style);
    }

    public enableBallAndStick()
    {
        // extend current style with ball and stick
        const style = _.extend({}, this._style, StructureVisualizerWrapper.PROTEIN_SCHEME_PRESETS[ProteinScheme.BALL_AND_STICK]);

        // use the latest defined color
        style.sphere.color = this._color;
        style.stick.color = this._color;

        // update style of the selection
        this._3dMolViewer.setStyle(this._selector, style);
    }

    /**
     * Updates the visual style (scheme, coloring, selection, etc.)
     */
    public updateVisualStyle(selection: SelectedResiduesToColor,
                             chainId: string,
                             props: IStructureVisualizerProps = this._props)
    {
        const defaultProps = StructureVisualizerWrapper.defaultProps;

        this.selectAll(); // select everything
        this.setScheme(props.proteinScheme); // show selected style view

        // do the initial (uniform) coloring

        this.setColor(props.baseColor || defaultProps.baseColor); // set base color
        //"translucent [" + _options.defaultTranslucency + "]; // set base opacity
        this.setTransparency(props.baseTranslucency || defaultProps.baseTranslucency);
        this.selectChain(chainId); // select the chain
        this.setColor(props.chainColor || defaultProps.chainColor); // set chain color
        //"translucent [" + _options.chainTranslucency + "];; // set chain opacity
        this.setTransparency(props.chainTranslucency || defaultProps.chainTranslucency);

        // additional coloring for the selected chain
        this.selectChain(chainId);

        if (props.proteinColor === ProteinColor.ATOM_TYPE)
        {
            this.cpkColor(chainId);
        }
        else if (props.proteinColor === ProteinColor.SECONDARY_STRUCTURE)
        {
            // color secondary structure (for the selected chain)
            this.selectAlphaHelix(chainId); // select alpha helices
            this.setColor((props.structureColors || defaultProps.structureColors).alphaHelix);
            this.selectBetaSheet(chainId); // select beta sheets
            this.setColor((props.structureColors || defaultProps.structureColors).betaSheet);
        }
        else if (props.proteinColor === ProteinColor.NC_RAINBOW)
        {
            // select the chain
            this.selectChain(chainId);

            // color the chain by rainbow coloring scheme (gradient coloring)
            this.rainbowColor(chainId);
        }

        // TODO simplify this, get rid of the map, just get an array of <position, color> pairs
        // process mapped residues
        _.each(_.keys(selection), (color:string) => {
            // select residues affected by mutations
            this.selectResidues(selection[color], chainId);

            // color each residue with a mapped color (this is to sync with diagram colors)

            // use the actual mapped color
            if (props.mutationColor === MutationColor.MUTATION_TYPE)
            {
                // color with corresponding mutation type color
                this.setColor(color);
            }
            // use a uniform color
            else if (props.mutationColor === MutationColor.UNIFORM)
            {
                // color with a uniform mutation color
                this.setColor(props.uniformMutationColor || defaultProps.uniformMutationColor);
            }
            // else: NONE (no need to color anything)

            // show/hide side chains
            this.updateSideChains(chainId,
                selection[color],
                props.sideChain === SideChain.ALL,
                props);
        });

        if (!props.displayBoundMolecules) {
            this.hideBoundMolecules();
        }
    }

    /**
     * Converts the given PDB position to residue code(s) for 3Dmol.js.
     */
    // TODO define a proper type for position
    public convertPdbPosToResCode(position: any): string[]
    {
        const residues:string[] = [];
        const startPdbPos = position.start.pdbPos || position.start.pdbPosition;
        const endPdbPos = position.end.pdbPos || position.end.pdbPosition;

        const start = parseInt(startPdbPos, 10);
        const end = parseInt(endPdbPos, 10);

        for (let i=start; i <= end; i++)
        {
            residues.push(`${i}`);
        }

        // TODO this may not be accurate if residues.length > 2

        if (position.start.insertion)
        {
            residues[0] += "^" + position.start.insertion;
        }

        if (residues.length > 1 &&
            position.end.insertion)
        {
            residues[residues.length - 1] += "^" + position.end.insertion;
        }

        return residues;
    }

    /**
     * Highlights provided residues.
     */
    public highlight(chainId: string,
                     residueCodes: string[],
                     color: string,
                     props: IStructureVisualizerProps = this._props)
    {
        // add highlight color
        this.selectResidues(residueCodes, chainId);
        this.setColor(color);

        const displaySideChain = props.sideChain !== SideChain.NONE;

        // update side chains (they need to be highlighted too)
        this.updateSideChains(chainId, residueCodes, displaySideChain, props);
    }

    /**
     * Highlights the provided PDB residues.
     */
    public highlightResidues(chainId: string,
                             positions: any[],
                             color: string,
                             props: IStructureVisualizerProps = this._props)
    {
        // highlight the selected residues
        if (!_.isEmpty(positions))
        {
            // convert positions to residue codes
            const residueCodes = this.convertPositionsToResCode(positions);

            this.highlight(chainId, residueCodes, color, props);
        }

    }

    protected convertPositionsToResCode(positions: any[])
    {
        const residueCodes:string[] = [];

        // convert positions to script positions
        _.each(positions, function(position: any) {
            residueCodes.push(this.convertPdbPosToResCode(position));
        });

        return residueCodes;
    };

    public selectResidues(residueCodes: string[], chainId: string)
    {
        this._selector = {rescode: residueCodes, chain: chainId};
    }

    public selectSideChains(residueCodes: string[], chainId: string)
    {
        // this is an approximation, we are not able to select side chain atoms,
        // so we are selecting all the atoms at given positions
        this._selector = {
            rescode: residueCodes,
            chain: chainId/*,
             atom: ["CA"]*/
        };
    }

    /**
     * Generates the script to show/hide the side chain for the given positions.
     * Positions can be in the form of "666" or "666:C", both are fine.
     */
    public updateSideChains(chainId: string,
                            residueCodes: string[],
                            displaySideChain: boolean,
                            props: IStructureVisualizerProps = this._props)
    {
        // display side chain (no effect for space-filling)
        if (!(props.proteinScheme === ProteinScheme.SPACE_FILLING))
        {
            // select the corresponding side chain and also the CA atom on the backbone
            this.selectSideChains(residueCodes, chainId);

            if (displaySideChain)
            {
                // display the side chain with ball&stick style
                this.enableBallAndStick();

                // TODO also color side chain wrt atom type (CPK)?
            }
        }
    };

    protected applyStyleForSelector()
    {
        this._3dMolViewer.setStyle(this._selector, this._style);
    }
}
