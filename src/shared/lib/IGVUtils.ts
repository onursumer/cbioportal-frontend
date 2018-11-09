import {CopyNumberSeg} from "shared/api/generated/CBioPortalAPI";

export function defaultSegmentTrackProps()
{
    return {
        name: "CNA",
        type: "seg",
        displayMode: "COMPRESSED",
        mappings: {
            chr: "chromosome",
            value: "segmentMean",
            sample: "sampleId",
            sampleKey: "uniqueSampleKey"
        },
        features: []
    };
}

export function generateSegmentFileContent(segments: CopyNumberSeg[]): string
{
    const header = ["ID", "chrom", "loc.start", "loc.end", "num.mark", "seg.mean"];

    const rows = segments.map(segment =>
        [segment.sampleId, segment.chromosome, segment.start, segment.end, segment.numberOfProbes, segment.segmentMean]);

    // combine header and data rows, join row data with tabs, and then join rows with new lines
    return [header, ...rows].map(row => row.join("\t")).join("\n");
}
