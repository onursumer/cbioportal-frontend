import * as React from "react";
import igv from 'igv/dist/igv.esm.js';
import autobind from "autobind-decorator";

type IGVProps = {
    tracks?: any[]; // TODO add typedef for tracks?
    width?: number;
    locus?: string|string[];
};

export default class IntegrativeGenomicsViewer extends React.Component<IGVProps, {}> {

    public static defaultProps = {
        genome: "hg19",
        locus: "all"
    };

    private igvDiv: HTMLDivElement|undefined;
    private igvBrowser: any;

    constructor(props: IGVProps) {
        super(props);
    }

    public render() {
        return (
            <div>
                <div ref={this.igvDivRefHandler} className="igvContainer" />
            </div>
        );
    }

    componentDidMount() {
        igv.createBrowser(this.igvDiv, this.props).then((browser: any) => {
            this.igvBrowser = browser;
        });
    }

    componentDidUpdate() {
        if (this.igvBrowser && this.props.locus) {
            this.igvBrowser.search(this.props.locus);
        }
    }

    @autobind
    private igvDivRefHandler(div:HTMLDivElement) {
        this.igvDiv = div;
    }
}
