import ProfitSymbol from '@/components/general/ProfitSymbol.vue';

describe('ProfitSymbol.vue', () => {
  it('calculates isProfitable with negative profit', () => {
    cy.mount(ProfitSymbol, { propsData: { profit: -0.5 } });

    cy.get('div').should('have.class', 'triangle-down');
    cy.get('div').should('not.have.class', 'triangle-up');
  });
  it('calculates isProfitable with positive profit', () => {
    cy.mount(ProfitSymbol, { propsData: { profit: 0.5 } });
    cy.get('div').should('have.class', 'triangle-up');
    cy.get('div').should('not.have.class', 'triangle-down');
  });
});
