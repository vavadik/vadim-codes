import { initContract } from '@ts-rest/core';
import { healthContract } from './contracts/health.contract';
import { roomContract } from './contracts/room.contract';

const c = initContract();

export const contract = c.router({
  ...healthContract,
  room: roomContract,
});
