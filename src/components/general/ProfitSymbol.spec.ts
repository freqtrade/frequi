import { mount } from '@cypress/vue';
import ProfitSymbol from '@/components/general/ProfitSymbol.vue';

describe('ProfitSymbol.vue', () => {
  let cmp;

  it('calculates isProfitable with negative profit', async () => {
    mount(ProfitSymbol, { propsData: { profit: -0.5 } });

    cy.get('div').should('have.class', 'triangle-down');
    cy.get('div').should('not.have.class', 'triangle-up');
  });
  it('calculates isProfitable with positive profit', async () => {
    mount(ProfitSymbol, { propsData: { profit: 0.5 } });
    cy.get('div').should('have.class', 'triangle-up');
    cy.get('div').should('not.have.class', 'triangle-down');
  });
});
