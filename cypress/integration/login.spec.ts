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
  });
  it('Explicit login page', () => {
    cy.visit('/login');
    cy.get('button').should('contain', 'Login');
    cy.get('li').should('contain', 'No bot selected');
    cy.get('.card-header').contains('Freqtrade bot Login');
    // Test prefilled URL
    cy.get('input[id=url-input]').should('have.value', 'http://localhost:8080');
    cy.get('#name-input').should('exist');
    cy.get('#username-input').should('exist');
    cy.get('#password-input').should('exist');
  });
  it('Redirect when not logged in', () => {
    cy.visit('/trade');
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/login');
      expect(loc.search).to.eq('?redirect=%2Ftrade');
    });
  });
});
