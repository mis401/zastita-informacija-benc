import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from "@nestjs/websockets";
import { Server } from 'socket.io';
import { Message } from "src/models/message.dto";
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    afterInit(server: Server): void;
    receiveMessage(client: any, message: Message): void;
    handleConnection(client: any, ...args: any[]): void;
    handleDisconnect(client: any): void;
}
