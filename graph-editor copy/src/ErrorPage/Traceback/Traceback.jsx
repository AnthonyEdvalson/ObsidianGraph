import React from 'react';
import './Traceback.css';

class Traceback extends React.Component{
	constructor(props) {
		super(props);
		this.open = this.open.bind(this);
	}

	open(frame)
	{
		this.props.remote.please("open", "source", {file: frame.file, lineno: frame.lineno});
	}

	render()
	{
		var tb = this.props.tb;
		var title = this.props.title;
		var found_first = false;
		tb.reverse();

		return (
			<div className="Traceback">
				<h2>{title}</h2>
				<div className="framebox">
					{tb.map((frame, i) => {
						var path = `${frame.file}:${frame.lineno.toString()}`;
						var first = false;

						if (frame.important) {
                            first = !found_first;
                            found_first = true;
							return (
								<div key={i} className={first ? "frame first" : "frame"} onClick={() => this.open(frame)}>
									<span className="name">{frame.frame}</span>
									<span className="path" title={path}>{path}</span>
									<span className="line">{frame.line}</span>
								</div>
							);
						}
						else
						{
							return (
								<div key={i} className="frame subtle" onClick={() => this.open(frame)}>
									<span className="name">{frame.frame}</span>
									<span className="path" title={path}>{path}</span>
								</div>
							);
						}
					})}
				</div>
			</div>
		);
	}
}

export default Traceback;
