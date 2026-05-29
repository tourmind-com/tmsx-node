/**
 * TMSX hotel-API public surface.
 *
 *   import { Client } from '@tourmind-com/tmsx/hotel';
 */

export { Client } from './client.js';
export type {
  ClientOptions,
  Schemas,
  RegionListRequest, RegionListResponse,
  HotelDetailRequest, HotelDetailResponse,
  CheckRoomRateRequest, CheckRoomRateResponse,
  CreateOrderRequest, CreateOrderResponse,
  CancelOrderRequest, CancelOrderResponse,
  SearchOrderRequest, SearchOrderResponse,
  QueryBookingsRequest, QueryBookingsResponse,
  HotelStaticListRequest, HotelStaticListResponse,
  RoomTypeStaticRequest, RoomTypeStaticResponse,
} from './client.js';
