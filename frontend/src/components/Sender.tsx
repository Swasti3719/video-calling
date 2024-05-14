import { useEffect, useState } from "react"

export const Sender = ()=>{

    const [socket,setSocket] = useState<null | WebSocket>(null) ;

    useEffect(()=>{
        const socket = new WebSocket('ws://localhost:8080') ;
        socket.onopen = ()=>{
            socket.send(JSON.stringify({type:'sender'})) ;
            console.log("Sender Selected")
        }
        setSocket(socket) ;
    },[]) ;

    async function startSendingVideo(){
        if(!socket) return ;
        const pc = new RTCPeerConnection() ;
        //onnego is used if there is any change in the sdp then re connect to the other person with new sdp like if video or audio is being added during a call 
        pc.onnegotiationneeded = async()=>{
            console.log("negotiation is going on")
            const offer = await pc.createOffer() ;
            await pc.setLocalDescription(offer) ;
            socket?.send(JSON.stringify({type:'createOffer' , sdp : pc.localDescription }))
        }
        pc.onicecandidate = (event)=>{
            // console.log(event) ;
            if(event.candidate){
                socket?.send(JSON.stringify({type:'iceCandidate' , candidate : event.candidate})) ;
            } 
        }
        socket.onmessage = async(event)=>{
            const message = JSON.parse(event.data) ;
            if(message.type === 'createAnswer'){
                console.log("recived from user 2")
                await pc.setRemoteDescription(message.sdp) ;
            }else if(message.type === 'icecandidate'){
                pc.addIceCandidate(message.candidate) ;
            }
        }
            console.log("video added") ;
            const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:false}) ;
            pc.addTrack(stream.getVideoTracks()[0]) ;
        
        
        
        // pc.addTrack(stream.getAudioTracks()[0]) ;
    }

    return <div>
        <button onClick={startSendingVideo}>Click to Connect</button>
    </div>
}