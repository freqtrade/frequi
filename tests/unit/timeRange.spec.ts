import { describe, expect, it } from 'vitest';
import { inputToTimeRangePart, timeRangePartToInput } from '@/utils/timeRange';

describe('timeRange.ts', () => {
  it('parses date only timerange parts', () => {
    expect(timeRangePartToInput('20220427')).toEqual({ date: '2022-04-27', time: '' });
  });

  it('parses timerange parts with time', () => {
    expect(timeRangePartToInput('20220427T1105')).toEqual({ date: '2022-04-27', time: '11:05' });
    expect(timeRangePartToInput('20220427T110530')).toEqual({
      date: '2022-04-27',
      time: '11:05:30',
    });
    expect(timeRangePartToInput('20220427T0000')).toEqual({ date: '2022-04-27', time: '00:00' });
  });

  it('parses timestamps', () => {
    // 2022-04-27T11:05:00 UTC
    expect(timeRangePartToInput('1651057500')).toEqual({ date: '2022-04-27', time: '11:05' });
    expect(timeRangePartToInput('1651057500000')).toEqual({ date: '2022-04-27', time: '11:05' });
    expect(timeRangePartToInput('1651057530')).toEqual({ date: '2022-04-27', time: '11:05:30' });
    // 2022-04-27T00:00:00 UTC
    expect(timeRangePartToInput('1651017600')).toEqual({ date: '2022-04-27', time: '' });
  });

  it('returns null for empty or invalid parts', () => {
    expect(timeRangePartToInput('')).toBeNull();
    expect(timeRangePartToInput('2022-04-27')).toBeNull();
    expect(timeRangePartToInput('20220427T11')).toBeNull();
    expect(timeRangePartToInput('nonsense')).toBeNull();
  });

  it('formats date only parts', () => {
    expect(inputToTimeRangePart('2022-04-27')).toEqual('20220427');
    expect(inputToTimeRangePart('2022-04-27', '')).toEqual('20220427');
    // Midnight is equivalent to the date-only format
    expect(inputToTimeRangePart('2022-04-27', '00:00')).toEqual('20220427');
    expect(inputToTimeRangePart('2022-04-27', '00:00:00')).toEqual('20220427');
    expect(inputToTimeRangePart('2022-04-27', '12:00')).toEqual('20220427T1200');
    expect(inputToTimeRangePart('2022-04-27', '12:00:00')).toEqual('20220427T1200');
  });

  it('formats parts with time', () => {
    expect(inputToTimeRangePart('2022-04-27', '11:05')).toEqual('20220427T1105');
    expect(inputToTimeRangePart('2022-04-27', '11:05:00')).toEqual('20220427T1105');
    expect(inputToTimeRangePart('2022-04-27', '11:05:30')).toEqual('20220427T110530');
    expect(inputToTimeRangePart('2022-04-27', '00:00:30')).toEqual('20220427T000030');
  });

  it('ignores invalid input', () => {
    expect(inputToTimeRangePart('')).toEqual('');
    expect(inputToTimeRangePart('2022-04')).toEqual('');
    expect(inputToTimeRangePart('20220427', '11:05')).toEqual('');
    expect(inputToTimeRangePart('2022-04-27', '11')).toEqual('20220427');
  });

  it('roundtrips timerange parts', () => {
    for (const part of ['20220427', '20220427T1105', '20220427T110530']) {
      const parsed = timeRangePartToInput(part);
      expect(inputToTimeRangePart(parsed!.date, parsed!.time)).toEqual(part);
    }
  });
});
