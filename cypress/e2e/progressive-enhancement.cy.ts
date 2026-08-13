describe('complementary browser coverage', () => {
  it('keeps core navigation and content available through native links', () => {
    cy.visit('/');

    cy.contains('h1', 'Mohamed Moheyeldin').should('be.visible');
    cy.contains('a', 'Resume').click();
    cy.url().should('include', '/resume/');
    cy.contains('h2', 'Core expertise').should('be.visible');
  });
});
