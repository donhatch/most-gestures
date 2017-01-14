import { merge } from 'most'

// based on http://jsfiddle.net/mattpodwysocki/pfCqq/
export function mouseDrags (mouseDowns$, mouseUps, mouseMoves, settings) {
  const {pixelRatio} = settings
  return mouseDowns$.flatMap(function (md) {
    // calculate offsets when mouse down
    let startX = md.offsetX * pixelRatio
    let startY = md.offsetY * pixelRatio
    // Calculate delta with mousemove until mouseup
    let prevX = startX
    let prevY = startY

    return mouseMoves
      .map(function (e) {
        let curX = e.clientX * pixelRatio
        let curY = e.clientY * pixelRatio

        let delta = {
          left: curX - startX,
          top: curY - startY,
          x: prevX - curX,
          y: curY - prevY
        }

        prevX = curX
        prevY = curY

        const normalized = {x: curX, y: curY}
        return {mouseEvent: e, delta, normalized, type: 'mouse'}
      })
      .takeUntil(mouseUps)
  })
}

export function touchDrags (touchStarts$, touchEnds$, touchMoves$, settings) {
  const {pixelRatio} = settings
  return touchStarts$
    .flatMap(function (ts) {
      let startX = ts.touches[0].pageX * pixelRatio
      let startY = ts.touches[0].pageY * pixelRatio

      let prevX = startX
      let prevY = startY

      return touchMoves$
        .map(function (e) {
          let curX = e.touches[0].pageX * pixelRatio
          let curY = e.touches[0].pageY * pixelRatio

          let x = (curX - startX)
          let y = (curY - startY)

          let delta = {
            left: x,
            top: y,
            x: (prevX - curX),
            y: (curY - prevY)
          }

          prevX = curX
          prevY = curY

          // let output = assign({}, e, {delta})
          const normalized = {x: curX, y: curY}
          return {mouseEvent: e, delta, normalized, type: 'touch'}
        })
        .takeUntil(touchEnds$)
    })
}

/* drag move interactions press & move(continuously firing)
*/
export function dragMoves ({mouseDowns$, mouseUps$, mouseMoves$, touchStarts$, touchEnds$, longTaps$, touchMoves$}, settings) {
  const dragMoves$ = merge(
    mouseDrags(mouseDowns$, mouseUps$, mouseMoves$, settings),
    touchDrags(touchStarts$, touchEnds$, touchMoves$, settings)
  )
  // .merge(merge(touchEnds$, mouseUps$).map(undefined))
  // .tap(e=>console.log('dragMoves',e))

  // .takeUntil(longTaps$) // .repeat() // no drag moves if there is a context action already taking place

  return dragMoves$
}
