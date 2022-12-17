import ProfitPill from './ProfitPill.vue';

describe('ProfitPill.vue', () => {
  it('Shows a Green pill with positive profits', () => {
    cy.mount(ProfitPill, {
      props: {
        profitRatio: 0.051,
        profitAbs: 0.1,
        profitDesc: '',
        stakeCurrency: 'USDT',
      },
    });
    cy.get('div').should('have.class', 'profit-pill-profit').should('be.visible');
    cy.get('div').should('contain', '5.10%');
    cy.get('div').should('contain', '(0.1)');
    cy.get('span').should('have.attr', 'title', 'USDT');
  });
  it('Shows a Red pill with positive profits', () => {
    cy.mount(ProfitPill, {
      props: {
        profitRatio: -0.1,
        profitAbs: -0.1,
        profitDesc: '',
        stakeCurrency: 'USDT',
      },
    });

    cy.get('div').should('not.have.class', 'profit-pill-profit').should('be.visible');
    cy.get('div').should('have.class', 'profit-pill').should('be.visible');
    cy.get('div').should('contain', '-10.00%');
    cy.get('div').should('contain', '(-0.1)');
    cy.get('span').should('have.attr', 'title', 'USDT');
  });
  it('Shows a pill with 0.0 profits.', () => {
    cy.mount(ProfitPill, {
      props: {
        profitRatio: 0.0,
        profitAbs: 0.0,
        profitDesc: '',
        stakeCurrency: 'BTC',
      },
    });

    cy.get('div').should('have.class', 'profit-pill').should('be.visible');
    cy.get('div').should('contain', '0.00%');
    cy.get('div').should('contain', '(0)');
    cy.get('span').should('have.attr', 'title', 'BTC');
  });
  it('Shows a pill without relative profits.', () => {
    cy.mount(ProfitPill, {
      props: {
        profitRatio: undefined,
        profitAbs: 223,
        profitDesc: '',
        stakeCurrency: 'USDT',
      },
    });

    cy.get('div').should('have.class', 'profit-pill').should('be.visible');
    // cy.get('div').should('not.contain', '%');
    cy.get('div').should('contain', '223');
    cy.get('span').should('have.attr', 'title', 'USDT');
  });
});
