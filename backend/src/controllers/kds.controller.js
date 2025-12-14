const kdsService = require('../services/kds.service');
const { registerClient, removeClient, broadcastSnapshot } = require('../utils/kdsStream');
const { broadcastPosEvent } = require('../utils/posStream');

const listTicketsByStation = async (req, res, next) => {
  try {
    const data = await kdsService.listByStation(req.query.station);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const updateItemStatus = async (req, res, next) => {
  try {
    const data = await kdsService.updateItemStatus(req.params.id, req.body.status);
    res.json(data);
    broadcastSnapshot().catch(() => {});
    if (req.body.status === 'HOANTHANH') {
      broadcastPosEvent({ type: 'ITEM_DONE', itemId: req.params.id, station: req.query.station || null }).catch(() => {});
    }
  } catch (err) {
    next(err);
  }
};

const streamKds = async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');

  const clientId = registerClient(res);

  req.on('close', () => {
    removeClient(clientId);
  });
};

module.exports = { listTicketsByStation, updateItemStatus, streamKds };
