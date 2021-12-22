/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */
const { expect } = require('chai');
const WebSocket = require('ws');

let wss;

// params:done can process the async test
describe('WebSocket测试', () => {
  // runs before all tests in this block
  before(() => {
    wss = new WebSocket.Server({ port: 8080 });
    // new connection
    wss.on('connection', (ws) => {
      ws.on('close', (code, reason) => {
        console.log('server closed: %d %s', code, reason);
      });
      ws.on('message', (message) => {
        console.log('server receive: %s', message);
        ws.send(message);
      });
    });
  });

  // runs after all tests in this block
  after(() => {
    wss.close();
  });

  // start the ws
  it('start server', (done) => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.on('open', () => {
      ws.send('OK');
      ws.on('message', (m) => {
        // expect "OK"
        expect(m.toString()).to.be.equal('OK');
        ws.close();
        done();
      });
    });
  });

  // update the onmessage function
  it('update test', (done) => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.on('open', () => {
      ws.onmessage = (m) => {
        console.log('update test1 %s', m.data);
        ws.onmessage = (m) => {
          console.log('update test2 %s', m.data);
          ws.close();
          done();
        };
      };
      ws.send('test1');
      ws.send('test2');
    });
  });

  // run close test
  it('close test', (done) => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.on('open', () => {
      ws.on('message', (m) => {
        console.log(m);
      });
      ws.close();
      done();
    });
  });

  // run alive max Num test
  it.skip('alive test', (done) => {
    const container = [];
    let count = 100;
    while (count) {
      container.push(new WebSocket('ws://localhost:8080'));
      count -= 1;
    }
    container.forEach((ws) => {
      if (ws.readyState === ws.OPEN) { ws.close(); }
    });
    done();
  });
});
