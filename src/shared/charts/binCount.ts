export function binData(data: number[], bins: number) {
  const minimum = Math.min(...data);
  const maximum = Math.max(...data);
  const binSize = ((maximum - minimum) * 1.01) / bins;
  // console.log(`data ranges from ${minimum} to ${maximum}, binsize ${binSize}`);
  // Count occurances an array with [bucketStart, count in this bucket]
  const baseBins = [...Array(bins).keys()].map((i) => [
    Math.round((minimum + i * binSize) * 1000) / 1000,
    0,
  ]);
  // console.log(baseBins);
  for (let i = 0; i < data.length; i++) {
    const index = Math.min(Math.floor((data[i] - minimum) / binSize), bins - 1);
    // console.log(data[i], index)
    baseBins[index][1]++;
  }

  return baseBins;
}
