import { describe, it, expect } from 'vitest';
import {
  exportForTesting,
  timestampms,
  timestampmsWithTimezone,
  setTimezone,
  timestampToDateString,
  dateStringToTimeRange,
  timestampHour,
  dateFromString,
} from '@/shared/formatters';

const { getTimeZone } = exportForTesting;

// 1651057500000 = 2022-04-27T11:05:00+00:00

describe('timeformatter.ts', () => {
  it('sets timezone correctly', () => {
    expect(getTimeZone()).toEqual('UTC');
    expect(getTimeZone(undefined)).toEqual('UTC');
    setTimezone('CET');
    expect(getTimeZone()).toEqual('CET');
    setTimezone('UTC');
    expect(getTimeZone()).toEqual('UTC');
  });
  it('timestampmsWithTimezone convert correctly', () => {
    expect(getTimeZone(undefined)).toEqual('UTC');
    setTimezone('UTC');
    expect(timestampmsWithTimezone(1651057500000, 'CET')).toEqual('2022-04-27 13:05:00 (GMT+2)');
    expect(timestampmsWithTimezone(1651057500000, 'UTC')).toEqual('2022-04-27 11:05:00 (UTC)');
    expect(timestampmsWithTimezone(1651057500000)).toEqual('2022-04-27 11:05:00 (UTC)');
    setTimezone('UTC');
    expect(timestampmsWithTimezone(1651057500000)).toEqual('2022-04-27 11:05:00 (UTC)');
  });
  it('timestampms convert correctly', () => {
    setTimezone('UTC');
    expect(timestampms(1651057500000)).toEqual('2022-04-27 11:05:00');
    setTimezone('CET');
    expect(timestampms(1651057500000)).toEqual('2022-04-27 13:05:00');
  });
  it('timestampToDateString converts to date', () => {
    expect(timestampToDateString(1651057500000)).toEqual('2022-04-27');

    // Set close to midnight - so timezone matters
    // 2022-04-27T11:26:19 UTC
    const timestamp = 1651101979000;
    setTimezone('UTC');
    expect(timestampToDateString(timestamp)).toEqual('2022-04-27');
    setTimezone('CET');
    expect(timestampToDateString(timestamp)).toEqual('2022-04-28');
  });
  it('dateStringToTimeRange converts to correct timerange', () => {
    expect(dateStringToTimeRange('2022-04-28')).toEqual('20220428');
    expect(dateStringToTimeRange('2019-04-01')).toEqual('20190401');
  });
  it('timestampHour converts', () => {
    // Hour conversion
    setTimezone('UTC');
    expect(timestampHour(1651057500000)).toEqual(11);
    setTimezone('CET');
    expect(timestampHour(1651057500000)).toEqual(13);
  });
  it('dateFromString converts correctly', () => {
    expect(dateFromString('2022-04-04', 'yyyy-MM-dd')).toEqual(
      new Date('2022-04-04T00:00:00.000Z'),
    );
    expect(dateFromString('2023-02-08', 'yyyy-MM-dd')).toEqual(
      new Date('2023-02-08T00:00:00.000Z'),
    );
    expect(dateFromString('2022-12-31', 'yyyy-MM-dd')).toEqual(
      new Date('2022-12-31T00:00:00.000Z'),
    );
  });
});
