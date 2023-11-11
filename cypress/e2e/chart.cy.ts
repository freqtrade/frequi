import { setLoginInfo, defaultMocks } from './helpers';

function tradeMocks() {
  cy.intercept('GET', '**/api/v1/status', { fixture: 'status_empty.json' }).as('Status');
  cy.intercept('GET', '**/api/v1/profit', { fixture: 'profit.json' }).as('Profit');
  cy.intercept('GET', '**/api/v1/trades*', { fixture: 'trades.json' }).as('Trades');
  cy.intercept('GET', '**/api/v1/balance', { fixture: 'balance.json' }).as('Balance');
  cy.intercept('GET', '**/api/v1/whitelist', { fixture: 'whitelist.json' }).as('Whitelist');
  cy.intercept('GET', '**/api/v1/blacklist', { fixture: 'blacklist.json' }).as('Blacklist');
  cy.intercept('GET', '**/api/v1/locks', { fixture: 'locks_empty.json' }).as('Locks');
}

describe('Chart', () => {
  it('Chart view', { scrollBehavior: false }, () => {
    defaultMocks();
    tradeMocks();
    setLoginInfo();
    cy.viewport('macbook-11');

    cy.visit('/graph');
    cy.wait('@Ping');
    cy.wait('@Status');
    cy.wait('@Profit');
    cy.wait('@Balance');
    cy.wait('@Trades');
    cy.wait('@Whitelist');
    cy.wait('@Blacklist');
    cy.wait('@Locks');
    cy.wait('@PairCandles');
    // Disable autorefresh
    cy.get('input[title="AutoRefresh"]').click();

    cy.get('span').contains('NoActionStrategyFut | 1m').should('be.visible');

    cy.get('.form-check').contains('Heikin Ashi').click();

    // Reload triggers a new request
    cy.get('button[title*="Refresh chart"]').click();
    cy.wait('@PairCandles');
    // Disable Heikin Ashi
    cy.get('.form-check').contains('Heikin Ashi').click();
    // Default plotconfig exists
    cy.get('.form-select').get('option').contains('default').should('exist');
  });
});
