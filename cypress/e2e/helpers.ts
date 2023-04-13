export function setLoginInfo() {
  localStorage.setItem(
    'ftAuthLoginInfo',
    JSON.stringify({
      'ftbot.0': {
        botName: 'TestBot',
        apiUrl: 'http://localhost:3000',
        accessToken: 'access_token_tesst',
        refreshToken: 'refresh_test',
        autoRefresh: true,
      },
    }),
  );
  localStorage.setItem('ftSelectedBot', 'ftbot.0');
}

export function defaultMocks() {
  cy.intercept('**/api/v1/**', {
    statusCode: 200,
    headers: { 'access-control-allow-origin': '*' },
  }).as('RandomAPICall');

  cy.intercept('GET', '**/api/v1/ping', { fixture: 'ping.json' }).as('Ping');
  cy.intercept('GET', '**/api/v1/show_config', {
    fixture: 'show_config.json',
  }).as('ShowConf');
}
