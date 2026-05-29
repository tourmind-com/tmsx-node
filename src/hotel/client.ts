/**
 * High-level Client for the TMSX hotel API.
 *
 * Same surface as `tmsx.hotel.Client` in the Python SDK: one method per
 * operation, auth injected automatically, body-level errors translated into
 * typed exceptions.
 */

import createClient from 'openapi-fetch';
import type { components, paths } from '../_generated/schema.js';
import { fromErrorCode, TMSXClientError, TMSXError } from '../exceptions.js';
import { type AuthConfig, createAuthMiddleware } from './auth.js';

const DEFAULT_BASE_URL = 'http://developers.tourmind.cn';

export type Schemas = components['schemas'];

// Convenience aliases for the request/response shapes callers will use.
export type RegionListRequest = Schemas['regionList.RegionListRequest'];
export type RegionListResponse = Schemas['regionList.RegionListResponse'];
export type HotelDetailRequest = Schemas['hotelDetail.HotelDetailRequest'];
export type HotelDetailResponse = Schemas['hotelDetail.HotelDetailResponse'];
export type CheckRoomRateRequest = Schemas['roomAvail.RoomAvailRequest'];
export type CheckRoomRateResponse = Schemas['roomAvail.RoomAvailResponse'];
export type CreateOrderRequest = Schemas['createOrder.CreateOrderRequest'];
export type CreateOrderResponse = Schemas['createOrder.CreateOrderResponse'];
export type CancelOrderRequest = Schemas['cancelOrder.CancelOrderRequest'];
export type CancelOrderResponse = Schemas['cancelOrder.CancelOrderResponse'];
export type SearchOrderRequest = Schemas['searchOrder.QueryOrderRequest'];
export type SearchOrderResponse = Schemas['searchOrder.QueryOrderResponse'];
export type QueryBookingsRequest = Schemas['searchOrder.QueryBookingsRequest'];
export type QueryBookingsResponse = Schemas['searchOrder.QueryBookingsResponse'];
export type HotelStaticListRequest = Schemas['hotelstatic.HotelStaticListRequest'];
export type HotelStaticListResponse = Schemas['hotelstatic.HotelStaticListResponse'];
export type RoomTypeStaticRequest = Schemas['roomStatic_model.RoomStaticRequest'];
export type RoomTypeStaticResponse = Schemas['roomStatic_model.RoomStaticResponse'];

export interface ClientOptions extends AuthConfig {
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

interface ApiErrorEnvelope {
  ErrorCode?: string;
  ErrorMessage?: string;
}

interface ResponseEnvelope {
  Error?: ApiErrorEnvelope;
  ResponseHeader?: { TransactionID?: string; ResponseTime?: string };
}

function checkForError<T extends ResponseEnvelope>(data: T): T {
  if (data && data.Error?.ErrorCode) {
    throw fromErrorCode(
      data.Error.ErrorCode,
      data.Error.ErrorMessage ?? 'TMSX API error',
      data.ResponseHeader?.TransactionID,
    );
  }
  return data;
}

export class Client {
  private readonly inner: ReturnType<typeof createClient<paths>>;

  constructor(options: ClientOptions) {
    const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    const client = createClient<paths>({
      baseUrl,
      fetch: options.fetch,
      headers: { Accept: 'application/json' },
    });
    client.use(createAuthMiddleware({
      agentCode: options.agentCode,
      username: options.username,
      password: options.password,
    }));
    this.inner = client;
  }

  // --- StaticData ---------------------------------------------------------

  async listRegions(body: RegionListRequest = {}): Promise<RegionListResponse> {
    const { data, error } = await this.inner.POST('/v2/RegionList', { body });
    return this.handle<RegionListResponse>(data, error);
  }

  async listHotels(body: HotelStaticListRequest): Promise<HotelStaticListResponse> {
    const { data, error } = await this.inner.POST('/v2/HotelStaticList', { body });
    return this.handle<HotelStaticListResponse>(data, error);
  }

  async listRoomTypes(body: RoomTypeStaticRequest): Promise<RoomTypeStaticResponse> {
    const { data, error } = await this.inner.POST('/v2/RoomStaticList', { body });
    return this.handle<RoomTypeStaticResponse>(data, error);
  }

  // --- Availability & Booking ---------------------------------------------

  async searchHotel(body: HotelDetailRequest): Promise<HotelDetailResponse> {
    const { data, error } = await this.inner.POST('/v2/HotelDetail', { body });
    return this.handle<HotelDetailResponse>(data, error);
  }

  async checkRoomRate(body: CheckRoomRateRequest): Promise<CheckRoomRateResponse> {
    const { data, error } = await this.inner.POST('/v2/CheckRoomRate', { body });
    return this.handle<CheckRoomRateResponse>(data, error);
  }

  async createOrder(body: CreateOrderRequest): Promise<CreateOrderResponse> {
    const { data, error } = await this.inner.POST('/v2/CreateOrder', { body });
    return this.handle<CreateOrderResponse>(data, error);
  }

  async searchOrder(body: SearchOrderRequest): Promise<SearchOrderResponse> {
    const { data, error } = await this.inner.POST('/v2/SearchOrder', { body });
    return this.handle<SearchOrderResponse>(data, error);
  }

  async queryBookings(body: QueryBookingsRequest): Promise<QueryBookingsResponse> {
    const { data, error } = await this.inner.POST('/v2/QueryBookings', { body });
    return this.handle<QueryBookingsResponse>(data, error);
  }

  async cancelOrder(body: CancelOrderRequest): Promise<CancelOrderResponse> {
    const { data, error } = await this.inner.POST('/v2/CancelOrder', { body });
    return this.handle<CancelOrderResponse>(data, error);
  }

  // --- Internals ----------------------------------------------------------

  private handle<T>(data: unknown, error: unknown): T {
    if (error) {
      if (error instanceof TMSXError) throw error;
      throw new TMSXClientError(
        typeof error === 'string' ? error : JSON.stringify(error),
      );
    }
    if (data === undefined) {
      throw new TMSXClientError('API returned an empty response body.');
    }
    return checkForError(data as T & ResponseEnvelope) as T;
  }
}
