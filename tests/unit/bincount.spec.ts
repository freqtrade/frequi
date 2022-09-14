import { binData } from '@/shared/charts/binCount';

describe('binCount.ts', () => {
  it('Bins data as expected', () => {
    const testData = [1, 1, 2, 3, 5, 6, 8, 10];
    const res = binData(testData, 3);
    expect(res.length).toEqual(3);
    expect(res).toEqual([
      [1, 4],
      [4.03, 2],
      [7.06, 2],
    ]);
    expect(res.map((v) => v[1]).reduce((a, b) => a + b)).toEqual(testData.length);
    const res1 = binData(testData, 5);
    // expect(res1.length).toEqual(5);
    expect(res1).toEqual([
      [1, 3],
      [2.818, 1],
      [4.636, 2],
      [6.454, 1],
      [8.272, 1],
    ]);
    expect(res1.map((v) => v[1]).reduce((a, b) => a + b)).toEqual(testData.length);
  });

  it('Bins data with negatives', () => {
    const testData = [1, 1, 2, 3, 5, 6, 8, -1, -3, -5, -4];
    const res = binData(testData, 3);
    expect(res.length).toEqual(3);
    expect(res.map((v) => v[1]).reduce((a, b) => a + b)).toEqual(testData.length);
    expect(res).toEqual([
      [-5, 4],
      [-0.623, 4],
      [3.753, 3],
    ]);
  });
  it('Bins data performant', () => {
    const randomSize = 20000;
    const randomData = Array.from({ length: randomSize }, () => Math.floor(Math.random() * 10));
    const startTime = Date.now();
    const res = binData(randomData, 5);

    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(20);

    expect(res.map((v) => v[1]).reduce((a, b) => a + b)).toEqual(randomData.length);
  });
});
