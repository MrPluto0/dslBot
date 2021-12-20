/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */
const { expect } = require('chai');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

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

// params:done can process the async test
describe('WebSocket测试', () => {
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
          done();
        };
      };
      ws.send('test1');
      ws.send('test2');
    });
  });
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
  it('alive test', (done) => {
    let count = 100;
    while (count) {
      const ws = new WebSocket('ws://localhost:8080');
      count -= 1;
    }
    done();
  });
});
