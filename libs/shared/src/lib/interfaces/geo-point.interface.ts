/**
 * GeoJSON Point. coordinates are [longitude, latitude] — order matters for
 * MongoDB's 2dsphere index. Do not flip them.
 */
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}
