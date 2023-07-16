// setProfitLossColorsCSS
export function setProfitLossColorsCSS(preference: string) {
  const [colorProfit, colorLoss] =
    preference === 'greenUp' ? ['#12bb7b', '#ef5350'] : ['#ef5350', '#12bb7b'];
  document.documentElement.style.setProperty('--color-profit', colorProfit);
  document.documentElement.style.setProperty('--color-loss', colorLoss);
}
