import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";

import { Server } from 'socket.io'
import { Message } from "src/models/message.dto";

@WebSocketGateway({
        cors: {
            origin: '*'
        }
    }
)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    afterInit(server: Server) {
        this.server = server;
        console.log('Initialized!')
        // this.server.on('disconnect', () => {
        //     console.log('Disconnected!')
        // })
        // this.server.on(`message`, (socket, message) => {
        //     console.log(`Received ${message}`);
        //     socket.broadcast.emit('messageRec', message);
        // })
    }

    @SubscribeMessage('message')
    receiveMessage(@ConnectedSocket() client, @MessageBody() message: Message){
        console.log(message);
        client.broadcast.emit('messageRec', message);
    }

    handleConnection(client: any, ...args: any[]) {
        console.log(`Client connected: ${client.id}`)
    }

    handleDisconnect(client: any) {
        console.log(`Client disconnected: ${client.id}`)
    }
    
}