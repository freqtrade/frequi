import ValuePair from '@/components/general/ValuePair.vue';

describe('ValuePair.vue', () => {
  it('Renders a message', () => {
    const msg = 'Test description';
    // https://github.com/cypress-io/cypress/issues/26628
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    cy.mount(ValuePair, { props: { description: msg } });
    cy.get('label').contains(msg);
  });
});
