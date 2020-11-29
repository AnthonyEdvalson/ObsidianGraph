import React from 'react';

function Main({Item, config}) {
  let style = config();
  console.log(style);

  let classes = ["ui-Row"]
  if (style.wrapping)
    classes.push("ui-Row-" + style.wrapping);
  
  if (style.justify)
    classes.push("ui-Row-justify-" + style.justify);

  if (style.horizontalAlign)
    classes.push("ui-Row-items-" + style.horizontalAlign);
  
  if (style.rowJustify)
    classes.push("ui-Row-content-" + style.rowJustify);

	return (
        <div className={classes.join(" ")}>
            <Item />
        </div>
    )
}

export default { main: Main };
