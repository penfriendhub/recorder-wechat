import * as PUPPET from 'wechaty-puppet';

export async function messageType (type: PUPPET.types.Message): Promise<string> {
    switch (type) {
        case PUPPET.types.Message.Attachment:
          return 'Attachment';
        case PUPPET.types.Message.Audio:
          return 'Audio';
        case PUPPET.types.Message.Contact:
          return 'Contact';
        case PUPPET.types.Message.ChatHistory:
          return 'ChatHistory';
        case PUPPET.types.Message.Emoticon:
          return 'Emoticon';
        case PUPPET.types.Message.Image:
          return 'Image';
        case PUPPET.types.Message.Text:
          return 'Text';
        case PUPPET.types.Message.Location:
          return 'Location';
        case PUPPET.types.Message.MiniProgram:
          return 'MiniProgram';
        case PUPPET.types.Message.GroupNote:
          return 'GroupNote';
        case PUPPET.types.Message.Transfer:
          return 'Transfer';
        case PUPPET.types.Message.RedEnvelope:
          return 'RedEnvelope';
        case PUPPET.types.Message.Recalled:
          return 'Recalled';
        case PUPPET.types.Message.Url:
          return 'Url';
        case PUPPET.types.Message.Video:
          return 'Video';
        case PUPPET.types.Message.Post:
          return 'Post';
        default:
          return 'Unknown';
      }
}

export interface MessageEvent {
    id: string;
    message: string;
    messageType: string;
    userId: string;
    userName: string;
    chatId: string;
    timestamp: number;
}