import { GeoCoordinates } from '@immosparrow/cockpit-api-v2';

export class MapPoint {
  id: string;
  coordinates: GeoCoordinates;
}

export class ViewPort {
  id: string;
  polygon: any[];
  name: 'Viewport';
  show: boolean;
  color: string;
}

export class MapShape {
  id: string;
  name: string;
  geom: any;
  type: number;
  addressId: string;
}
