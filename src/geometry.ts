
import * as makerjs from 'makerjs'
import { RootState, ViewState } from './store/state';

const pixelsPerInch = 96

export function getGridScale(view: ViewState): number {
    var gridScale = 1;

    while (view.scale * gridScale < 6) gridScale *= 10;

    while (view.scale * gridScale > 60) gridScale /= 10;

    return gridScale * 10 * view.scale;
}

export function getCursorCoordinates(view: ViewState): makerjs.IPoint {
    const position = makerjs.point.subtract(view.cursor, view.panOffset)
    return makerjs.point.scale(position, 1 / view.scale)
}

export function naturalFit(state: RootState): ViewState {
    var view = { ...state.view }
    if ( !state.content.measurement ) {
        view.panOffset = makerjs.point.scale(view.viewSize, 0.5)
        return view
    }

    view.scale = 1
    view.panOffset = [0, 0]
    if (state.content.model && state.content.model.units) {
        //convert from units to Inch
        view.scale = makerjs.units.conversionScale(state.content.model.units, makerjs.unitType.Inch);
        //from inch to pixel
        view.scale *= pixelsPerInch;
    }
    view.panOffset = makerjs.point.scale(view.viewSize, 0.5)

    return view
}

export function screenFit(state: RootState): ViewState {
    var view = { ...state.view }
    if ( !state.content.measurement ) {
        view.panOffset = makerjs.point.scale(view.viewSize, 0.5)
        return view
    }

    const naturalSize = getNaturalSize(state.content.measurement)
    view.panOffset = [0, 0]
    const scaleHeight = view.viewSize[1] / naturalSize[1];
    const scaleWidth = view.viewSize[0] / naturalSize[0];
    view.scale = 0.5 * Math.min(scaleWidth, scaleHeight)
    view.panOffset = makerjs.point.scale(view.viewSize, 0.5)

    return view
}

export function getNaturalSize(measure: makerjs.IMeasureWithCenter) {
    return [measure.high[0] - measure.low[0], measure.high[1] - measure.low[1]]
}

export function renderOptions(view: ViewState) {
    const fontSize = 2
    return {
        origin: view.origin,
        annotate: true,
        flow: { size: 8 },
        svgAttrs: { "id": 'drawing' },
        fontSize: fontSize + 'px',
        useSvgPathOnly: false
    }
}