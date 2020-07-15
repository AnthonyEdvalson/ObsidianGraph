import React from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

function Modal(props) {
    let content = null;

    if (props.open) {
        content = (
            <div className="Modal">
                <div className="modal-dialog">
                    <span className="modal-header">{props.header}</span>
                    <div className="modal-body">
                        { props.children }
                    </div>
                </div>
            </div>
        );
    }

    return ReactDOM.createPortal(content, document.getElementById('modal-root'));
}

export default Modal;
