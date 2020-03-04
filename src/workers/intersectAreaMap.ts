import { $authUser, $geo } from '@immosparrow/cockpit-api-v2';
import * as turf from '@turf/turf';
import intersect from '@turf/intersect';
const tvalid = require('turf-isvalid');
const ctx: Worker = self as any;

export const createPloigon = (data: Array<any>) => {
  let oneItem: any[] = [];
  if (data) {
    for (let e = 0, s = data.length; e < s; e += 1) {
      oneItem = [...oneItem, ...data[e].geom.coordinates];
    }
  }

  return turf.multiPolygon(oneItem);
};

ctx.onmessage = ({ data }) => {
  const { dataWorkspace, dataAgency } = data;

  const poly1 = createPloigon(dataWorkspace);
  const poly2 = createPloigon(dataAgency);
  if (tvalid(poly1) && tvalid(poly2)) {
    const intersectRes = intersect(poly1, poly2);
    ctx.postMessage({ intersectRes });
  }

};
