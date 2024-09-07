import React, { useRef, useEffect } from 'react';

function GetProgress(user, course) {
  return Math.random();
}

var ProgressBar = require('progressbar.js');


function ProgressB({ Progress, id }) {
  const progB = useRef(null);
  useEffect(() => {
    progB.current = new ProgressBar.Circle("#c"+id, {
      color: '#291716',
      // This has to be the same size as the maximum width to
      // prevent clipping
      strokeWidth: 4,
      trailWidth: 1,
      duration: 900,
      text: {
        autoStyleContainer: false
      },
      from: { color: '#ba170b', width: 5 },
      to: { color: '#ba170b', width: 5 },
      // Set default step function for all animate calls
      step: function (state, circle) {
        circle.path.setAttribute('stroke', state.color);
        circle.path.setAttribute('stroke-width', state.width);

        var value = Math.round(circle.value() * 100);
        if (value === 0) {
          circle.setText('');
        } else {
          circle.setText(value);
        }

      }
    });

    progB.current.animate(Progress);  // Number from 0.0 to 1.0
    return () => {
      progB.current.destroy();
      progB.current = null;
    };

  }, []);



  return (
    <div id={"c"+id} className='relative m-5 w-12 h-12'></div>)


}

export default ProgressB;