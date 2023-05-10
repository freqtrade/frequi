import ValuePair from '@/components/general/ValuePair.vue';

describe('ValuePair.vue', () => {
  it('Renders a message', () => {
    const msg = 'Test description';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    cy.mount(ValuePair, { props: { description: msg } });
    cy.get('label').contains(msg);
  });
});
