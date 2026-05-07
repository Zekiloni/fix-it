import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GeoPoint } from '@fix-it/shared';

@Schema({ _id: false })
export class GeoPointSchemaClass implements GeoPoint {
  @Prop({ type: String, enum: ['Point'], required: true, default: 'Point' })
  type!: 'Point';

  @Prop({
    type: [Number],
    required: true,
    validate: {
      validator: (v: number[]) =>
        Array.isArray(v) &&
        v.length === 2 &&
        v[0] >= -180 && v[0] <= 180 &&
        v[1] >= -90 && v[1] <= 90,
      message: 'coordinates must be [lng, lat] within valid ranges',
    },
  })
  coordinates!: [number, number];
}

export const GeoPointSchema = SchemaFactory.createForClass(GeoPointSchemaClass);
