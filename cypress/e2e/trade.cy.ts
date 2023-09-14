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
  cy.intercept('POST', '**/api/v1/reload_config', { fixture: 'reload_config.json' }).as(
    'ReloadConfig',
  );
}

describe('Trade', () => {
  it('Trade view', { scrollBehavior: false }, () => {
    defaultMocks();
    tradeMocks();
    setLoginInfo();
    cy.viewport('macbook-11');

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
    cy.get('.drag-header').contains('Multi Pane').should('be.visible');
    cy.get('.drag-header').contains('Chart').should('be.visible');
    cy.get('button').should('contain', 'BTC/USDT');
    cy.get('button').should('contain', 'ETH/USDT').should('be.visible');
    cy.get('button').contains('ETH/USDT').should('be.visible');

    // Test messageBox behavior
    // No modal visible
    cy.get('.modal-dialog > .modal-content > .modal-footer > .btn-secondary')
      .filter(':visible')
      .should('have.length', 0);

    cy.get('button[title*="Stop Trading"]').click();
    // Modal open
    cy.get('.modal-dialog > .modal-content > .modal-footer > .btn-secondary')
      .filter(':visible')
      .contains('Cancel')
      .should('be.visible')
      .click();
    // Modal closed
    cy.get('.modal-dialog > .modal-content > .modal-footer > .btn-secondary')
      .filter(':visible')
      .should('have.length', 0);

    // General
    cy.get('button[role="tab"]').contains('General').click();
    cy.get('button').contains('ETH/USDT').should('not.be.visible');
    // 2nd segment
    cy.get('.drag-header').contains('Open Trades').scrollIntoView().should('be.visible');
    cy.get('.drag-header').contains('Closed Trades').scrollIntoView().should('be.visible');
    cy.get('span').contains('TRX/USDT').should('be.visible');
    cy.get('td').contains('8070.5').should('be.visible');
    // Scroll to top
    cy.contains('Multi Pane').scrollIntoView().should('be.visible');
    cy.get('button[title*="Reload Config "]').click();

    // Reload Modal open
    cy.get('.modal-dialog > .modal-content > .modal-footer > .btn-primary')
      .filter(':visible')
      .contains('Ok')
      .should('be.visible')
      .click();

    // Alert is visible
    cy.contains('Config reloaded successfully.').scrollIntoView().should('be.visible');
  });
});
