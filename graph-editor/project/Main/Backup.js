import React, { useState, useEffect } from 'react';

function Main({tasks}) {
  let [data, setData] = useState(null);
  let refresh = () => tasks().readAll().then(setData);
  useEffect(refresh, []);
  return data ? (
      <div>
        { data.map(item => (
          <div>
            {item.title} - {item.description}
            <button onClick={() => tasks().del(item.id).then(refresh)}>Delete</button>
          </div>
        ))}
        <button onClick={() => tasks().create({title: "ABC", description: new Date().toString()}).then(refresh)}>Add</button>
      </div>
    ) : "Loading...";
}

export default { main: Main };