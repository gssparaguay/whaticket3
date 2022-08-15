const getBodyButton = (msg: proto.IWebMessageInfo): string => {
  try {
    if (msg?.message?.buttonsMessage?.contentText) {
      let bodyMessage = `${msg?.message?.buttonsMessage?.contentText}`;
      // eslint-disable-next-line no-restricted-syntax
      for (const buton of msg.message?.buttonsMessage?.buttons) {
        bodyMessage += `\n\n${buton.buttonText.displayText}`;
      }
      return bodyMessage;
    }
    if (msg?.message?.listMessage) {
      let bodyMessage = `${msg?.message?.listMessage?.description}`;
      // eslint-disable-next-line no-restricted-syntax
      for (const buton of msg.message?.listMessage?.sections[0]?.rows) {
        bodyMessage += `\n\n${buton.title}`;
      }
      return bodyMessage;
    }
    if (msg.message?.viewOnceMessage?.message?.listMessage) {
      const obj = msg.message?.viewOnceMessage?.message.listMessage;
      let bodyMessage = `${obj.description}`;
      // eslint-disable-next-line no-restricted-syntax
      for (const buton of obj.sections[0]?.rows) {
        bodyMessage += `\n\n${buton.title}`;
      }

      return bodyMessage;
    }
    if (msg.message?.viewOnceMessage?.message?.buttonsMessage) {
      const obj = msg.message?.viewOnceMessage?.message.buttonsMessage;
      let bodyMessage = `${obj.contentText}`;
      // eslint-disable-next-line no-restricted-syntax
      for (const buton of obj?.buttons) {
        bodyMessage += `\n\n${buton.buttonText.displayText}`;
      }
      return bodyMessage;
    }
  } catch (error) {
    logger.error(error);
  }
};

const msgLocation = (
  image: ArrayBuffer,
  latitude: number,
  longitude: number
) => {
  if (image) {
    const b64 = Buffer.from(image).toString("base64");

    const data = `data:image/png;base64, ${b64} | https://maps.google.com/maps?q=${latitude}%2C${longitude}&z=17&hl=pt-BR|${latitude}, ${longitude} `;
    return data;
  }
};

export const getBodyMessage = (msg: proto.IWebMessageInfo): string | null => {
  try {
    const type = getTypeMessage(msg);
    if (!type) {
      console.log("não achou o  type 90");
      return;
    }

    const types = {
      conversation: msg.message.conversation,
      imageMessage: msg.message.imageMessage?.caption,
      videoMessage: msg.message.videoMessage?.caption,
      extendedTextMessage:
        getBodyButton(msg) ||
        msg.message.extendedTextMessage?.text ||
        msg.message?.listMessage?.description,
      buttonsResponseMessage:
        msg.message.buttonsResponseMessage?.selectedDisplayText,
      listResponseMessage:
        msg?.message?.listResponseMessage?.title || "Chegou Aqui",
      templateButtonReplyMessage:
        msg.message?.templateButtonReplyMessage?.selectedId,
      messageContextInfo:
        msg.message.buttonsResponseMessage?.selectedButtonId ||
        msg.message.listResponseMessage?.title,
      buttonsMessage:
        getBodyButton(msg) || msg.message.listResponseMessage?.title,
      stickerMessage: "sticker",
      contactMessage: msg.message.contactMessage?.vcard,
      contactsArrayMessage: "varios contatos",
      locationMessage: msgLocation(
        msg.message?.locationMessage?.jpegThumbnail,
        msg.message?.locationMessage?.degreesLatitude,
        msg.message?.locationMessage?.degreesLongitude
      ),
      liveLocationMessage: `Latitude: ${msg.message.liveLocationMessage?.degreesLatitude} - Longitude: ${msg.message.liveLocationMessage?.degreesLongitude}`,
      documentMessage: msg.message.documentMessage?.title,
      audioMessage: "Áudio",
      reactionMessage: msg.message?.reactionMessage?.text,
      ephemeralMessage:
        msg.message?.ephemeralMessage?.message?.extendedTextMessage?.text,
      protocolMessage: msg.message?.protocolMessage?.type,
      listMessage: getBodyButton(msg) || msg.message?.listMessage?.description,
      viewOnceMessage: getBodyButton(msg)
    };

    const objKey = Object.keys(types).find(objKeyz => objKeyz === type);

    if (!objKey) {
      logger.warn(`#### Nao achou o type em getBodyMessage: ${type}
${JSON.stringify(msg?.message)}`);
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, type });
      Sentry.captureException(
        new Error("Novo Tipo de Mensagem em getBodyMessage")
      );
    }

    return types[type];
  } catch (error) {
    Sentry.setExtra("Error getTypeMessage", { msg, BodyMsg: msg.message });
    Sentry.captureException(error);
    console.log(error);
  }
};
