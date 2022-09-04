import { setLoginInfo, defaultMocks } from './helpers';

describe('Logs', () => {
  it('Displays and reloads logs', () => {
    ///
    defaultMocks();
    cy.intercept('GET', '**/api/v1/logs', { fixture: 'logs.json' }).as('Logs');
    setLoginInfo();

    cy.visit('/logs');
    cy.wait('@Ping');
    cy.wait('@ShowConf');
    cy.wait('@Logs');
    cy.get('textarea').should('contain.value', 'Checking exchange...');
    cy.get('button[id=refresh-logs]').click();
    cy.wait('@Logs');
  });
});
