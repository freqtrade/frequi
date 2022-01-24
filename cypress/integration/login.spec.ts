describe('Login', () => {
  it('Is not logged in', () => {
    cy.visit('/');
    cy.get('button').should('contain', 'Login');
    cy.get('li').should('contain', 'No bot selected');
    cy.get('button').contains('Login').click();
    cy.get('.modal-title').contains('Login to your bot');
    // Test prefilled URL
    cy.get('input[id=url-input]').should('have.value', 'http://localhost:8080');
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
    cy.get('input[id=url-input]').should('have.value', 'http://localhost:8080');
    cy.get('input[id=name-input]').should('exist');
    cy.get('input[id=username-input]').should('exist');
    cy.get('input[id=password-input]').should('exist');
    cy.get('button[type=submit]').should('exist');
  });

  it('Redirect when not logged in', () => {
    cy.visit('/trade');
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/login');
      expect(loc.search).to.eq('?redirect=%2Ftrade');
    });
  });

  it.only('Test Login', () => {
    cy.visit('/login');
    cy.get('input[id=name-input]').type('TestBot');
    cy.get('input[id=username-input]').type('Freqtrader');
    cy.get('input[id=password-input]').type('SuperDuperBot');

    cy.intercept('**/api/v1/**', {
      statusCode: 200,
      // eslint-disable-next-line @typescript-eslint/camelcase
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
        // eslint-disable-next-line @typescript-eslint/camelcase
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
        expect(loginInfo[bot1].apiUrl).to.eq('http://localhost:8080');
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
  });
});
