import { setLoginInfo, defaultMocks } from './helpers';

function webserverMocksForPairlistConfig() {
  cy.intercept('GET', '**/api/v1/show_config', {
    fixture: 'backtest/show_config_webserver.json',
  }).as('ShowConf');

  cy.intercept('GET', '**/api/v1/pairlists/available*', {
    fixture: 'pairlists_available.json',
  }).as('PairlistsAvailable');
  const jobID = 'c0578b6a-dd34-4bb7-b83c-492f02da2cfd';
  cy.intercept('POST', '**/api/v1/pairlists/evaluate', {
    status: 'Pairlist evaluation started in background.',
    job_id: jobID,
  }).as('EvaluateStart');

  cy.intercept('GET', `**/api/v1/background/${jobID}`, {
    job_id: jobID,
    job_category: 'pairlist',
    status: 'success',
    running: false,
    progress: null,
  }).as('FetchBGJob');

  cy.intercept('GET', `**/api/v1/pairlists/evaluate/${jobID}`, {
    error: null,
    status: 'success',
    result: {
      whitelist: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
      length: 3,
      method: ['VolumePairList'],
    },
  }).as('FetchPairlistResult');
}

describe('Pairlist Configurator', () => {
  it('Pairlist Configurator nav', () => {
    defaultMocks();
    webserverMocksForPairlistConfig();
    setLoginInfo();
    cy.visit('/');

    cy.wait('@ShowConf');
    cy.contains('Pairlist Config').should('exist').click();

    cy.wait('@PairlistsAvailable');
    cy.contains('VolumePairList').should('exist');
    cy.get('.available-pairlists > :nth-child(4)').should('contain', 'VolumePairList');
    // Assign volumePairlist to selected list
    cy.get('.available-pairlists > :nth-child(4) > button').click();
    // Result is disabled
    cy.get('.btn-group > :nth-child(3)').should('have.value', 'Results').should('be.disabled');
    // Is part of the output
    cy.get('.copy-container')
      .scrollIntoView()
      .should('be.visible')
      .should('contain', '"method": "VolumePairList",');

    cy.get('button').contains('Evaluate').click();

    cy.wait('@EvaluateStart');
    cy.wait('@FetchBGJob');
    cy.wait('@FetchPairlistResult');

    // Assert result view
    cy.get('.btn-group > :nth-child(3)')
      .should('have.value', 'Results')
      .should('be.enabled')
      .should('be.checked');

    cy.get('.copy-container')
      .should('be.visible')
      .should('contain', '"BTC/USDT",')
      .should('contain', '"ETH/USDT",')
      .should('contain', '"BNB/USDT"');
  });
});
