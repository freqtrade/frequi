import ValuePair from '@/components/general/ValuePair.vue';

describe('ValuePair.vue', () => {
  it('Renders a message', () => {
    const msg = 'Test description';
    cy.mount(ValuePair, { props: { description: msg } });

    cy.get('label').contains(msg);
  });
});
