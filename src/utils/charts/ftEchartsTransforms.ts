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
      const { dimension, factor } = params.config; // add default case and error management
      const data = rawData.map((o) => ({ ...o, [dimension]: (o[dimension] * factor).toFixed(2) }));
      return [
        {
          dimensions: params.upstream.cloneAllDimensionInfo(),
          data,
        },
      ];
    },
  },
};
