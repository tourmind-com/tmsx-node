/**
 * Canonical TMSX hotel API flow against the public sandbox, in <30 lines.
 *
 * Run:
 *   npm run example
 */

// Inside this repo we import via the relative path; consumers use `@tourmind-com/tmsx/hotel`.
import { Client } from '../src/hotel/index.js';

async function main(): Promise<void> {
  const client = new Client({
    agentCode: 'tms_test',
    username: 'tms_test',
    password: 'tms_test',
    baseUrl: 'http://developers.tourmind.cn',
  });

  // 1) List regions filtered by country.
  const regions = await client.listRegions({ CountryCode: 'CN' });
  const sample = regions.RegionListResult?.Regions?.[0];
  if (!sample) throw new Error('no regions returned');
  console.log(`region: id=${sample.RegionID} name=${sample.Name}`);

  // 2) Search a known sandbox hotel ~30 days out.
  const futureIso = (offsetDays: number): string => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  };
  const hotelResp = await client.searchHotel({
    CheckIn: futureIso(30),
    CheckOut: futureIso(31),
    HotelCodes: [766917],
    PaxRooms: [{ Adults: 1, Children: 0, RoomCount: 1 }],
  });
  const firstHotel = hotelResp.Hotels?.[0];
  if (!firstHotel) throw new Error('no hotels returned');
  console.log(`hotel: code=${firstHotel.HotelCode} room_types=${firstHotel.RoomTypes?.length}`);

  console.log('canonical-flow: ok');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
