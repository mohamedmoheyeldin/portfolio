describe('complementary browser coverage', () => {
  it('keeps core navigation and content available through native links', () => {
    cy.visit('/');

    cy.contains('h1', 'Engineering confidence').should('be.visible');
    cy.contains('a', 'Explore my work').click();
    cy.url().should('include', '/work/');
    cy.contains('h2', 'Real delivery problems').should('be.visible');
    cy.contains('a', 'Federal Quality Delivery System').click();
    cy.url().should('include', '/work/federal-quality-delivery-system/');
    cy.contains('h2', 'How I shaped the system').should('be.visible');
  });
});
