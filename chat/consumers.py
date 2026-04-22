import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['user'].id
        self.other_user_id = self.scope['url_route']['kwargs']['room_name']

        # Hubinta IDs-ka si loo abuuro group magaciisu go'an yahay
        ids = sorted([int(self.user_id), int(self.other_user_id)])
        self.room_group_name = f'chat_{ids[0]}_{ids[1]}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # --- QAYBTA RECEIVE: Waxay maareysaa wax kasta oo ka yimaada Browser-ka ---
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        # 1. Haddii ay tahay fariin Chat (Qoraal, Sawir, ama Cod)
        if message_type == 'chat_message':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message_handler',
                    'message': data.get('message'),
                    'image': data.get('image'),
                    'voice_note': data.get('voice_note'),
                    'sender_id': self.user_id,
                }
            )

        # 2. Haddii ay tahay Signal-ka Wicitaanka (WebRTC)
        elif message_type == 'call_signal':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'call_signal_handler',
                    'data': data  # Waxay sidataa offer, answer, ama candidate
                }
            )

    # --- HANDLERS: Waxay fariinta u diraan dhinaca kale (Browser-ka kale) ---

    # Handler-ka Chat-ka (Fariimaha caadiga ah)
    async def chat_message_handler(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event.get('message'),
            'image': event.get('image'),
            'voice_note': event.get('voice_note'),
            'sender_id': event.get('sender_id'),
        }))

    # Handler-ka Wicitaanka (WebRTC Signaling)
    async def call_signal_handler(self, event):
        # Fariinta WebRTC si toos ah ugu gudbi dhinaca JavaScript-ka
        await self.send(text_data=json.dumps(event['data']))