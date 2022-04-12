function setLoginInfo() {
  localStorage.setItem(
    'ftAuthLoginInfo',
    JSON.stringify({
      'ftbot.0': {
        botName: 'TestBot',
        apiUrl: 'http://localhost:3000',
        accessToken: 'access_token_tesst',
        refreshToken: 'refresh_test',
        autoRefresh: true,
      },
    }),
  );
  localStorage.setItem('ftSelectedBot', 'ftbot.0');
}

function defaultMocks() {
  cy.intercept('**/api/v1/**', {
    statusCode: 200,
    // eslint-disable-next-line @typescript-eslint/camelcase
    headers: { 'access-control-allow-origin': '*' },
  }).as('RandomAPICall');

  cy.intercept('GET', '**/api/v1/ping', { fixture: 'ping.json' }).as('Ping');
  cy.intercept('GET', '**/api/v1/show_config', {
    fixture: 'backtest/show_config_backtest.json',
  }).as('ShowConf');
  cy.intercept('GET', '**/api/v1/strategies', { fixture: 'backtest/strategies.json' }).as(
    'Strategies',
  );
}

describe('Backtesting', () => {
  it.only('Is not logged in', () => {
    ///
    defaultMocks();
    setLoginInfo();

    cy.visit('/backtest');
    cy.wait('@Ping');
    cy.wait('@ShowConf');
    // cy.wait('@Strategies');
    cy.get('a').should('contain', 'Backtest');
    cy.contains('Run backtest');
    cy.contains('Strategy');
    const strategySelect = cy.get('select[id=strategy-select]');
    strategySelect.should('exist');
    strategySelect.select('SampleStrategy');
    cy.get('option[value=SampleStrategy]').should('exist');

    cy.intercept('POST', '**/api/v1/backtest', { fixture: 'backtest/backtest_post_start.json' }).as(
      'BacktestStart',
    );
    // cy.intercept('GET', '**/api/v1/backtest', { fixture: 'backtest/backtest_get_end.json' }).as(
    //   'BacktestPoll',
    // );
    cy.get('button[id=start-backtest]').click();
    cy.wait('@BacktestStart');
    // cy.wait('@BacktestPoll');
  });
});
