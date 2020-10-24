import React from 'react';

function Main({Item, config}) {
  let style = config();
  console.log(style);

  let classes = ["ui-Column"]
  if (style.wrapping)
    classes.push("ui-Column-" + style.wrapping);
  
  if (style.justify)
    classes.push("ui-Column-justify-" + style.justify);

  if (style.horizontalAlign)
    classes.push("ui-Column-items-" + style.horizontalAlign);
  
  if (style.columnJustify)
    classes.push("ui-Column-content-" + style.columnJustify);

	return (
        <div className={classes.join(" ")}>
            <Item />
        </div>
    )
}

export default { main: Main };
