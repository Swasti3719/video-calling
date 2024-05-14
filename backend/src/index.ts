import { WebSocketServer , WebSocket } from "ws";

const wss = new WebSocketServer({port:8080}) ;

let senderSocket : null | WebSocket = null ;
let recieverSocket : null | WebSocket = null ;

wss.on('connection',function connection(ws){
    ws.on('error',console.error) ;

    ws.on('message',function message(data:any){
        const message = JSON.parse(data) ;
        if(message.type === 'sender'){
            senderSocket = ws ;
            console.log('sender selected') ;
        } 
        else if(message.type === 'receiver'){
            recieverSocket = ws ;
            console.log('reciever selected') ;
        }
        else if (message.type === 'createOffer'){
            if(ws !== senderSocket){
                return ;
            }
            console.log('offer created') ;
            recieverSocket?.send(JSON.stringify({ type : 'createOffer' , sdp : message.sdp }))
        }
        else if(message.type === 'createAnswer'){
            if(ws !== recieverSocket){
                return ;
            }
            console.log('answer created') ;
            senderSocket?.send(JSON.stringify({ type : 'createAnswer' , sdp : message.sdp }))
        }
        else if(message.type === 'iceCandidate'){
            if(ws===senderSocket){
                recieverSocket?.send(JSON.stringify({type:'iceCandidate' , candidate : message.candidate })) 
            } else if(ws === recieverSocket){
                senderSocket?.send(JSON.stringify({ type : 'iceCandidate' , candidate : message.candidate }))
            }
        }
    })
})