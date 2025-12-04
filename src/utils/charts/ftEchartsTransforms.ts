export const ftEchartsTransforms = {
  /**
   * Usage within dataset:
   * ``` ts
   * registerTransform(ftEchartsTransforms.multiple);
   * ...
   * transform: {
   *    type: 'ft:multiple',
   *    config: { dimension: 'someColumnName', factor: 100},
   *  },
   * ```
   */
  multiple: {
    // the tranform code
    type: 'ft:multiple',
    transform: function (params) {
      const rawData = params.upstream.cloneRawData();
      const { dimension, factor = 1, mode = 'objects' } = params.config; // add default case and error management
      const data =
        mode === 'objects'
          ? rawData.map((o) => ({ ...o, [dimension]: o[dimension] * factor }))
          : // Assume rawData is an array of arrays and dimension is the index
            rawData.map((row) => {
              return row.map((value, index) => (index === dimension ? value * factor : value));
            });
      console.log('ftEchartsTransforms.multiple', {
        rawData,
        data,
        dimension,
        us: params.upstream.cloneAllDimensionInfo(),
        factor,
      });
      return [
        {
          dimensions: params.upstream.cloneAllDimensionInfo(),
          data,
        },
      ];
    },
  },
};
