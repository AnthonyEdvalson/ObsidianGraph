import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';

import './TimeTravel.css';
import EventBlock from './EventBlock';
import Panner from '../Graphs/Panner/Panner';
import engine from '../../logic/engine';
import { useDispatch, useSelector } from 'react-redux';

let data = {
    0: mockRootEvent(-20, "app", -10),
    1: mockEvent(-19, "page1", 0,-18),
    2: mockEvent(-17, "page2", 0, -10),
    3: mockEvent(-15, "comp", 2, -14),
    4: mockEvent(-14, "comp2", 2, -12),
    5: mockEvent(-14, "call", 4, -13),

    6: mockRecallEvent(-8, "comp2", 2, -6, "something"),
    7: mockEvent(-8, "call", 6, -7),

    8: mockRecallEvent(-3, "comp2", 2),
    9: mockEvent(-1, "call", 8)
}

for (let [k, e] of Object.entries(data)) {
    let c = e.parent;
    let d = 0;
    while (c) {
        d += 1;
        c = data[c.id].parent
    }
    e.depth = d;
    e.id = k;
}

let start = moment() - 30000;

function TimeTravel() {
    let dispatch = useDispatch();
    let [now, setNow] = useState(moment());
    //let [profiles, setProfiles] = useState({});

    let profiles = useSelector(state => state.profiles);

    engine.useListener("profile", useCallback(profile => {
        console.log("PROFILE", profile)
        dispatch({type: "LOAD_PROFILE", data: profile });
        //setProfiles(prevState => util.graft(prevState, profile.id, profile));
    }, [dispatch]));

    useEffect(() => {
        let timer = setInterval(() => {
            setNow(moment());
        }, 1000 / 60);

        return () => clearInterval(timer);
    }, [setNow]);

    let [transform, setTransform] = useState({x: 0, y: 0, s: 1});

    let t = {
        scale: transform.s / 20,
        offset: start - (transform.x - 300) / (transform.s / 20)
    }

    return (
        <div className="TimeTravel">
            <Panner transform={transform} setTransform={setTransform} zoomSensitivity={5} no-transform>
                <div className="timeline">
                    {
                        Object.entries(profiles).map(([id, event]) => (
                            <EventBlock key={id} event={event} transform={t} now={now} />
                        ))
                    }
                </div>
            </Panner>
        </div>
    );
}

function mockRecallEvent(start, name, parent, end, error, type) {
    return mockRawEvent(start, name, {type: "recall", id: parent}, end, error, type);
}

function mockEvent(start, name, parent, end, error, type) {
    return mockRawEvent(start, name, {type: "call", id: parent}, end, error, type);
}

function mockRootEvent(start, name, end, error) {
    return mockRawEvent(start, name, null, end, error, "out");
}

function mockRawEvent(start, name, parent, end, error, type) {
    return {
        start: moment().add(start, "seconds"),
        name,
        parent,
        end: end ? moment().add(end, "seconds") : null,
        error,
        type
    }
}




export default TimeTravel;