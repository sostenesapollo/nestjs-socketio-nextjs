import { Logger, WebSocketAdapter } from '@nestjs/common';
import { JwtService } from '@integrations/jwt/jwt.service';
import {
  SubscribeMessage,
  WebSocketServer,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from '@domain/user/entities/user.entity';

@WebSocketGateway({ cors: true, namespace: 'app' })
export class AppGateway {
  constructor(private readonly jwtService: JwtService) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('orderUpdated')
  handleMessage(client: Socket, payload: string): void {
    // this.server.emit('orderUpdated', payload, client.id);
  }

  afterInit(server: Server) {
    this.logger.log('Init WS Gateway');
  }

  async handleConnection(client: Socket) {
    if (!client.handshake.headers.authorization) return;

    const user = this.jwtService.decode(
      client.handshake.headers.authorization,
    ) as User;
    
    if (!user || !user.companies?.at(0)?.company_base_id) return;
    const group = `company_base/${user.companies.at(0).company_base_id}`;
    client.join(group);
    const sockets = await client.in(group).allSockets();
    this.logger.log(
      `🟢 Client ${client.id} joined to group: ${group} | Total connected: ${sockets.size}`,
    );
  }

  async handleDisconnect(client: Socket) {
    if (!client.handshake.headers.authorization) return;
    const user = this.jwtService.decode(
      client.handshake.headers.authorization,
    ) as User;
    if (!user || !user.companies?.at(0)?.company_base_id) return;
    const group = `company_base/${user.companies.at(0).company_base_id}`;
    const sockets = await client.in(group).allSockets();

    this.logger.log(
      `🔴 Client disconnected to group: ${group} | Total connected: ${sockets.size}`,
    );
  }
}
