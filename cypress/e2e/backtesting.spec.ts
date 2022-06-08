import { setLoginInfo, defaultMocks } from './helpers';

function backtestMocks() {
  cy.intercept('GET', '**/api/v1/show_config', {
    fixture: 'backtest/show_config_backtest.json',
  }).as('ShowConf');
  cy.intercept('GET', '**/api/v1/strategies', { fixture: 'backtest/strategies.json' }).as(
    'Strategies',
  );
}

describe('Backtesting', () => {
  it('Starts webserver mode', () => {
    ///
    defaultMocks();
    backtestMocks();
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
    cy.get('[id=bt-analyze-btn]').should('be.disabled');

    cy.intercept('POST', '**/api/v1/backtest', { fixture: 'backtest/backtest_post_start.json' }).as(
      'BacktestStart',
    );
    cy.intercept('GET', '**/api/v1/backtest', { fixture: 'backtest/backtest_get_end.json' }).as(
      'BacktestPoll',
    );
    cy.get('button[id=start-backtest]').click();
    cy.wait('@BacktestStart');
    cy.wait('@BacktestPoll');
    // All buttons are now enabled
    cy.get('[id=bt-analyze-btn]').should('be.enabled');
  });
});
