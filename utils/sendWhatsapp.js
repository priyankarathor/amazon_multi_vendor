const sendWhatsapp = async (phone, message) => {
  try {
    console.log(`Sending to ${phone}: ${message}`);
    return true;
  } catch (error) {
    console.log("sendWhatsapp error:", error);
    return false;
  }
};

module.exports = sendWhatsapp;