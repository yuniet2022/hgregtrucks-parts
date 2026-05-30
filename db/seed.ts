import { getDb } from "../api/queries/connection";
import { parts } from "./schema";

const defaults = [
  { name: 'Cummins ISX15 Turbocharger', sku: 'HGP-ISX15-TBO', price: '1245.00', stock: 12, category: 'Engine', make: 'Kenworth', model: 'T680', yearFrom: 2015, yearTo: 2024, description: 'Genuine Cummins turbocharger for ISX15 engines. OEM quality replacement.', image: '/product-turbo.jpg', oemNumber: '288210500', brand: 'Cummins' },
  { name: 'Detroit DD15 Fuel Injector Set', sku: 'HGP-DD15-FIS', price: '890.00', stock: 8, category: 'Engine', make: 'Freightliner', model: 'Cascadia', yearFrom: 2012, yearTo: 2024, description: 'Complete set of 6 remanufactured fuel injectors for DD15 engines.', image: '/product-brake.jpg', oemNumber: 'A4720700287', brand: 'Detroit Diesel' },
  { name: 'PACCAR MX-13 Oil Pump', sku: 'HGP-MX13-OPM', price: '340.00', stock: 24, category: 'Engine', make: 'Peterbilt', model: '579', yearFrom: 2014, yearTo: 2024, description: 'High-volume oil pump for PACCAR MX-13 engines. Direct fit replacement.', image: '/product-turbo.jpg', oemNumber: '2109876PE', brand: 'PACCAR' },
  { name: 'Kenworth T680 LED Headlight Pair', sku: 'HGP-T680-LED', price: '285.00', stock: 18, category: 'Lighting', make: 'Kenworth', model: 'T680', yearFrom: 2013, yearTo: 2024, description: 'DOT approved LED headlight assembly pair for Kenworth T680.', image: '/product-brake.jpg', oemNumber: 'M10130', brand: 'Truck-Lite' },
  { name: 'Freightliner Cascadia Air Dryer', sku: 'HGP-CAD-ADR', price: '195.00', stock: 31, category: 'Air System', make: 'Freightliner', model: 'Cascadia', yearFrom: 2008, yearTo: 2024, description: 'Air dryer cartridge and assembly for Freightliner air brake systems.', image: '/product-turbo.jpg', oemNumber: '4324130010', brand: 'WABCO' },
  { name: 'Volvo D13 EGR Valve', sku: 'HGP-D13-EGR', price: '520.00', stock: 6, category: 'Emissions', make: 'Volvo', model: 'VNL 860', yearFrom: 2015, yearTo: 2024, description: 'EGR valve assembly for Volvo D13 engines. Includes gaskets.', image: '/product-brake.jpg', oemNumber: '21870635', brand: 'Volvo' },
  { name: 'Peterbilt 579 Chrome Bumper', sku: 'HGP-579-CBM', price: '1850.00', stock: 4, category: 'Body', make: 'Peterbilt', model: '579', yearFrom: 2012, yearTo: 2024, description: 'Show-quality chrome bumper with integrated fog light mounts.', image: '/product-turbo.jpg', oemNumber: 'M55105-1', brand: 'RoadWorks' },
  { name: 'Mack MP8 Water Pump', sku: 'HGP-MP8-WPM', price: '265.00', stock: 15, category: 'Cooling', make: 'Mack', model: 'Anthem', yearFrom: 2018, yearTo: 2024, description: 'Heavy-duty water pump for Mack MP8 engines with serpentine pulley.', image: '/product-brake.jpg', oemNumber: '21021700', brand: 'Mack' },
  { name: 'Kenworth T800 Air Spring', sku: 'HGP-T800-ASP', price: '145.00', stock: 42, category: 'Suspension', make: 'Kenworth', model: 'T800', yearFrom: 2005, yearTo: 2024, description: 'Rear air spring bellows for Kenworth T800 suspension systems.', image: '/product-turbo.jpg', oemNumber: 'W01-358-9949', brand: 'Firestone' },
  { name: 'International LT Brake Chamber', sku: 'HGP-LT-BRC', price: '95.00', stock: 27, category: 'Brake', make: 'International', model: 'LT Series', yearFrom: 2017, yearTo: 2024, description: 'Type 30/30 brake chamber for International LT Series trucks.', image: '/product-brake.jpg', oemNumber: 'GC3030LCW', brand: 'Gunite' },
  { name: 'Western Star 49X Fifth Wheel', sku: 'HGP-49X-FWH', price: '785.00', stock: 9, category: 'Chassis', make: 'Western Star', model: '49X', yearFrom: 2020, yearTo: 2024, description: 'Heavy-duty fifth wheel plate for Western Star 49X with release handle.', image: '/product-turbo.jpg', oemNumber: 'FW3500', brand: 'Fontaine' },
  { name: 'Isuzu NPR Starter Motor', sku: 'HGP-NPR-STR', price: '175.00', stock: 20, category: 'Electrical', make: 'Isuzu', model: 'NPR-HD', yearFrom: 2011, yearTo: 2024, description: '12V starter motor for Isuzu NPR-HD diesel engines.', image: '/product-brake.jpg', oemNumber: '8-98070-321-0', brand: 'Isuzu' },
];

async function seed() {
  const db = getDb();
  const existing = await db.select().from(parts);
  if (existing.length > 0) {
    console.log("Parts already seeded, skipping.");
    return;
  }
  await db.insert(parts).values(defaults);
  console.log(`Seeded ${defaults.length} parts.`);
}

seed().catch(console.error);
