function sendSuccess(res, data, status = 200) {
  return res.status(status).json({
    success: true,
    data
  });
}

function sendError(res, status, code, message, requestId) {
  const body = {
    success: false,
    message,
    code
  };

  if (requestId) {
    body.requestId = requestId;
  }

  return res.status(status).json(body);
}

module.exports = {
  sendSuccess,
  sendError
};
