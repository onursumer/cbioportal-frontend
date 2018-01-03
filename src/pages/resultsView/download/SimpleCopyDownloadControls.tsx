import * as React from 'react';
import fileDownload from 'react-file-download';
import {observer} from "mobx-react";
import {observable} from "mobx";
const Clipboard = require('clipboard');

export interface ISimpleCopyDownloadControlsProps {
    downloadData: () => string;
    downloadFilename?: string;
}

@observer
export class SimpleCopyDownloadControls extends React.Component<ISimpleCopyDownloadControlsProps, {}>
{
    @observable
    private showCopyMessage = false;

    constructor(props: ISimpleCopyDownloadControlsProps)
    {
        super(props);

        this.handleDownload = this.handleDownload.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
        this.handleAfterCopy = this.handleAfterCopy.bind(this);
    }

    public render()
    {
        return (
            <span>
                <a onClick={this.handleDownload} style={{marginRight: 10}}>
                    Download <i className='fa fa-cloud-download'/>
                </a>
                <a onClick={this.handleAfterCopy} ref={this.handleCopy} style={{marginRight: 10}}>
                    Copy <i className='fa fa-clipboard'/>
                </a>
                {this.showCopyMessage && <span className="alert-success">Copied!</span>}
            </span>
        );
    }

    private handleDownload()
    {
        fileDownload(this.props.downloadData(), this.props.downloadFilename || "file.txt");
    }

    private handleCopy(el: HTMLAnchorElement|null)
    {
        if (el) {
            new Clipboard(el, {
                text: this.props.downloadData
            });
        }
    }

    private handleAfterCopy()
    {
        this.showCopyMessage = true;

        // TODO set timeout to hide the message...
        setTimeout(() => {
            this.showCopyMessage = false;
        }, 3000);
    }
}