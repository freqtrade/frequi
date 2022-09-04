import { setLoginInfo, defaultMocks } from './helpers';

function tradeMocks() {
  cy.intercept('GET', '**/api/v1/status', { fixture: 'status_empty.json' }).as('Status');
  cy.intercept('GET', '**/api/v1/profit', { fixture: 'profit.json' }).as('Profit');
  cy.intercept('GET', '**/api/v1/trades*', { fixture: 'trades.json' }).as('Trades');
  cy.intercept('GET', '**/api/v1/balance', { fixture: 'balance.json' }).as('Balance');
  cy.intercept('GET', '**/api/v1/whitelist', { fixture: 'whitelist.json' }).as('Whitelist');
  cy.intercept('GET', '**/api/v1/blacklist', { fixture: 'blacklist.json' }).as('Blacklist');
  cy.intercept('GET', '**/api/v1/locks', { fixture: 'locks_empty.json' }).as('Locks');
  cy.intercept('GET', '**/api/v1/performance', { fixture: 'performance.json' }).as('Performance');
}

describe('Trade', () => {
  it('Trade view', () => {
    defaultMocks();
    tradeMocks();
    setLoginInfo();

    cy.visit('/trade');
    cy.wait('@Ping');
    cy.wait('@Status');
    cy.wait('@Profit');
    cy.wait('@Balance');
    cy.wait('@Trades');
    cy.wait('@Whitelist');
    cy.wait('@Blacklist');
    cy.wait('@Locks');
    cy.wait('@Performance');
    cy.get('button').should('contain', 'BTC/USDT');
    cy.get('button').should('contain', 'ETH/USDT').should('be.visible');
    cy.get('button').contains('ETH/USDT').should('be.visible');

    cy.get('a[role="tab"]').contains('General').click();
    cy.get('button').contains('ETH/USDT').should('not.be.visible');
  });
});
