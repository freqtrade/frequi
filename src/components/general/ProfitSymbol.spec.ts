import { mount } from '@cypress/vue';
import ProfitSymbol from '@/components/general/ProfitSymbol.vue';
import { createLocalVue } from '@vue/test-utils';
import VueCompositionAPI from '@vue/composition-api';

const localVue = createLocalVue();
localVue.use(VueCompositionAPI);

describe('ProfitSymbol.vue', () => {
  it('calculates isProfitable with negative profit', () => {
    mount(ProfitSymbol, { localVue, propsData: { profit: -0.5 } });

    cy.get('div').should('have.class', 'triangle-down');
    cy.get('div').should('not.have.class', 'triangle-up');
  });
  it('calculates isProfitable with positive profit', () => {
    mount(ProfitSymbol, { localVue, propsData: { profit: 0.5 } });
    cy.get('div').should('have.class', 'triangle-up');
    cy.get('div').should('not.have.class', 'triangle-down');
  });
});
