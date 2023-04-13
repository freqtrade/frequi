describe('Login', () => {
  it('Is not logged in', () => {
    cy.visit('/');
    cy.get('button').should('contain', 'Login');
    cy.get('li').should('contain', 'No bot selected');
    cy.get('button').contains('Login').click();
    cy.get('.modal-title').contains('Login to your bot');
    // Test prefilled URL
    cy.get('input[id=url-input]').should('have.value', 'http://localhost:3000');
    cy.get('#name-input').should('exist');
    cy.get('#username-input').should('exist');
    cy.get('#password-input').should('exist');
    // Modal popup will use "OK" instead of "submit"
    cy.get('button[type=submit]').should('not.exist');
  });

  it('Explicit login page', () => {
    cy.visit('/login');
    cy.get('button').should('contain', 'Login');
    cy.get('li').should('contain', 'No bot selected');
    cy.get('.card-header').contains('Freqtrade bot Login');
    // Test prefilled URL
    cy.get('input[id=url-input]').should('have.value', 'http://localhost:3000');
    cy.get('input[id=name-input]').should('exist');
    cy.get('input[id=username-input]').should('exist');
    cy.get('input[id=password-input]').should('exist');
    cy.get('button[type=submit]').should('exist');
  });

  it('Redirect when not logged in', () => {
    cy.visit('/trade');
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/login');
      expect(loc.search).to.eq('?redirect=/trade');
    });
  });

  it('Test Login', () => {
    cy.visit('/login');
    cy.get('.card-header').contains('Freqtrade bot Login');
    cy.get('input[id=name-input]').type('TestBot');
    cy.get('input[id=username-input]').type('Freqtrader');
    cy.get('input[id=password-input]').type('SuperDuperBot');

    cy.intercept('**/api/v1/**', {
      statusCode: 200,
      body: { access_token: 'access_token_tesst', refresh_token: 'refresh_test' },
      headers: { 'access-control-allow-origin': '*' },
    }).as('RandomAPICall');
    cy.intercept(
      {
        method: 'Post',
        url: '**/api/v1/token/login',
      },
      {
        statusCode: 200,
        body: { access_token: 'access_token_tesst', refresh_token: 'refresh_test' },
        headers: { 'access-control-allow-origin': '*' },
      },
    ).as('login');

    cy.get('button[type=submit]')
      .click()
      .should(() => {
        const loginInfo = JSON.parse(localStorage.getItem('ftAuthLoginInfo') || '{}');
        const bot1 = 'ftbot.0';

        expect(loginInfo[bot1].botName).to.eq('TestBot');
        expect(loginInfo[bot1].botName).to.eq('TestBot');
        expect(loginInfo[bot1].apiUrl).to.eq('http://localhost:3000');
        expect(loginInfo[bot1].accessToken).to.eq('access_token_tesst');
        expect(loginInfo[bot1].refreshToken).to.eq('refresh_test');
      });
    // Forwarded to Main page
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/');
      expect(loc.search).to.eq('');
    });
    cy.get('button').should('contain', 'Add new bot');
    cy.get('span').should('contain', 'TestBot');
    // Check API calls have been made.
    cy.wait('@RandomAPICall');
    // login button gone
    cy.get('button').should('not.contain', 'Login');

    // Test logout
    cy.get('[id=avatar-drop]').parent().click();
    cy.get('.dropdown-menu > a:last').click();
    cy.get('button').should('contain', 'Login');
    // login button there again
  });

  it('Test Login failed - wrong api url', () => {
    cy.visit('/login');
    cy.get('.card-header').contains('Freqtrade bot Login');
    cy.get('input[id=name-input]').type('TestBot');
    cy.get('input[id=username-input]').type('Freqtrader');
    cy.get('input[id=password-input]').type('SuperDuperBot');

    cy.intercept('**/api/v1/**', {
      statusCode: 200,
      body: { access_token: 'access_token_tesst', refresh_token: 'refresh_test' },
      headers: { 'access-control-allow-origin': '*' },
    }).as('RandomAPICall');
    cy.intercept(
      {
        method: 'Post',
        url: '**/api/v1/token/login',
      },
      {
        statusCode: 404,
        body: { access_token: 'access_token_tesst', refresh_token: 'refresh_test' },
        headers: { 'access-control-allow-origin': '*' },
      },
    ).as('login');
    cy.get('button[type=submit]').click();
    cy.get('div').should('contain', 'Login failed.');

    cy.get('div').should('contain', 'API Url required');
  });

  it('Test Login failed - wrong password url', () => {
    cy.visit('/login');
    cy.get('.card-header').contains('Freqtrade bot Login');
    cy.get('input[id=name-input]').type('TestBot');
    cy.get('input[id=username-input]').type('Freqtrader');
    cy.get('input[id=password-input]').type('SuperDuperBot');

    cy.intercept('**/api/v1/**', {
      statusCode: 200,
      body: { access_token: 'access_token_tesst', refresh_token: 'refresh_test' },
      headers: { 'access-control-allow-origin': '*' },
    }).as('RandomAPICall');
    cy.intercept(
      {
        method: 'Post',
        url: '**/api/v1/token/login',
      },
      {
        statusCode: 401,
        body: { access_token: 'access_token_tesst', refresh_token: 'refresh_test' },
        headers: { 'access-control-allow-origin': '*' },
      },
    ).as('login');
    cy.get('button[type=submit]').click();
    cy.get('div').should('contain', 'Connected to bot, however Login');

    cy.get('div').should('contain', 'Name and Password are required.');
  });
});
