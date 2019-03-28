//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {



    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private socketManager: egret.WebSocket;
    private sendButton: eui.Label;

    private onAddToStage(event: egret.Event) {

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {

            }
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        this.runGame().catch(e => {
            console.log(e);
        })



    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();
        const result = await RES.getResAsync("description_json")
        await platform.login();
        const userInfo = await platform.getUserInfo();
        console.log(userInfo);

    }

    private async loadResource() {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        this.socketManager = new egret.WebSocket();
        // this.socketManager.type = egret.WebSocket.TYPE_BINARY;
        this.socketManager.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onReceiveMessage, this);
        this.socketManager.addEventListener(egret.Event.CONNECT, this.onSocketOpen, this);
        this.socketManager.addEventListener(egret.Event.CLOSE, this.onSocketClose, this);
        this.socketManager.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onSocketError, this);
        this.socketManager.connect("echo.websocket.org", 80);

        this.sendButton = new eui.Label();
        this.sendButton.text = "发送消息";
        this.sendButton.textColor = 0xfff000;
        this.sendButton.touchEnabled = true;
        this.sendButton.width = 200;
        this.sendButton.height = 50;
        this.sendButton.addEventListener(egret.TouchEvent.TOUCH_TAP, this.sendMessage, this);
        this.sendButton.x = 10;
        this.sendButton.y = 10;
        this.addChild(this.sendButton);

    }

    private onReceiveMessage(e: egret.ProgressEvent) {
        console.log("receive message");
        // var byte: egret.ByteArray = new egret.ByteArray();
        // this.socketManager.readBytes(byte);
        // var msg: string = byte.readUTF();
        // var boo: boolean = byte.readBoolean();
        // var num: number = byte.readInt();

        // console.log(msg);
        // console.log(boo);
        // console.log(num);

        var msg = this.socketManager.readUTF();
        console.log(msg);
        var obj = JSON.parse(msg);
        console.log(obj.name);
        console.log(obj.age);
        console.log(obj.address);
        
    }

    private onSocketOpen(e: egret.Event) {
        console.log("open socket");
    }

    private onSocketClose(e: egret.Event) {
        console.log("close socket");
    }

    private onSocketError(e: egret.IOErrorEvent) {
        console.log("error socket");
    }

    private sendMessage(e: egret.Event) {

        console.log("send message");

        if (!this.socketManager.connected) {
            this.socketManager.connect("echo.websocket.org", 80);
            return ;
        }
        
        // var byte: egret.ByteArray = new egret.ByteArray();
        // byte.writeUTF("Hello egret WebSockt");
        // byte.writeBoolean(false);
        // byte.writeInt(1234);
        // byte.position = 0;

        // this.socketManager.writeBytes(byte, 0, byte.bytesAvailable);
        // this.socketManager.flush();

        var obj = {
            name: "qingsong",
            age: 100,
            address: "Beijing China"
        };

        var msg = JSON.stringify(obj);
        console.log(msg);
        this.socketManager.writeUTF(msg);
        this.socketManager.flush();

    }
}