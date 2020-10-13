import React, { useState } from 'react';
import UI from '../../../../../UI';
import engine from '../../../../../logic/engine';


function Node(props) {
    return (
        <UI.Foldout label="Code Properties">
            <UI.PortsEditor k="inputs" nodeKey={props.nodeKey} typeOptions={["back", "data"]} />
            <NodeTest { ...props }></NodeTest>
        </UI.Foldout>
    );
}

function NodeTest(props) {
    let courier = engine.useCourier();

    let [testResults, setTestResults] = new useState();
    let [loading, setLoading] = new useState(false);
 
    let functionKey = props.nodeKey;
    let side = { front: "front", back: "back", agno: "back" }[props.data.type];

    let runTests = async () => {
        setLoading(true);
        let results;
        try {
            results = await courier.test(functionKey, side);
            setTestResults(results);
        }
        catch (error) {
            console.error(error)
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <UI.Button onClick={runTests}>Run Tests</UI.Button><br /><br />
            {
                loading ? (<span>Loading...</span>) : 
                testResults && testResults.map((result, i) => {
                    let errorMsg = null;
                    let className = "node-test-result";

                    if (result.threw)
                        errorMsg = <div className="node-test-error">{JSON.stringify(result.error)}</div>

                    if (result.pass)
                        className += " node-test-passed";
                    else
                        className += " danger";

                    if (result.type === "returns") {
                        return (
                            <div className={className} key={i}>
                                <UI.Foldout label={"Test #" + i}>
                                    { errorMsg }
                                    <div className="node-test-detail">
                                        <span>Expected: { JSON.stringify(result.expected) }</span>
                                        <span>Value: { JSON.stringify(result.value) }</span>
                                    </div>
                                </UI.Foldout>
                            </div>
                        )
                    }

                    return null;
                })
            }
        </div>
    )
}

export default Node;
