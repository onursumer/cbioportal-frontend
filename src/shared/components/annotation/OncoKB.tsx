import * as React from 'react';
import DefaultTooltip from 'shared/components/DefaultTooltip';
import annotationStyles from "./styles/annotation.module.scss";
import oncogenicIconStyles from "./styles/oncogenicIcon.module.scss";
import {IndicatorQueryResp} from "../../api/OncoKbAPI";
import {oncogenicImageClassNames} from "../../lib/OncoKbUtils";

export interface IOncoKbProps {
    indicator?: IndicatorQueryResp;
}

export function placeArrow(tooltipEl: any) {
    const arrowEl = tooltipEl.querySelector('.rc-tooltip-arrow');
    arrowEl.style.left = '10px';
}

/**
 * @author Selcuk Onur Sumer
 */
export default class OncoKB extends React.Component<IOncoKbProps, {}>
{
    // TODO determine the method param and return value
    public static sortValue():number
    {
        return -1;
    }

    constructor(props: IOncoKbProps)
    {
        super(props);
        this.state = {};
    }

    public render()
    {
        let oncoKbContent:JSX.Element = (
            <span/>
        );

        if (this.props.indicator)
        {
            const arrowContent = <div className="rc-tooltip-arrow-inner"/>;
            const tooltipContent = <span>TODO: OncoKB Card Here!</span>;

            // TODO display icon wrt the indicator value
            oncoKbContent = (
                <DefaultTooltip
                    overlay={tooltipContent}
                    placement="topLeft"
                    trigger={['hover', 'focus']}
                    arrowContent={arrowContent}
                    onPopupAlign={placeArrow}
                >
                    <span className={`${annotationStyles["annotation-item"]}`}>
                        <i className={`${oncogenicIconStyles['oncogenic-icon-image']} ${this.oncogenicImageClassNames(this.props.indicator)}`} />
                    </span>
                </DefaultTooltip>
            );
        }

        return oncoKbContent;
    }

    public oncogenicImageClassNames(indicator:IndicatorQueryResp):string
    {
        let classNames:string[];

        if (indicator.oncogenic != null)
        {
            classNames = oncogenicImageClassNames(
                indicator.oncogenic,
                indicator.vus,
                indicator.highestSensitiveLevel,
                indicator.highestResistanceLevel
            );
        }
        else
        {
            classNames = oncogenicImageClassNames("N/A", false, "", "");
        }

        classNames = classNames.map(function(name) {
            return oncogenicIconStyles[name];
        });

        return classNames.join(' ');
    }
}
