import { createAddressCloud } from './lib/sdk';

const cloud = createAddressCloud(10);
console.log('Cloud created:', cloud.addresses.length);
