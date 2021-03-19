import { app, BrowserWindow } from 'electron';
const express = require('express');
const expressApp = express();
const server = require('http').createServer(expressApp);
const io = require('socket.io')(server);

const createWindow = async () => {
  return new BrowserWindow({
    width: 1440,
    height: 900,
    center: true,
    kiosk: true,
    resizable: true,
    fullscreen: false,
    fullscreenable: true,
    webPreferences: {
      // node환경처럼 사용하기
      nodeIntegration: true,
      enableRemoteModule: true,
      // 개발자도구
      devTools: false,
      // same-origin정책 해제
      webSecurity: false,
    }
  });
};

app.whenReady().then(async () => {
  const mainWindow = await createWindow().then((win) => {
    server.listen(33058, () => {
      console.log('Socket IO server listening on port 33058')
    });
    return win;
  }); 

  if(mainWindow) {
    mainWindow.loadFile('index.html');
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    server.close(() => console.log('close'));
    app.quit();
  }
});

expressApp.get('/', (req, res) => {
  res.sendFile(__dirname + '/client.html');
})

/** 
 * socket. connection event handler 
 * connection이 수립되면 event handler function의 인자로 socket이 들어온다.
*/
/**
 * io.emit : 접속된 모든 클라이언트에게 메시지 전송
 * socket.emit : 메세지를 전송한 클라이언트에게만 메세지 전송
 * socket.broadcast.emit : 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메세지 전송
 * io.to(id).emit : 특정 클라이언트에게 메시지 전송 (id : socket 객체의 id 속성값)
 * 
 * emit = ('event_name', string or object);
 */
io.on('connection', (socket) => {
  console.info('socket connection');

  socket.emit('complate', 'connection complated');

  // 신호 수신
  socket.on('message', (msg) => {
    console.log('Message received: ', msg);

    io.emit('recMsg', {msg});
  })
})
