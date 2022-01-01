describe('Login', () => {
  it('Is not logged in', () => {
    cy.visit('/');
    cy.get('button').should('contain', 'Login');
    cy.get('li').should('contain', 'No bot selected');
    cy.get('button').contains('Login').click();
    cy.get('.modal-title').contains('Login to your bot');
    // Check for prefill
    cy.get('input[id=url-input]').should('have.value', 'http://localhost:8080');
  });
});
