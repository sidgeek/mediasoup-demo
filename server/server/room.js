const express = require("express");
const bodyParser = require("body-parser");
const Logger = require("../lib/Logger");

const logger = new Logger();

// Map of Room instances indexed by roomId.
// @type {Map<Number, Room>}
const rooms = new Map();

// Express application.
// @type {Function}
let expressApp;

/**
 * Create an Express based API server to manage Broadcaster requests.
 */
async function createExpressApp() {
  logger.info("creating Express app...");

  expressApp = express();

  expressApp.use(bodyParser.json());

  /**
   * For every API request, verify that the roomId in the path matches and
   * existing room.
   */
  expressApp.param("roomId", (req, res, next, roomId) => {
    // The room must exist for all API requests.
    if (!rooms.has(roomId)) {
      const error = new Error(`room with id "${roomId}" not found`);

      error.status = 404;
      throw error;
    }

    req.room = rooms.get(roomId);

    next();
  });

  /**
   * API GET resource that returns the mediasoup Router RTP capabilities of
   * the room.
   */
  expressApp.get("/rooms/:roomId", (req, res) => {
    const data = req.room.getRouterRtpCapabilities();

    res.status(200).json(data);
  });

  /**
   * POST API to create a Broadcaster.
   */
  expressApp.post("/rooms/:roomId/broadcasters", async (req, res, next) => {
    const { id, displayName, device, rtpCapabilities } = req.body;

    try {
      const data = await req.room.createBroadcaster({
        id,
        displayName,
        device,
        rtpCapabilities,
      });

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  });

  /**
   * DELETE API to delete a Broadcaster.
   */
  expressApp.delete(
    "/rooms/:roomId/broadcasters/:broadcasterId",
    (req, res) => {
      const { broadcasterId } = req.params;

      req.room.deleteBroadcaster({ broadcasterId });

      res.status(200).send("broadcaster deleted");
    }
  );

  /**
   * POST API to create a mediasoup Transport associated to a Broadcaster.
   * It can be a PlainTransport or a WebRtcTransport depending on the
   * type parameters in the body. There are also additional parameters for
   * PlainTransport.
   */
  expressApp.post(
    "/rooms/:roomId/broadcasters/:broadcasterId/transports",
    async (req, res, next) => {
      const { broadcasterId } = req.params;
      const { type, rtcpMux, comedia, sctpCapabilities } = req.body;

      try {
        const data = await req.room.createBroadcasterTransport({
          broadcasterId,
          type,
          rtcpMux,
          comedia,
          sctpCapabilities,
        });

        res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * POST API to connect a Transport belonging to a Broadcaster. Not needed
   * for PlainTransport if it was created with comedia option set to true.
   */
  expressApp.post(
    "/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/connect",
    async (req, res, next) => {
      const { broadcasterId, transportId } = req.params;
      const { dtlsParameters } = req.body;

      try {
        const data = await req.room.connectBroadcasterTransport({
          broadcasterId,
          transportId,
          dtlsParameters,
        });

        res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * POST API to create a mediasoup Producer associated to a Broadcaster.
   * The exact Transport in which the Producer must be created is signaled in
   * the URL path. Body parameters include kind and rtpParameters of the
   * Producer.
   */
  expressApp.post(
    "/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/producers",
    async (req, res, next) => {
      const { broadcasterId, transportId } = req.params;
      const { kind, rtpParameters } = req.body;

      try {
        const data = await req.room.createBroadcasterProducer({
          broadcasterId,
          transportId,
          kind,
          rtpParameters,
        });

        res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * POST API to create a mediasoup Consumer associated to a Broadcaster.
   * The exact Transport in which the Consumer must be created is signaled in
   * the URL path. Query parameters must include the desired producerId to
   * consume.
   */
  expressApp.post(
    "/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/consume",
    async (req, res, next) => {
      const { broadcasterId, transportId } = req.params;
      const { producerId } = req.query;

      try {
        const data = await req.room.createBroadcasterConsumer({
          broadcasterId,
          transportId,
          producerId,
        });

        res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * POST API to create a mediasoup DataConsumer associated to a Broadcaster.
   * The exact Transport in which the DataConsumer must be created is signaled in
   * the URL path. Query body must include the desired producerId to
   * consume.
   */
  expressApp.post(
    "/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/consume/data",
    async (req, res, next) => {
      const { broadcasterId, transportId } = req.params;
      const { dataProducerId } = req.body;

      try {
        const data = await req.room.createBroadcasterDataConsumer({
          broadcasterId,
          transportId,
          dataProducerId,
        });

        res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * POST API to create a mediasoup DataProducer associated to a Broadcaster.
   * The exact Transport in which the DataProducer must be created is signaled in
   */
  expressApp.post(
    "/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/produce/data",
    async (req, res, next) => {
      const { broadcasterId, transportId } = req.params;
      const { label, protocol, sctpStreamParameters, appData } = req.body;

      try {
        const data = await req.room.createBroadcasterDataProducer({
          broadcasterId,
          transportId,
          label,
          protocol,
          sctpStreamParameters,
          appData,
        });

        res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * Error handler.
   */
  expressApp.use((error, req, res, next) => {
    if (error) {
      logger.warn("Express app %s", String(error));

      error.status = error.status || (error.name === "TypeError" ? 400 : 500);

      res.statusMessage = error.message;
      res.status(error.status).send(String(error));
    } else {
      next();
    }
  });
}

module.exports = {
    createExpressApp,
    rooms, 
    expressApp 
};
// // export default createExpressApp;
// export { };
