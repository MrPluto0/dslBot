/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 */
import { contextBridge } from 'electron';
import WebSocket from 'ws';

contextBridge.exposeInMainWorld('myAPI', {
  doAThing: () => {
    console.log('Bridge a thing.');
  },
  createSocket: (url) => {
    const ws = new WebSocket(url);
    ws.onopen = () => {
      console.log('Bridge Open Socket.');
      ws.onmessage = (res) => {
        console.log('receive', res);
      };
    };
    return ws;
  },
});
