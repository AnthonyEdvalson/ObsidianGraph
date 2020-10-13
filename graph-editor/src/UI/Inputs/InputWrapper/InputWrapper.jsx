import React from 'react';
import Label from '../../Label';
import Indent from '../../Indent';
import './InputWrapper.css';

function titleCase(str) {
    if (!str)
        return "";

    return str.split(' ').map(function(word) {
        let upper = word.toUpperCase();

        // If the word is all caps, we don't title case. This is because we want HTTPHeader to become HTTP Header
        // Without this check it would becoem Http Header, which looks so much worse.
        // Last char is not compared so that plural abbreviations like APIs will not be changed to Apis
        if (word.length >= 2 && word.substring(0, word.length - 1) === upper.substring(0, word.length - 1))
            return word;

        return upper[0] + word.substring(1).toLowerCase();
    }).join(' ');
}

function spaceText(str) {
    // Adds spaces to camel case, pascal case, snake case, etc. The following rules are used to add spaces:
    //
    // 1: All underscores and hyphens are replaced with spaces (piqant_chutney -> piquant chutney)
    // 2: Spaces are put between lowercase letters that precede any non-lowercase letter (piquantChutney -> piquant Chutney)
    // 3: Spaces are put between the last two capital letters in any series of capital letters if it is followed by a 
    //    lowercase letter. (ATMMachine -> ATM Machine). There is one exception, if the capitals are at the end of the string,
    //    and the last letter is 's', then no space is added (URIs -> URIs, but XIsBad -> X Is Bad)
    // 4: Spaces are put between any capital letter and a number (NUMBER1 -> NUMBER 1)
    // 5: Spaces are put between any number preceding a non-number (4Teen -> 4 Teen)

    return str.replace(/[-_]|(?<=[a-z])(?=[^a-z\s])|(?<=[A-Z])(?=[A-Z]([a-rt-z]|s.)|[0-9])|(?<=[0-9])(?=[^0-9\s])/g, " ");
}

function formatKey(key) {
    return titleCase(spaceText(key));
}

function InputWrapper(props) {
    let label = null;
    
    if (props.label !== null) {
        if (props.label === undefined && props.k !== undefined)
            label = (<Label>{formatKey(props.k)}</Label>);
        else if (props.label !== undefined)
            label = (<Label>{props.label}</Label>);
    }

    let body = props.children;

    if (label !== null) {
        body = (<Indent>{body}</Indent>);
    }

    return (
        <div className="InputWrapper ui-elem">
            {label}
            {body}
        </div>
    );
}

export default InputWrapper;