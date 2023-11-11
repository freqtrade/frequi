import { setLoginInfo, defaultMocks } from './helpers';

function tradeMocks() {
  cy.intercept('GET', '**/api/v1/status', { fixture: 'status_empty.json' }).as('Status');
  cy.intercept('GET', '**/api/v1/profit', { fixture: 'profit.json' }).as('Profit');
  cy.intercept('GET', '**/api/v1/trades*', { fixture: 'trades.json' }).as('Trades');
  cy.intercept('GET', '**/api/v1/balance', { fixture: 'balance.json' }).as('Balance');
  cy.intercept('GET', '**/api/v1/whitelist', { fixture: 'whitelist.json' }).as('Whitelist');
  cy.intercept('GET', '**/api/v1/blacklist', { fixture: 'blacklist.json' }).as('Blacklist');
  cy.intercept('GET', '**/api/v1/locks', { fixture: 'locks_empty.json' }).as('Locks');
  // TODO: Daily mock is missing.
  // cy.intercept('GET', '**/api/v1/daily', { fixture: 'performance.json' }).as('Performance');
}

describe('Dashboard', () => {
  it('Dashboard view', () => {
    defaultMocks();
    tradeMocks();
    setLoginInfo();

    cy.visit('/dashboard');
    cy.wait('@Ping');
    cy.wait('@Status');
    cy.wait('@Profit');
    cy.wait('@Balance');
    cy.wait('@Trades');
    cy.wait('@Whitelist');
    cy.wait('@Blacklist');
    cy.wait('@Locks');
    cy.get('.drag-header').contains('Bot comparison').should('be.visible');
    cy.get('.drag-header').contains('Daily Profit').should('be.visible');
    cy.get('.drag-header').contains('Open Trades').should('be.visible');
    cy.get('.drag-header').contains('Cumulative Profit').should('be.visible');

    // Assert Botcomparison content
    cy.get('span').contains('TestBot').should('be.visible');
    cy.get('span').contains('Summary').should('be.visible');
    // Scroll lower
    cy.get('.drag-header').contains('Closed Trades').scrollIntoView();
    cy.get('.drag-header').contains('Closed Trades').should('be.visible');
    cy.get('.drag-header').contains('Profit Distribution').should('be.visible');
    cy.get('.drag-header').contains('Trades Log').should('be.visible');
  });
});
